// not own: the program goes on using a buffer after a DataView keeps it, which -mm=own refuses
// DataView: numbers of any width at any byte offset of an ArrayBuffer, big-endian unless asked for
// little-endian, as in JavaScript
function main() {
    const buffer = new ArrayBuffer(16);
    assert(buffer.byteLength == 16 && !buffer.resizable, "a fixed ArrayBuffer of 16 bytes");
    const view = new DataView(buffer);
    assert(view.byteLength == 16 && view.byteOffset == 0, "the whole buffer");

    view.setUint16(0, 0x1234);
    assert(view.getUint8(0) == 0x12 && view.getUint8(1) == 0x34, "big-endian by default");
    view.setUint16(0, 0x1234, true);
    assert(view.getUint8(0) == 0x34 && view.getUint8(1) == 0x12, "little-endian when asked");
    assert(view.getUint16(0, true) == 0x1234, "read back little-endian");

    view.setInt8(2, -1);
    assert(view.getInt8(2) == -1 && view.getUint8(2) == 255, "signed and unsigned bytes");
    view.setUint8(2, 300);
    assert(view.getUint8(2) == 44, "a byte wraps");

    view.setInt32(4, -2);
    assert(view.getInt32(4) == -2, "Int32");
    assert(view.getUint32(4) == 4294967294, "the same bits as Uint32");
    view.setInt16(4, -300, true);
    assert(view.getInt16(4, true) == -300, "Int16");

    view.setFloat32(8, 1.5);
    assert(view.getFloat32(8) == 1.5, "Float32");
    assert(view.getUint32(8) == 0x3FC00000, "Float32's bits, big-endian");
    view.setFloat32(8, 0.1);
    assert(view.getFloat32(8) == Math.fround(0.1), "Float32 rounds as fround");

    view.setFloat64(8, Math.PI, true);
    assert(view.getFloat64(8, true) == Math.PI, "Float64");
    view.setFloat64(8, 2);
    assert(view.getUint8(8) == 0x40 && view.getUint8(9) == 0, "Float64's bits, big-endian");

    view.setFloat16(0, 1.5);
    assert(view.getUint16(0) == 0x3E00, "Float16's bits");
    assert(view.getFloat16(0) == 1.5, "Float16");
    assert(Math.f16round(0.1) == 0.0999755859375, "Math.f16round");

    view.setBigInt64(8, -5);
    assert(view.getBigInt64(8) == -5, "BigInt64");
    assert(view.getUint8(15) == 0xFB, "BigInt64's low byte, big-endian");

    // a view of part of the buffer
    const part = new DataView(buffer, 4, 8);
    assert(part.byteOffset == 4 && part.byteLength == 8, "offset and length");
    part.setUint8(0, 9);
    assert(view.getUint8(4) == 9, "a write through it reaches the buffer");

    let outside = false;
    try {
        part.getUint32(6);
    } catch (e) {
        outside = e instanceof RangeError;
    }

    assert(outside, "past its end is a RangeError");

    let badView = false;
    try {
        new DataView(buffer, 12, 8);
    } catch (e) {
        badView = e instanceof RangeError;
    }

    assert(badView, "a view past the buffer's end is a RangeError");

    // a detached buffer
    const moved = buffer.transfer();
    assert(buffer.detached && moved.byteLength == 16, "transfer detaches");
    let detached = false;
    try {
        view.getUint8(0);
    } catch (e) {
        detached = e instanceof TypeError;
    }

    assert(detached, "a detached buffer is a TypeError");

    console.log("ALL DONE");
}
