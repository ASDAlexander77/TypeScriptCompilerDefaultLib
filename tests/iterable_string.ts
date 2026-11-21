// not own: a for...of over an Iterable<string> is refused under -mm=own (a compiler limit, TSLANG 153)
// A string given to an Iterable<string> parameter is iterated by its characters.

function count(values: Iterable<string>) {
    let n = 0;
    let s = "";
    for (const c of values) {
        n++;
        s = c + s;
    }

    assert(s == "olleh", "characters in order");
    return n;
}

function main() {
    assert(count("hello") == 5, "a string as an Iterable");
    print("ALL DONE");
}
