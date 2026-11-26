// Array literals given straight to a constructor or a call (`new Set(["a" + i])`, `new Map([[k, v]])`), patterns of
// a Map, and fields passed straight to console.log, inside functions. Before the compiler fixes of 2026-11-26:
// - `new Set([...])` leaked the literal under every model (the constructor's parameter is optional, so it is
//   given `ts.OptionalValue` of the array, which nothing released), and under -mm=own a literal of strings alone
//   given to any call leaked as well;
// - `const [[k, v]] = map` was refused under every model (the element read out of an iterable is `T | undefined`);
// - under -mm=own `console.log(mk().value)` and `const v = mk().value; console.log(v)` were refused ("a value
//   takes a second reference").
// Runtime strings, not literals: a literal is immortal and hides a wrong count.
function setSize(i: number): number {
    return new Set<string>(["a" + i, "b" + i, "a" + i]).size;
}

function numberSetSize(i: number): number {
    return new Set<number>([i, i + 1, i]).size;
}

function mapPattern(i: number): string {
    const m = new Map<string, number>();
    m.set("k" + i, 1);
    m.set("l" + i, 2);
    const [[k0, v0], [k1, v1]] = m;
    return k0 + v0 + k1 + v1;
}

function setPattern(i: number): string {
    const [a, b] = new Set<string>(["s" + i, "t" + i]);
    return (a ?? "") + (b ?? "");
}

function mk(i: number) {
    return { value: "x" + i, done: false };
}

function logged(i: number) {
    const v = mk(i).value;
    console.log(v);
    console.log(mk(i + 1).value);
    const { value } = mk(i + 2);
    console.log(value);
    const [a] = new Set<string>(["s" + i]);
    console.log(a);
}

assert(setSize(1) == 2, "set of strings");
assert(numberSetSize(1) == 2, "set of numbers");
assert(mapPattern(1) == "k11l12", "map pattern");
assert(setPattern(1) == "s1t1", "set pattern");
logged(1);

let total: number = 0;
for (let i = 0; i < 20000; i++) {
    total += setSize(i) + numberSetSize(i) + mapPattern(i).length + setPattern(i).length;
}

assert(total > 0, "many times");

console.log("ALL DONE");
