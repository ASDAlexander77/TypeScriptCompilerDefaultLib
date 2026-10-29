// A check TypeScript answers with a RangeError throws one a `catch` takes: a bigint divided by 0n or
// raised to a negative power, and an invalid array length (`length =`, `new Array(n)`, a number or an
// integer). Each stopped the program as a failing assert does; Error's fields were private in core.d.ts,
// so `e.message` did not compile.
type Numbers = number[];

function divide(a: bigint, b: bigint) {
    return a / b;
}

function remainder(a: bigint, b: bigint) {
    return a % b;
}

function power(a: bigint, b: bigint) {
    return a ** b;
}

function resize(a: number[], n: number) {
    a.length = n;
}

function caught(f: () => void, expected: string) {
    try {
        f();
    } catch (e: RangeError) {
        return e.message == expected;
    }

    return false;
}

function main() {
    assert(caught(() => { divide(10n, 0n); }, "Division by zero"), "bigint /");
    assert(caught(() => { remainder(10n, 0n); }, "Division by zero"), "bigint %");
    assert(caught(() => { power(2n, -1n); }, "Exponent must be non-negative"), "bigint **");

    const a: number[] = [1, 2, 3];
    assert(caught(() => { resize(a, -1); }, "Invalid array length"), "length = a negative number");
    assert(caught(() => { resize(a, 1.5); }, "Invalid array length"), "length = a fraction");
    let negative = -1;
    assert(caught(() => { a.length = negative; }, "Invalid array length"), "length = a negative integer");
    assert(caught(() => { const b = new Numbers(negative); }, "Invalid array length"), "new Array of a negative integer");
    assert(a.length == 3, "a failed resize leaves the array");

    // what passes the checks
    assert(divide(10n, 3n) == 3n && remainder(10n, 3n) == 1n && power(2n, 10n) == 1024n, "bigint values");
    resize(a, 2);
    assert(a.length == 2 && new Numbers(4).length == 4, "lengths");

    let untyped = "";
    try {
        divide(1n, 0n);
    } catch (e) {
        if (e instanceof RangeError) {
            untyped = e.message;
        }
    }

    assert(untyped == "Division by zero", "an untyped catch");

    console.log("ALL DONE");
}
