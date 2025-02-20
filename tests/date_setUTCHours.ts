//const event = new Date('August 19, 1975 23:15:30 GMT-3:00');
const event = new Date(177732930000);

console.log(event.toUTCString());
// Expected output: "Wed, 20 Aug 1975 02:15:30 GMT"

console.log(event.getUTCHours());
// Expected output: 2

event.setUTCHours(23);

console.log(event.toUTCString());
// Expected output: "Wed, 20 Aug 1975 23:15:30 GMT"

assert(event.getUTCHours() == 23);