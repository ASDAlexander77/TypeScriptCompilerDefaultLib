// not own: the program goes on using a buffer after a DataView keeps it, which -mm=own refuses
// SharedArrayBuffer: bytes that threads share; a growable one grows up to its maxByteLength without
// moving its bytes, as in JavaScript
function main() {
    const shared = new SharedArrayBuffer(4, { maxByteLength: 16 });
    assert(shared.byteLength == 4 && shared.growable && shared.maxByteLength == 16, "growable");

    const view = new DataView(shared);
    view.setInt32(0, 123456, true);
    shared.grow(12);
    assert(shared.byteLength == 12 && view.byteLength == 12, "grown, and the view follows");
    assert(view.getInt32(0, true) == 123456 && view.getInt32(8) == 0, "old bytes stay, new ones are 0");

    let shrink = false;
    try {
        shared.grow(8);
    } catch (e) {
        shrink = e instanceof RangeError;
    }

    assert(shrink, "it cannot shrink");

    const fixed = new SharedArrayBuffer(2);
    assert(!fixed.growable, "not growable without maxByteLength");
    let refused = false;
    try {
        fixed.grow(2);
    } catch (e) {
        refused = e instanceof TypeError;
    }

    assert(refused, "a fixed one refuses grow");

    const copy = shared.slice(0, 4);
    assert(copy.byteLength == 4 && !copy.growable, "slice copies");
    new DataView(copy).setInt32(0, 7, true);
    assert(view.getInt32(0, true) == 123456, "the copy shares nothing");

    // another thread sees the same bytes
    const handle = Thread.spawn((): int => {
        view.setUint8(11, 42);
        return 0;
    });
    handle.join();
    assert(view.getUint8(11) == 42, "a write by another thread is seen");

    console.log("ALL DONE");
}
