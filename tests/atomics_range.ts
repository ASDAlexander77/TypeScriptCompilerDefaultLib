// An Atomics index outside the array throws a RangeError, rather than touching memory past it.

function main() {
    const ta: Int32Array = new Int32Array([5, 10, 0]);

    let threw = false;
    try {
        Atomics.add(ta, 3, 1);
    } catch (e) {
        threw = true;
    }

    assert(threw, "index past the end");

    threw = false;
    try {
        Atomics.load(ta, -1);
    } catch (e) {
        threw = true;
    }

    assert(threw, "negative index");
    assert(ta[0] == 5 && ta[1] == 10 && ta[2] == 0, "nothing written");

    print("ALL DONE");
}
