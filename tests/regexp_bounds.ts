// A lastIndex past the end of the string fails the match and goes back to 0, as in JavaScript: it
// used to read past the string. (An invalid pattern given to replaceAll is a SyntaxError now, where
// it read a null; not tested here, as the wrapper also reports it on stderr, which fails a test.)
function main() {
    const re = /b/g;
    re.lastIndex = 1000;
    assert(re.exec("abc") == null, "exec past the end");
    assert(re.lastIndex == 0, "lastIndex is 0 again");

    re.lastIndex = 1000;
    assert(!re.test("abc"), "test past the end");
    assert(re.lastIndex == 0, "lastIndex is 0 again after test");
    assert(re.test("abc"), "and the next search starts over");

    const none = "abc".match(/z/);
    assert(none == null, "match with no match is null");
    const some = "abc".match(/b/);
    assert(some != null, "match with a match");
    if (some != null) {
        assert(some.length == 1 && some[0] == "b", "the match");
    }

    console.log("ALL DONE");
}
