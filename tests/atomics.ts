// Atomics over the integer TypedArrays. Each operation returns the value the element had before it,
// except store, which returns the value stored. The array alone decides the element type: a plain
// literal value does not make it s32. Each array is declared with its type: `new Uint8Array([250])`
// alone builds an array of s32.

function main() {
    const ta: Int32Array = new Int32Array([5, 10, 0]);

    assert(Atomics.add(ta, 0, 3) == 5 && ta[0] == 8, "add");
    assert(Atomics.sub(ta, 1, 4) == 10 && ta[1] == 6, "sub");
    assert(Atomics.and(ta, 1, 3) == 6 && ta[1] == 2, "and");
    assert(Atomics.or(ta, 1, 5) == 2 && ta[1] == 7, "or");
    assert(Atomics.xor(ta, 1, 1) == 7 && ta[1] == 6, "xor");
    assert(Atomics.exchange(ta, 2, 42) == 0 && ta[2] == 42, "exchange");
    assert(Atomics.load(ta, 2) == 42 && ta[2] == 42, "load leaves the element as it was");
    assert(Atomics.store(ta, 2, 9) == 9 && ta[2] == 9, "store returns the value stored");

    // the replacement is written only when the element is the expected value
    assert(Atomics.compareExchange(ta, 0, 8, 100) == 8 && ta[0] == 100, "compareExchange hit");
    assert(Atomics.compareExchange(ta, 0, 8, 200) == 100 && ta[0] == 100, "compareExchange miss");

    // narrower and wider elements wrap at their own width
    const u8: Uint8Array = new Uint8Array([250]);
    assert(Atomics.add(u8, 0, 10) == 250 && u8[0] == 4, "Uint8Array wraps");

    const u16: Uint16Array = new Uint16Array([65535]);
    assert(Atomics.add(u16, 0, 2) == 65535 && u16[0] == 1, "Uint16Array wraps");

    const s8: Int8Array = new Int8Array([127]);
    assert(Atomics.add(s8, 0, 1) == 127 && s8[0] == -128, "Int8Array wraps");

    const big: BigInt64Array = new BigInt64Array([4000000000]);
    assert(Atomics.add(big, 0, 1) == 4000000000 && big[0] == 4000000001, "BigInt64Array is 64 bits");

    const counters: Int32Array = new Int32Array([0, 0, 0, 0]);
    for (let i = 0; i < 1000; i++) {
        Atomics.add(counters, i % 4, 1);
    }

    assert(counters[0] == 250 && counters[3] == 250, "counts");

    assert(Atomics.isLockFree(4) && Atomics.isLockFree(8) && !Atomics.isLockFree(3), "isLockFree");

    // a Float64Array still builds: no atomic operation is made for its elements
    const f: Float64Array = new Float64Array([1.5]);
    assert(f[0] == 1.5, "Float64Array unaffected");

    print("ALL DONE");
}
