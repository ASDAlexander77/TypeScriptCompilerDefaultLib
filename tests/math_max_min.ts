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

    print("ALL DONE");
}
