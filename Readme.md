# emitter

Browser / Node compatible ES6 event emitter loosely based on Node's implementation with some added features:

- Forward events from emitter to emitter: `emitterA.on('event', emitterB)`
- Subscribe to all events: `emitter.onAny((type, ...args) => doSomething(type, args))`

## Install ##

```
npm install @studiomoniker/emitter
```

## Require ##

```javascript
import Emitter from '@studiomoniker/emitter';
```
