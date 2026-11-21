// not own: until a released compiler has the fix for a parameter moved on paths that exclude each other (set)
// ObjectDictionary<T>: the value of a string index signature, `{ [key: string]: T }`. Its entries by keys
// known at run time: written, overwritten, deleted by writing undefined, and an absent key reads undefined.
class P {
    constructor(public n: string) {}
}

const d = new ObjectDictionary<number>();
for (let i = 0; i < 20; i++) {
    d["k" + (i % 5)] = i;
}

assert(d["k0"] == 15);
assert(d["k4"] == 19);
assert(d["none"] === undefined);

d["k1"] = undefined;
assert(d["k1"] === undefined);
assert(d["k2"] == 17);

// objects: under -mm=own the dictionary owns them, and a read borrows (so it is read in a function: a global
// can't hold a borrow)
function objects() {
    const o = new ObjectDictionary<P>();
    for (let i = 0; i < 100; i++) {
        const key = "p" + (i % 10);
        o[key] = new P("v" + i);
        if (i % 3 == 0) {
            o[key] = undefined;
        }
    }

    const p = o["p8"];
    assert(p !== undefined && p.n == "v98");
    assert(o["p9"] === undefined);
}

objects();

console.log("ALL DONE");
