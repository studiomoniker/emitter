export default class Emitter {
  _getEvents() {
    let events = this._events;
    if (!events)
      events = this._events = {};
    return events;
  }

  _getListeners(type, createIfMissing) {
    const events = this._getEvents();
    let listeners = events[type];
    if (createIfMissing && !listeners)
      listeners = events[type] = [];
    return listeners;
  }

  _getAnyListeners(createIfMissing) {
    let any = this._any;
    if (createIfMissing && !any)
      any = this._any = [];
    return any;
  }

  emit(type) {
    function emitListeners(listeners, type, args) {
      if (!listeners) return;
      listeners.slice().forEach((listener, index) => {
        if (listener._once) {
          if (listener._fired)
            return;
          listeners.splice(index, 1);
          listener._fired = true;
        }
        if (!!listener.emit) {
          listener.emit.bind(listener).apply(that, [type, args]);
        } else {
          listener.apply(that, args);
        }
      });
    }
    const that = this;
    const args = Array.prototype.slice.call(arguments, 1);
    const listeners = this._getListeners(type);
    // If there is no 'error' event listener then throw.
    if (type === 'error' && !listeners) {
      const error = arguments[1];
      if (error instanceof Error) {
        throw error; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
    emitListeners(listeners, type, args);
    emitListeners(this._any, type, [type, ...args]);
  }

  on(type, listener) {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._getListeners('newListener'))
      this.emit('newListener', type, listener);
    let listeners = this._getListeners(type, true);
    listeners.push(listener);
    return this;
  }

  once(type, listener) {
    listener._once = true;
    this.on(type, listener);
  }

  onAny(listener) {
    this._getAnyListeners(true).push(listener);
    return this;
  }

  offAny(listener) {
    removeFromArray(this._getAnyListeners(), listener);
    return this;
  }

  off(type, listener) {
    let removed = removeFromArray(this._getListeners(type), listener);
    if (removed && this._getEvents().removeListener)
      this.emit('removeListener', type, listener);

    return this;
  }

  listeners(type) {
    let listeners = this._getListeners(type);
    return listeners ? listeners.slice() : [];
  }

  removeAllListeners(type) {
    let events = this._getEvents();
    if (!type) {
      Object.keys(events)
        .forEach(type => this.removeAllListeners(type));
      return this;
    } else {
      let listeners = this._getListeners(type);
      if (!listeners) return;
      listeners
        .slice()
        .forEach(listener => this.off(type, listener));
      delete events[type];
    }
    return this;
  }

  listenerCount(type) {
    return Emitter.listenerCount(this, type);
  }

  static listenerCount(emitter, type) {
    const listeners = emitter.listeners(type);
    return listeners
      ? listeners.length
      : 0;
  }
}

Emitter.Emitter = Emitter;
Emitter.prototype.addListener = Emitter.prototype.on;
Emitter.prototype.removeListener = Emitter.prototype.off;

function removeFromArray(array, object) {
  if (!array)
    return;
  const index = array.indexOf(object);
  const exists = index !== -1;
  if (exists)
    array.splice(index, 1);
  return exists;
}
