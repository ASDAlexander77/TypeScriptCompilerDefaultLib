const map1 = new Map<string, string>();
map1.set('k', 'one');
map1.set('k', 'two');

console.log(map1.get('k'));
// Expected output: "two"

assert(map1.get('k') == "two");

console.log(map1.size);
// Expected output: 1

assert(map1.size == 1);

console.log("ALL DONE");
