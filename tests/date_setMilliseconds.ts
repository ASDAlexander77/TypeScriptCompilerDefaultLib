//const event = new Date('August 19, 1975 23:15:30');
const event = new Date(177718530000);

console.log(event.getMilliseconds());
// Expected output: 0

event.setMilliseconds(456);

console.log(event.getMilliseconds());
// Expected output: 456

assert(event.getMilliseconds() == 456);