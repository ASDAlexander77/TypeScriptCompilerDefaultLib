// Stdio reads and writes bytes as they are. Reads tests/stdio_bytes.stdin, which the test scripts
// give as standard input: a header line read with console.readLine, then the rest as bytes.
function main() {
    // a line, then the bytes after it: both read from the same stdin buffer
    assert(console.readLine() == "header line", "the first line");

    const rest = new TextDecoder().decode(Stdio.readAll());
    assert(rest.startsWith("body one"), "the bytes after the first line");
    assert(rest.includes("body two"), "to the end of input");

    // at the end of input nothing is left
    const buffer = new Uint8Array([0, 0, 0, 0]);
    assert(Stdio.read(buffer) == 0, "nothing left to read");
    assert(Stdio.readAll().length == 0, "nothing left at all");

    // bytes go out as they are, and flushed though they end without a line break
    const encoder = new TextEncoder();
    assert(Stdio.write(encoder.encode("bytes out: ")) == 11, "11 bytes written");
    assert(Stdio.write(new Uint8Array([0x6F, 0x6B, 0x0A])) == 3, "ok and a line break");
    assert(Stdio.write(new Uint8Array([])) == 0, "nothing to write");

    console.log("ALL DONE");
}
