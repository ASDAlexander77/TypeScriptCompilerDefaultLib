// split with a RegExp separator splits on every match, puts capture groups in the result and
// stops at the limit, as in JavaScript
function main() {
    assert(<string>"a, b ,c".split(/\s*,\s*/) == "a,b,c", "split on every match");
    assert("a, b ,c".split(/\s*,\s*/).length == 3, "three pieces");

    assert(<string>"a1b2c".split(/(\d)/) == "a,1,b,2,c", "capture groups go in the result");
    assert("a1b2c".split(/(\d)/).length == 5, "five pieces with groups");

    assert(<string>"a,b,c,d".split(/,/, 2) == "a,b", "limit");
    assert("a,b,c,d".split(/,/, 2).length == 2, "two pieces under the limit");
    assert(<string>"a1b2c".split(/(\d)/, 2) == "a,1", "the limit counts capture groups");
    assert("a,b".split(/,/, 0).length == 0, "limit 0");

    assert(<string>"a,b,".split(/,/) == "a,b,", "a trailing separator gives an empty piece");
    assert("a,b,".split(/,/).length == 3, "three pieces with the empty one");

    assert(<string>"abc".split(/x*/) == "a,b,c", "an empty match splits between characters");
    assert("abc".split(/x*/).length == 3, "three characters");

    assert("abc".split(/z/).length == 1, "no match gives the whole string");
    assert("abc".split(/z/)[0] == "abc", "the whole string");

    assert("".split(/x*/).length == 0, "an empty string matched by the separator gives no pieces");
    assert("".split(/,/).length == 1, "an empty string not matched gives one piece");

    const re = /,/g;
    re.lastIndex = 2;
    assert("a,b,c".split(re).length == 3, "split starts at the beginning whatever lastIndex says");
    assert(re.lastIndex == 2, "split leaves lastIndex alone");

    console.log("ALL DONE");
}
