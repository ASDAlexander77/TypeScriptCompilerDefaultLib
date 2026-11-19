// not own: the program goes on using a buffer after a DataView keeps it, which -mm=own refuses
// ArrayBuffer: resizable only when given a maxByteLength, and a DataView made without a length follows
// a resizable buffer's length, as in JavaScript
function main() {
    const fixed = new ArrayBuffer(4);
    assert(!fixed.resizable && fixed.maxByteLength == 4, "not resizable without maxByteLength");
    let refused = false;
    try {
        fixed.resize(2);
    } catch (e) {
        refused = e instanceof TypeError;
    }

    assert(refused, "a fixed buffer refuses resize");

    const growing = new ArrayBuffer(2, { maxByteLength: 8 });
    assert(growing.resizable && growing.maxByteLength == 8, "resizable with maxByteLength");
    const tracking = new DataView(growing);
    const fixedView = new DataView(growing, 0, 2);
    tracking.setUint16(0, 0xABCD);

    growing.resize(6);
    assert(growing.byteLength == 6, "grown");
    assert(tracking.byteLength == 6 && fixedView.byteLength == 2, "a view without a length follows it");
    assert(tracking.getUint16(0) == 0xABCD, "the bytes stay");
    assert(tracking.getUint32(2) == 0, "the new bytes are 0");

    let tooLarge = false;
    try {
        growing.resize(9);
    } catch (e) {
        tooLarge = e instanceof RangeError;
    }

    assert(tooLarge, "past maxByteLength is a RangeError");

    growing.resize(1);
    let outOfBounds = false;
    try {
        outOfBounds = fixedView.byteLength < 0;
    } catch (e) {
        outOfBounds = e instanceof TypeError;
    }

    assert(outOfBounds, "a fixed view past a shrunk buffer is out of bounds");
    growing.resize(3);
    assert(tracking.getUint8(1) == 0 && tracking.getUint8(2) == 0, "bytes a shrink cut off come back 0");

    const cut = fixed.slice(1, 3);
    assert(cut.byteLength == 2 && !cut.resizable, "slice copies a part");

    const longer = growing.transfer(5);
    assert(longer.byteLength == 5 && longer.resizable, "transfer to a new length keeps resizability");
    const shorter = longer.transferToFixedLength(2);
    assert(shorter.byteLength == 2 && !shorter.resizable, "transferToFixedLength");

    console.log("ALL DONE");
}
