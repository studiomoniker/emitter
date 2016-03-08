export default class EventEmitter {
  constructor() {
    this._events = {};
  }

  _getEvents() {
    let events = this._events;
    if (!events)
      events = this._events = {};
    return events;
  }

  _getListeners(type, createIfMissing) {
    let events = this._getEvents();
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
    function emitListeners(listeners, args) {
      if (!listeners) return;
      listeners.slice().forEach((listener, index) => {
        if (listener._once) {
          if (listener._fired)
            return;
          listeners.splice(index, 1);
          listener._fired = true;
        }
        listener.apply(that, args);
      });
    }
    let that = this;
    let args = Array.prototype.slice.call(arguments, 1);
    let listeners = this._getListeners(type);
    // If there is no 'error' event listener then throw.
    if (type === 'error' && !listeners) {
      var error = arguments[1];
      if (error instanceof Error) {
        throw error; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
    emitListeners(listeners, args);
    emitListeners(this._any, [type, ...args]);
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
    this._getAnyListeners().push(listener);
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
    if (!type) {
      Object.keys(this._getEvents())
        .forEach(type => this.removeAllListeners(type));
      return this;
    } else {
      let listeners = this._getListeners(type);
      if (!listeners) return;
      listeners
        .slice()
        .forEach(listener => this.off(type, listener));
    }
    return this;
  }

  listenerCount(type) {
    return EventEmitter.listenerCount(this, type);
  }

  forwardEvents(emitter) {
    this.onAny(emitter.emit.bind(emitter));
  }

  static listenerCount(emitter, type) {
    const listeners = emitter.listeners(type);
    return listeners
      ? listeners.length
      : 0;
  }
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

function removeFromArray(array, object) {
  if (!array)
    return;
  const index = array.indexOf(object);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return index !== -1;
}
