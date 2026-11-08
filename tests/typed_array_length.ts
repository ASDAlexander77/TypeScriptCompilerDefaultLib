// new Uint8Array(length) and its kin: `length` elements, each 0, as in JavaScript
function main() {
    const bytes = new Uint8Array(16);
    assert(bytes.length == 16, "16 elements");
    let allZero = true;
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] != 0) allZero = false;
    }

    assert(allZero, "each 0");
    bytes[15] = 255;
    assert(bytes[15] == 255, "an element can be set");

    const empty = new Uint8Array(0);
    assert(empty.length == 0, "no elements");

    const ints = new Int32Array(4);
    assert(ints.length == 4 && ints[3] == 0, "Int32Array of a length");
    assert(Atomics.add(ints, 1, 5) == 0 && ints[1] == 5, "usable with Atomics");

    const floats = new Float64Array(3);
    assert(floats.length == 3 && floats[2] == 0, "Float64Array of a length");

    // an array still gives the elements
    const given = new Uint8Array([1, 2, 3]);
    assert(given.length == 3 && given[2] == 3, "from an array");

    console.log("ALL DONE");
}
