const logEvents = require('./logEvents');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}

const myEmitter = new Emitter();

myEmitter.on('log', (msg) => logEvents(msg));
setTimeout(() => {
  myEmitter.emit('log', 'Log Event Emitted');
}, 2000);
