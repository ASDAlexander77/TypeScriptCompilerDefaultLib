// Float16Array: each element is an IEEE 754 binary16, rounded to the nearest, ties to even, as in
// JavaScript; a value too large for one is Infinity
function main() {
    const h = new Float16Array(4);
    assert(h.length == 4 && h[3] == 0, "4 elements, each 0");
    assert(h.BYTES_PER_ELEMENT == 2 && h.byteLength == 8, "two bytes each");

    h[0] = 1.5;
    assert(h[0] == 1.5, "1.5 is exact");
    h[1] = 0.1;
    assert(h[1] == 0.0999755859375, "0.1 rounds to the nearest binary16");
    h[2] = 65504;
    assert(h[2] == 65504, "the largest finite binary16");
    h[3] = 65520;
    assert(h[3] == Number.POSITIVE_INFINITY, "65520 rounds up to Infinity");

    const r = new Float16Array([2049, 2051, -2, Number.NaN, Math.pow(2, -24), Math.pow(2, -25)]);
    assert(r[0] == 2048, "2049 ties to even 2048");
    assert(r[1] == 2052, "2051 ties to even 2052");
    assert(r[2] == -2, "a negative value");
    assert(r[3] != r[3], "NaN stays NaN");
    assert(r[4] == Math.pow(2, -24), "the smallest subnormal");
    assert(r[5] == 0, "half of it ties to even 0");

    // -0 keeps its sign (1 / -Infinity is -0)
    const z = new Float16Array(1);
    z[0] = 1 / Number.NEGATIVE_INFINITY;
    assert(1 / z[0] == Number.NEGATIVE_INFINITY, "-0 keeps its sign");

    // sorted by value, not by its bits: a negative binary16's bits are the larger
    const s = new Float16Array([1, -1, 0.5, -0.5]).sort();
    assert(s.join() == "-1,-0.5,0.5,1", "sort by value");

    const m = new Float16Array([1, 2]).map((v: number, i: number) => v / 3);
    assert(m[0] == 0.333251953125, "map rounds each result");
    assert(m.subarray(1).byteOffset == 2, "a subarray's byteOffset");

    console.log("ALL DONE");
}
