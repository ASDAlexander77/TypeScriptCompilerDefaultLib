const map1 = new Map<string, number>();
map1.set('bar', 42);

console.log(map1.get('bar'));
// Expected output: 42

assert(map1.get('bar') == 42);

const map2 = new Map<number, string>();
map2.set(1, 'foo');

console.log(map2.get(1));
// Expected output: "foo"

assert(map2.get(1) == "foo");

console.log("ALL DONE");
