// Reads tests/console_readLine.stdin, which the test scripts give as standard input: a line ending
// "\r\n", an empty line, and a last line with no line break (the scripts may add one).
function main() {
    const lines: string[] = [];
    let line: string | null = null;
    while ((line = console.readLine()) != null) {
        console.log(`[${line}]`);
        lines.push(line);
    }

    assert(lines.length == 3, "three lines");
    assert(lines[0] == "first line", "\r\n is not part of the line");
    assert(lines[1] == "", "an empty line");
    assert(lines[2] == "  last line  ", "spaces are kept");

    // and stays at the end
    assert(console.readLine() == null, "null again at the end of input");

    console.log("ALL DONE");
}
