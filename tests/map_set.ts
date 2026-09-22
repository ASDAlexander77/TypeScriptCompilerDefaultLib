const map1 = new Map<string, string>();
map1.set('bar', 'foo');

console.log(map1.get('bar'));
// Expected output: "foo"

console.log(map1.get('baz'));
// Expected output: undefined

assert(map1.get('baz') == undefined);

console.log("ALL DONE");
