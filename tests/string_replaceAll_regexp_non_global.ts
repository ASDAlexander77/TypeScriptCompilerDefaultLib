// replaceAll with a RegExp that has no "g" flag throws a TypeError, as in JavaScript; with "g" it
// replaces every match
function main() {
    let threw = false;
    try {
        "a-b-c".replaceAll(/-/, "+");
    } catch {
        threw = true;
    }

    assert(threw, "replaceAll with a non-global RegExp throws");

    assert("a-b-c".replaceAll(/-/g, "+") == "a+b+c", "replaceAll with a global RegExp");

    console.log("ALL DONE");
}
