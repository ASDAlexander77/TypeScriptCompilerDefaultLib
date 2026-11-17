// Math.max started from Number.MIN_VALUE, the smallest positive number, so the maximum of negative
// numbers was 2.2e-308. Checked with typed comparisons rather than an `any` helper, so the test
// does not depend on how `any` values compare.

function main() {
    const m = Math.max(-3, -5);
    assert(m == -3, "Math.max(-3, -5)");
    assert(Math.max(-1, -7) == -1, "Math.max(-1, -7)");
    assert(Math.max(-2.5) == -2.5, "Math.max(-2.5)");
    assert(Math.max(1, 7) == 7, "Math.max(1, 7)");
    assert(Math.max() == Number.NEGATIVE_INFINITY, "Math.max()");
    assert(Math.max(Number.NEGATIVE_INFINITY, -1e308) == -1e308, "Math.max(-Infinity, -1e308)");
    assert(isNaN(Math.max(1, Number.NaN, 3)), "Math.max(1, NaN, 3)");

    assert(Math.min(3, 5) == 3, "Math.min(3, 5)");
    assert(Math.min(-1, -7) == -7, "Math.min(-1, -7)");
    assert(Math.min() == Number.POSITIVE_INFINITY, "Math.min()");
    assert(Math.min(Number.POSITIVE_INFINITY) == Number.POSITIVE_INFINITY, "Math.min(Infinity)");
    assert(isNaN(Math.min(Number.NaN, 1)), "Math.min(NaN, 1)");

    // +0 is larger than -0, which `>` and `<` do not tell apart: the answer depended on the order.
    // Doubles made at run time (`-0` is the integer 0); 1 / -0 is -Infinity.
    const scale = 1.5;
    const negativeZero: number = -0.0 * scale;
    const positiveZero: number = 0.0 * scale;
    assert(1 / negativeZero < 0 && 1 / positiveZero > 0, "the zeros");
    assert(1 / Math.max(negativeZero, positiveZero) > 0, "Math.max(-0, 0) is 0");
    assert(1 / Math.max(positiveZero, negativeZero) > 0, "Math.max(0, -0) is 0");
    assert(1 / Math.max(negativeZero, negativeZero) < 0, "Math.max(-0, -0) is -0");
    assert(1 / Math.min(positiveZero, negativeZero) < 0, "Math.min(0, -0) is -0");
    assert(1 / Math.min(negativeZero, positiveZero) < 0, "Math.min(-0, 0) is -0");
    assert(1 / Math.min(positiveZero, positiveZero) > 0, "Math.min(0, 0) is 0");
    assert(Math.max(negativeZero, -1) == 0 && Math.min(positiveZero, 1) == 0, "zeros against others");

    print("ALL DONE");
}
