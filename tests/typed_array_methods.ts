// A TypedArray's own methods, as in JavaScript: those that make a new array give a TypedArray, sort
// goes by value, and subarray is a window onto the same elements.
function main() {
    const a = new Int32Array([5, 1, 10, 2]);

    // sort by value, not by text as an Array's does: 10 after 5
    a.sort();
    assert(a.join() == "1,2,5,10", "sort by value");
    assert(a.sort((x, y) => y - x).join() == "10,5,2,1", "sort with a compare function, giving itself");

    const f = new Float64Array([3, NaN, -1]);
    f.sort();
    assert(f[0] == -1 && f[1] == 3 && f[2] != f[2], "NaN goes last");
    assert(f.includes(NaN) && f.indexOf(NaN) == -1, "includes finds NaN, indexOf does not");

    // subarray shares its elements, both ways
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mid = bytes.subarray(2, 5);
    assert(mid.length == 3 && mid[0] == 2 && mid[2] == 4, "subarray(2, 5)");
    mid[0] = 20;
    assert(bytes[2] == 20, "a write through the subarray is seen in the array");
    bytes[4] = 40;
    assert(mid[2] == 40, "a write to the array is seen in the subarray");
    assert(mid.byteOffset == 2 && mid.byteLength == 3, "byteOffset and byteLength of bytes");
    assert(bytes.subarray(-2).join() == "40,5", "a negative begin counts from the end");
    assert(mid.subarray(1).join() == "3,40", "a subarray of a subarray");

    // outside the window: a read gives 0, a write does nothing to the elements around it
    mid[3] = 99;
    assert(mid[3] == 0 && bytes[5] == 5, "a write past the window does nothing");
    assert(mid[-1] == 0, "a read before the window gives 0");

    // slice copies
    const copy = bytes.slice(1, 3);
    copy[0] = 77;
    assert(bytes[1] == 1 && copy.join() == "77,20", "slice is a copy");

    const ints = new Int32Array([1, 2, 3, 4]);
    assert(ints.BYTES_PER_ELEMENT == 4 && ints.byteLength == 16, "BYTES_PER_ELEMENT and byteLength");

    // methods that make a new TypedArray
    const doubled = ints.map((v) => v * 2);
    assert(doubled.join() == "2,4,6,8" && doubled.BYTES_PER_ELEMENT == 4, "map gives an Int32Array");
    assert(ints.filter((v) => v % 2 == 0).join() == "2,4", "filter");
    assert(ints.toReversed().join() == "4,3,2,1" && ints.join() == "1,2,3,4", "toReversed leaves it");
    assert(new Int32Array([3, 1, 2]).toSorted().join() == "1,2,3", "toSorted");
    assert(ints._with(-1, 9).join() == "1,2,3,9" && ints[3] == 4, "with");

    // in place, each giving the array itself
    const g = new Int16Array([1, 2, 3, 4, 5]);
    assert(g.fill(0, -2).join() == "1,2,3,0,0", "fill from the end");
    assert(g.reverse().join() == "0,0,3,2,1", "reverse");
    assert(new Int8Array([1, 2, 3, 4, 5]).copyWithin(0, 3).join() == "4,5,3,4,5", "copyWithin");

    // reading
    assert(ints.at(-1) == 4 && ints.at(0) == 1 && ints.at(4) == undefined, "at");
    assert(ints.indexOf(3) == 2 && ints.lastIndexOf(1) == 0 && ints.indexOf(9) == -1, "indexOf, lastIndexOf");
    assert(ints.includes(4) && !ints.includes(1, 1), "includes");
    assert(ints.find((v) => v > 2) == 3 && ints.findIndex((v) => v > 2) == 2, "find, findIndex");
    assert(ints.findLast((v) => v < 3) == 2 && ints.findLastIndex((v) => v < 3) == 1, "findLast, findLastIndex");
    assert(ints.every((v) => v > 0) && ints.some((v) => v == 4) && !ints.some((v) => v > 4), "every, some");
    assert(ints.reduce((s, v) => s + v) == 10 && ints.reduce((s, v) => s + v, 5) == 15, "reduce");
    assert(ints.reduceRight((s, v) => s * 10 + v, 0) == 4321, "reduceRight");
    assert(ints.toString() == "1,2,3,4" && ints.join("-") == "1-2-3-4", "toString, join");

    let sum = 0;
    ints.forEach((v, i) => { sum += v * i; });
    assert(sum == 20, "forEach with the index");

    // iterating
    let total = 0;
    for (const v of ints) total += v;
    assert(total == 10, "for...of");

    let keys = 0;
    for (const k of ints.keys()) keys += k;
    assert(keys == 6, "keys");

    let weighted = 0;
    for (const [i, v] of ints.entries()) weighted += i * v;
    assert(weighted == 20, "entries");

    let fromValues = 0;
    for (const v of mid.values()) fromValues += v;
    assert(fromValues == 63, "values of a subarray");

    // a copy of another TypedArray shares nothing with it
    const twin = new Uint8Array(bytes);
    twin[0] = 100;
    assert(bytes[0] == 0 && twin.length == bytes.length, "new Uint8Array(other) copies");

    console.log("ALL DONE");
}
