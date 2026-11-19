// A DataView keeps the buffer it is given (under -mm=own its caller gives the buffer up) and reaches it
// through `buffer`
function main() {
    const view = new DataView(new ArrayBuffer(8), 2);
    assert(view.byteOffset == 2 && view.byteLength == 6, "a view from byte 2");
    view.setUint16(0, 0x1234);
    assert(view.getUint8(0) == 0x12 && view.getUint8(1) == 0x34, "big-endian");
    view.setFloat32(2, 0.5, true);
    assert(view.getFloat32(2, true) == 0.5, "Float32, little-endian");
    let outside = false;
    try {
        view.setFloat64(0, 1);
    } catch (e) {
        outside = e instanceof RangeError;
    }

    assert(outside, "8 bytes do not fit in 6");

    const shared = new DataView(new SharedArrayBuffer(4, { maxByteLength: 8 }));
    shared.setInt32(0, -7);
    assert(shared.getInt32(0) == -7, "over a SharedArrayBuffer");
    assert(shared.byteLength == 4, "4 bytes");

    console.log("ALL DONE");
}
