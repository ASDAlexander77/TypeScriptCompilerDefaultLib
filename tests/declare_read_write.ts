// linux only: the JIT on Windows has no read or write of these names (they are _read and _write).
// A program can declare C's read and write itself: the library must not take those names with
// signatures of its own. Reads tests/declare_read_write.stdin, which the test scripts give as
// standard input.
declare function read(fd: s32, buffer: Opaque, count: u32): s32;
declare function write(fd: s32, buffer: Opaque, count: u32): s32;

function main() {
    const buffer: u8[] = [];
    buffer.length = 16;

    const count = read(0, <Opaque>Ref(buffer[0]), 16);
    assert(count == 6, "the six bytes of the input");
    assert(buffer[0] == 97 && buffer[5] == 102, "as they are");

    assert(write(1, <Opaque>Ref(buffer[0]), <u32>count) == count, "all of them written");

    console.log("");
    console.log("ALL DONE");
}
