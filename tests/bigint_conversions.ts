// `Number(x)`, `BigInt(x)`, `String(x)` and `Boolean(x)` called without `new` convert to the primitive, as in
// JavaScript: each made the class's object, and `BigInt(42) + 1n` or `Number(x) + 0.5` was an invalid cast.
function main() {
    const b = BigInt(42);
    assert(b + 1n == 43n, "BigInt of a number");

    const x = 5;
    assert(Number(x) + 0.5 == 5.5, "Number of a number");
    assert(Number(10n) + 0.5 == 10.5, "Number of a bigint");
    assert(Number("2.5") * 2 == 5, "Number of a string");

    assert(String(12) + "!" == "12!", "String of a number");
    assert(!Boolean(0) && Boolean(3), "Boolean of a number");

    assert(10n.toString() == "10", "a bigint's toString");

    console.log("ALL DONE");
}
