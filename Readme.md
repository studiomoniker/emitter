# emitter

Browser / Node compatible ES6 event emitter loosely based on Node's implementation with some added features:

- Forward events from emitter to emitter: `emitterA.on('event', emitterB)`
- Subscribe to all events: `emitter.onAny((type, ...args) => doSomething(type, args))`

## Install ##

```
npm install @studiomoniker/emitter
```

## Examples ##

Listening for and emitting events:
```javascript
import Emitter from '@studiomoniker/emitter';

const emitter = new emitter();
emitter.on('foo', (message) => console.log(message));
emitter.emit('foo', 'bar');
```

Extending Emitter:
```javascript
import Emitter from '@studiomoniker/emitter';

class Animal extends Emitter {
  makeSound(sound) {
    this.emit('a loud ' + sound);
  }
}

let animal = new Animal();
animal.on('sound', (sound) => {
  console.log(sound); // a loud growl
});
animal.makeSound('growl');
```

Adding and removing events:
```javascript
import Emitter from '@studiomoniker/emitter';

function foo(message) {
  console.log('foo: ' + message);
}

const emitter = new Emitter();
emitter.on('foo', foo);
emitter.emit('foo', 'bar'); // Logs 'foo: bar'
emitter.off(foo);
emitter.emit('foo', 'bar'); // No longer logs 'foo: bar', because the listener was removed
```

Listen to all events:
```javascript
import Emitter from '@studiomoniker/emitter';

function logAll(eventName, message) {
  console.log(`${eventName}: ${message}`);
}

const emitter = new Emitter();
emitter.onAny(foo);
emitter.emit('foo', 'bar'); // Logs 'foo: bar'
emitter.emit('poo', 'bar'); // Logs 'poo: bar'
```

Forward events:
```javascript
import Emitter from '@studiomoniker/emitter';

function logAll(eventName, message) {
  console.log(`${eventName}: ${message}`);
}

const emitter = new Emitter();
const emitter2 = new Emitter();

// Forward 'message' events from emitter to emitter2:
emitter.on('message', emitter2);
emitter2.on('message', (message) => console.log('emitter2: ' + message));

emitter.emit('message', 'foo'); // Logs 'emitter2: foo'
```
