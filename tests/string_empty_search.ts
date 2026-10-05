// an empty search string is found, as in JavaScript. The guard on it was `!searchString`, a null
// check written as truthiness: once "" was falsy (TypeScriptCompiler #509) it returned "not found".
function main() {
    const s = "abc";

    assert(s.endsWith(""), "endsWith('')");
    assert(s.endsWith("", 1), "endsWith('', 1)");
    assert(s.endsWith("bc"), "endsWith('bc')");
    assert(!s.endsWith("x"), "endsWith('x')");

    assert(s.startsWith(""), "startsWith('')");
    assert(s.startsWith("", 3), "startsWith('', 3)");
    assert(s.startsWith("ab"), "startsWith('ab')");
    assert(!s.startsWith("x"), "startsWith('x')");

    assert(s.indexOf("") == 0, "indexOf('')");
    assert(s.indexOf("", 2) == 2, "indexOf('', 2)");
    assert(s.indexOf("", 5) == 3, "indexOf('', 5)");
    assert(s.indexOf("c") == 2, "indexOf('c')");
    assert(s.indexOf("x") == -1, "indexOf('x')");

    assert(s.lastIndexOf("") == 3, "lastIndexOf('')");
    assert(s.includes(""), "includes('')");

    const empty = "";
    assert(empty.endsWith(""), "''.endsWith('')");
    assert(empty.startsWith(""), "''.startsWith('')");
    assert(empty.indexOf("") == 0, "''.indexOf('')");

    console.log("ALL DONE");
}
