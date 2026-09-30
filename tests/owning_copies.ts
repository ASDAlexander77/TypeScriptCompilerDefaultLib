// Copies of elements that own what they hold. Array.concat, slice and copyWithin, and Set and Map
// growing their entries, copied elements with memcpy - under rc that duplicated references nobody
// took, so the copy and the original released the same strings and the heap was corrupted. Every
// string here is built at run time: a literal is immortal and would hide it.

function made(prefix: string, n: int): string[] {
    const result: string[] = [];
    for (let i = 0; i < n; i++) result.push(prefix + i);
    return result;
}

function concatHoldsItsOwn() {
    const a = made("a", 3);
    const joined = a.concat(made("b", 2), made("c", 1));
    return joined.join() == "a0,a1,a2,b0,b1,c0" && a.join() == "a0,a1,a2";
}

function sliceHoldsItsOwn() {
    const a = made("s", 5);
    const part = a.slice(1, 4);
    return part.join() == "s1,s2,s3" && a.join() == "s0,s1,s2,s3,s4";
}

function copyWithinKeepsEveryElement() {
    const a = made("w", 5);
    a.copyWithin(0, 3);
    const b = made("v", 5);
    b.copyWithin(2, 0);
    return a.join() == "w3,w4,w2,w3,w4" && b.join() == "v0,v1,v0,v1,v2";
}

function setGrowsWithItsStrings() {
    const s = new Set<string>();
    for (const v of made("e", 20)) s.add(v);
    let all = "";
    for (const v of s) all += v;
    return s.size == 20 && s.has("e7") && s.has("e19") && all.length == 50;
}

function mapGrowsWithItsStrings() {
    const m = new Map<string, string>();
    for (let i = 0; i < 20; i++) m.set("k" + i, "v" + i);
    return m.size == 20 && m.get("k7") == "v7" && m.get("k19") == "v19";
}

function main() {
    // twice over, so the second round allocates over whatever the first freed
    for (let round = 0; round < 2; round++) {
        assert(concatHoldsItsOwn(), "concat");
        assert(sliceHoldsItsOwn(), "slice");
        assert(copyWithinKeepsEveryElement(), "copyWithin");
        assert(setGrowsWithItsStrings(), "Set growth");
        assert(mapGrowsWithItsStrings(), "Map growth");
    }

    console.log("ALL DONE");
}
