// An object with many members finds each by its name through a table (16 members or more), where
// every name was looked through: reading an object of n members cost n * n.
function build(count: int): string {
    let text = "{";
    for (let i = 0; i < count; i++) {
        if (i > 0) text += ",";
        text += `"key${i}":${i}`;
    }

    return text + "}";
}

function check(count: int) {
    const value = JSON.parse(build(count));
    assert(value.length == count, "every member is there");
    for (let i = 0; i < count; i++) {
        assert(value.has(`key${i}`), "has each key");
        assert(value.get(`key${i}`).asNumber() == i, "each key has its own value");
    }

    assert(!value.has("key"), "a name that is the start of others");
    assert(!value.has(`key${count}`), "one past the last");
    assert(value.get("missing").isNull(), "null for what is not there");
}

function main() {
    // around the size the table starts at, and well past it, where it has grown several times
    check(0);
    check(1);
    check(15);
    check(16);
    check(17);
    check(33);
    check(5000);

    // a name given twice keeps its place and takes the last value, small and large
    const twice = JSON.parse(`{"a":1,"b":2,"a":3}`);
    assert(twice.length == 2 && twice.get("a").asNumber() == 3, "the last value, a few members");

    const large = JSON.parse(build(100));
    large.set("key7", JsonValue.ofNumber(700));
    assert(large.length == 100, "a member set again is not added");
    assert(large.get("key7").asNumber() == 700, "and has the new value");
    large.set("extra", JsonValue.ofString("x"));
    assert(large.length == 101 && large.get("extra").asString() == "x", "a member added");
    assert(large.get("key99").asNumber() == 99, "the others are as they were");

    // built by hand, past the size the table starts at
    const made = JsonValue.newObject();
    for (let i = 0; i < 40; i++) {
        made.set(`n${i}`, JsonValue.ofNumber(i * 2));
    }

    assert(made.get("n39").asNumber() == 78 && made.get("n0").asNumber() == 0, "built by hand");
    const names = made.keys();
    assert(names.length == 40 && names[0] == "n0" && names[39] == "n39", "the keys keep their order");

    // a copy finds its members too
    const copy = made.clone();
    assert(copy.length == 40 && copy.get("n20").asNumber() == 40 && !copy.has("n40"), "a copy");

    // and the text is the same after a round trip
    const text = made.stringify();
    assert(JSON.parse(text).stringify() == text, "a round trip");

    console.log("ALL DONE");
}
