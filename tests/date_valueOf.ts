const date1 = new Date(Date.UTC(96, 1, 2, 3, 4, 5));

console.log(date1.valueOf());
// Expected output: 823230245000

assert(date1.valueOf() == 823230245000);

//const date2 = new Date('02 Feb 1996 03:04:05 GMT');
const date2 = new Date(823230245000);

console.log(date2.valueOf());
// Expected output: 823230245000