const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
const regex = /[A-Z]/g;
// match gives string[] | null, as in JavaScript: null when there is no match
const found = paragraph.match(regex);

assert(found != null);
if (found != null) {
    assert(found.length == 2);
    assert(<string>found == "T,I");

    console.log(found);
    // Expected output: Array ["T", "I"]
}

assert(paragraph.match(/[0-9]/) == null, "no match is null");
assert(paragraph.match(/[0-9]/g) == null, "and with the g flag too, not an empty array");

console.log("ALL DONE");
