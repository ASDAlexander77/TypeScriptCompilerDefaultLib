const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
const regex = /[A-Z]/g;
// match gives string[] | null: null when a pattern without the g flag does not match
const found = paragraph.match(regex);

assert(found != null);
if (found != null) {
    assert(found.length == 2);
    assert(<string>found == "T,I");

    console.log(found);
    // Expected output: Array ["T", "I"]
}

assert(paragraph.match(/[0-9]/) == null, "no match is null");

// with the g flag no match is an empty array (JavaScript gives null there too)
const none = paragraph.match(/[0-9]/g);
assert(none != null, "a global match is never null");
if (none != null) {
    assert(none.length == 0, "and is empty when nothing matched");
}

console.log("ALL DONE");
