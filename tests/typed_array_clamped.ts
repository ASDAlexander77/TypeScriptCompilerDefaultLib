// Uint8ClampedArray: a number written to it is clamped into 0..255 and rounded half to even, as in
// JavaScript, where Uint8Array wraps it
function main() {
    const c = new Uint8ClampedArray(8);
    assert(c.length == 8 && c[0] == 0, "8 elements, each 0");
    assert(c.BYTES_PER_ELEMENT == 1 && c.byteLength == 8, "one byte each");

    c[0] = 300;
    assert(c[0] == 255, "300 clamps to 255");
    c[1] = -5;
    assert(c[1] == 0, "-5 clamps to 0");
    c[2] = 1.5;
    assert(c[2] == 2, "1.5 rounds to 2");
    c[3] = 2.5;
    assert(c[3] == 2, "2.5 rounds to even 2");
    c[4] = 2.6;
    assert(c[4] == 3, "2.6 rounds to 3");
    c[5] = Number.NaN;
    assert(c[5] == 0, "NaN is 0");
    c[6] = Number.POSITIVE_INFINITY;
    assert(c[6] == 255, "Infinity is 255");
    c[7] = 254.5;
    assert(c[7] == 254, "254.5 rounds to even 254");

    // where Uint8Array wraps
    const u = new Uint8Array(1);
    u[0] = 300;
    assert(u[0] == 44, "Uint8Array wraps 300 to 44");

    const given = new Uint8ClampedArray([-1, 128, 1000]);
    assert(given.join() == "0,128,255", "from an array, clamped");

    // a write through a method is clamped too
    const filled = new Uint8ClampedArray(3).fill(999);
    assert(filled.join() == "255,255,255", "fill clamps");
    const doubled = given.map((v: number, i: number) => v * 2);
    assert(doubled.join() == "0,255,255", "map clamps");
    const changed = given.with(0, 77.5);
    assert(changed[0] == 78 && given[0] == 0, "with clamps, and copies");

    // subarray shares the elements, slice copies them
    const view = given.subarray(1);
    view[0] = -20;
    assert(given[1] == 0, "a write through a subarray is seen, clamped");
    const copy = given.slice();
    copy[2] = 1;
    assert(given[2] == 255, "a slice is a copy");

    let sum = 0;
    for (const v of given) sum += v;
    assert(sum == 255, "iterates its values");
    assert(given.reduce((a: number, v: number) => a + v, 0) == 255, "reduce");
    assert(given.indexOf(255) == 2 && given.includes(0), "indexOf and includes");
    assert(new Uint8ClampedArray([3, 1, 2]).sort().join() == "1,2,3", "sort");

    console.log("ALL DONE");
}
