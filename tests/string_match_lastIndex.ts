// a global match/matchAll searches the whole string whatever lastIndex an earlier test/exec left,
// and leaves lastIndex at 0; a global RegExp that matches the empty string does not loop forever
function main() {
    const re = /\d/g;
    assert(re.test("1a2b3"), "test finds the first digit");
    assert(re.lastIndex == 1, "test moved lastIndex");

    const digits = "1a2b3".match(re);
    assert(<string>digits == "1,2,3", "match starts at the beginning");
    assert(re.lastIndex == 0, "match leaves lastIndex at 0");

    assert(re.exec("1a2b3") != null, "exec finds the first digit");
    assert(re.lastIndex == 1, "exec moved lastIndex");

    const all = [..."1a2b3".matchAll(re)];
    assert(all.length == 3, "matchAll starts at the beginning");
    assert(<string>all[0] == "1", "the first digit");
    assert(re.lastIndex == 0, "matchAll leaves lastIndex at 0");

    // empty matches
    const empties = "abc".match(/x*/g);
    assert(empties.length == 4, "an empty match at every position");

    const words = "ab cd".match(/\w*/g);
    assert(<string>words == "ab,,cd,", "empty matches between the words");

    const emptyAll = [..."ab".matchAll(/x*/g)];
    assert(emptyAll.length == 3, "matchAll: an empty match at every position");

    // matchAll with a non-global RegExp throws a TypeError, as in JavaScript
    let threw = false;
    try {
        const r = [..."ab".matchAll(/a/)];
    } catch {
        threw = true;
    }

    assert(threw, "matchAll with a non-global RegExp throws");

    console.log("ALL DONE");
}
