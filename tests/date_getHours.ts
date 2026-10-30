//const birthday = new Date('March 13, 08 04:20');
// a local time: getHours is local
const birthday = new Date(2008, 2, 13, 4, 20);

console.log(birthday.getHours());
// Expected output: 4

assert(birthday.getHours() == 4);

console.log("ALL DONE");
