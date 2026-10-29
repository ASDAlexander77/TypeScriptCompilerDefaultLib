// `Number.toString` returned nothing: the caller read whatever was left in the result register, which
// under gc happened to be the string and under rc, none and own crashed. A radix other than 10 now converts.
function main() {
    const n = new Number(5);
    assert(n.toString() == "5", "toString of a Number");
    assert(new Number(255).toString(16) == "ff", "toString with a radix");
    assert(n.valueOf() + 1 == 6, "valueOf");

    // a radix other than 10 was ignored, and 16 was C's "%a"
    const x: number = 255;
    assert(x.toString(16) == "ff", "radix 16");
    assert(x.toString(2) == "11111111", "radix 2");
    assert(x.toString(36) == "73", "radix 36");
    const y: number = -10.5;
    assert(y.toString(2) == "-1010.1", "a negative fraction");
    const z: number = 0;
    assert(z.toString(8) == "0", "zero");
    const tenth: number = 0.1;
    assert(tenth.toString(2) == "0.0001100110011001100110011001100110011001100110011001101", "every binary digit");

    console.log("ALL DONE");
}
