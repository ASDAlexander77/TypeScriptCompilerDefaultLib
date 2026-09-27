// the methods of number, boolean and bigint have to be reachable from the DLL too (the JIT loads it)
const n: number = 2.5;
assert(n.toString() == "2.5");
assert(n.toFixed(1) == "2.5");
assert(n.toPrecision(2) == "2.5");
assert(n.toExponential(1).length > 0);

const b = true;
assert(b.toString() == "true");

const big: bigint = 5n;
assert(big.toString() == "5");
assert(big.toLocaleString().length > 0);

console.log("ALL DONE");
