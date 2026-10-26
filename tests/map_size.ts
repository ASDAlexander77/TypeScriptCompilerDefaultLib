// not own: an untyped Map is Map<any, any>, which -mm=own refuses (use typed keys and values)
const map1 = new Map();

map1.set('a', 'alpha');
map1.set('b', 'beta');
map1.set('g', 'gamma');

console.log(map1.size);
// Expected output: 3

assert(map1.size == 3);

console.log("ALL DONE");
