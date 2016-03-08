// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

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
