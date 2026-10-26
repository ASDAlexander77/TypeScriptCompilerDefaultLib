const map1 = new Map<string, number>();
map1.set('a', 1);
map1.set('b', 2);
map1.delete('a');

console.log(map1.size);
// Expected output: 1

assert(map1.size == 1);

const set1 = new Set<number>([1, 2, 3]);
set1.delete(2);
assert(set1.size == 2);

console.log("ALL DONE");
