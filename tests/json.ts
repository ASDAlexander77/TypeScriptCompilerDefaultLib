// JSON.parse gives a JsonValue, read through its accessors; JSON.stringify takes numbers, strings,
// booleans, null, arrays of those, JsonValues and classes with toJSON(). Values are built one step at
// a time, which works under every memory model; chained set() and push() too (see chained()).
class Point {
    constructor(public x: number) {
    }

    toJSON(): string {
        return `x=${this.x}`;
    }
}

// the way to write out a class with fields
class Person {
    constructor(public name: string, public age: number) {
    }

    toJSON(): JsonValue {
        const result = JsonValue.newObject();
        result.set("name", JsonValue.ofString(this.name));
        result.set("age", JsonValue.ofNumber(this.age));
        return result;
    }
}

function throwsSyntax(text: string): boolean {
    try {
        JSON.parse(text);
    } catch (e: SyntaxError) {
        return true;
    }

    return false;
}

function parsing() {
    const value = JSON.parse(`  {"a": 1.5, "b": [true, false, null, "s"], "c": {"d": -2e2}, "a2": "x"}\n`);
    assert(value.kind == "object", "an object");
    assert(value.length == 4, "four members");
    assert(value.get("a").asNumber() == 1.5, "a number");
    const list = value.get("b");
    assert(list.kind == "array" && list.length == 4, "an array");
    assert(list.at(0).asBoolean() && !list.at(1).asBoolean(), "booleans");
    assert(list.at(2).isNull() && list.at(2).kind == "null", "null");
    assert(list.at(3).asString() == "s", "a string");
    assert(value.get("c").get("d").asNumber() == -200, "nested, with an exponent");
    assert(value.has("a") && !value.has("z"), "has");
    assert(value.get("z").isNull(), "a missing key is a JSON null");
    assert(list.at(9).isNull(), "past the end is a JSON null");

    const keys = value.keys();
    assert(keys.length == 4 && keys[0] == "a" && keys[3] == "a2", "keys in order");

    assert(JSON.parse("[]").length == 0 && JSON.parse("{ }").length == 0, "empty");
    assert(JSON.parse("0").asNumber() == 0 && JSON.parse("-0.5e1").asNumber() == -5, "bare numbers");
    assert(JSON.parse(`"x"`).asString() == "x", "a bare string");

    // the last of a repeated key wins, in the first one's place
    const twice = JSON.parse(`{"k":1,"m":2,"k":3}`);
    assert(twice.length == 2 && twice.get("k").asNumber() == 3 && twice.keys()[0] == "k", "repeated key");
}

function strings() {
    assert(JSON.parse(`"a\\"\\\\\\/\\b\\f\\n\\r\\tz"`).asString() == "a\"\\/\b\f\n\r\tz", "the escapes");
    assert(JSON.parse(`"\\u0041\\u00e9\\u20ac"`).asString() == "A\u00e9\u20ac", "\\u of each UTF-8 length");
    assert(JSON.parse(`"\\ud83d\\ude00"`).asString() == "\u{1F600}", "a surrogate pair is one character");
    assert(JSON.parse(`"\\ud83dx"`).asString() == "\uFFFDx", "a surrogate alone is U+FFFD");
    assert(JSON.parse(`"\\ude00"`).asString() == "\uFFFD", "a low surrogate alone");
    assert(JSON.parse(`"\\ud83d\\u0041"`).asString() == "\uFFFDA", "what follows a lone surrogate is kept");
    assert(JSON.parse(`"h\u00e9"`).asString() == "h\u00e9", "UTF-8 goes through");
}

function rejected() {
    const bad = ["", " ", "{", "[", "[1", "[1,", "[1,]", "{\"a\"}", "{\"a\":}", "{\"a\":1,}", "{a:1}", "tru", "nul",
        "01", "1.", ".5", "1e", "+1", "-", "\"abc", "\"\\x\"", "\"\\u12\"", "\"\\u12G4\"", "1 2", "[1 2]", "'a'",
        "\"a\nb\"", "NaN", "Infinity", "// c\n1"];
    for (const text of bad) {
        assert(throwsSyntax(text), text);
    }

    assert(throwsSyntax(`"\\u0000"`), "a 0 in a string would cut it short");

    let deep = "";
    for (let i = 0; i < 100000; i++) deep += "[";
    let tooDeep = false;
    try {
        JSON.parse(deep);
    } catch (e: RangeError) {
        tooDeep = true;
    }

    assert(tooDeep, "deep nesting is an error, not a crash");

    let wrongKind = false;
    try {
        JSON.parse("1").asString();
    } catch (e: TypeError) {
        wrongKind = true;
    }

    assert(wrongKind, "asking a number for a string");
}

function writing() {
    assert(JSON.stringify(1.5) == "1.5", "a number");
    assert(JSON.stringify(<int>3) == "3", "an integer");
    assert(JSON.stringify(0.1 + 0.2) == "0.30000000000000004", "every digit");
    assert(JSON.stringify(NaN) == "null" && JSON.stringify(Infinity) == "null", "no NaN or Infinity in JSON");
    assert(JSON.stringify(-0) == "0", "no -0");
    assert(JSON.stringify(true) == "true" && JSON.stringify(false) == "false", "booleans");
    assert(JSON.stringify(null) == "null", "null");
    assert(JSON.stringify("a\"\\\n\t\u0001\u00e9") == `"a\\"\\\\\\n\\t\\u0001\u00e9"`, "a string, escaped");
    assert(JSON.stringify([1, 2, 3]) == "[1,2,3]", "an array");
    assert(JSON.stringify(["a", "b"]) == `["a","b"]`, "an array of strings");
    assert(JSON.stringify([[1], [2, 3]]) == "[[1],[2,3]]", "nested arrays");
    assert(JSON.stringify(new Point(2)) == `"x=2"`, "toJSON");
    assert(JSON.stringify(new Person("Ann", 30)) == `{"name":"Ann","age":30}`, "toJSON giving a JsonValue");
    assert(JSON.stringify([new Person("B", 1)]) == `[{"name":"B","age":1}]`, "in an array");
    assert(JSON.stringify(new Date(0)) == `"1970-01-01T00:00:00.000Z"`, "a Date");

    const list = JsonValue.newArray();
    list.push(JsonValue.ofString("x"));
    list.push(new JsonValue());
    const built = JsonValue.newObject();
    built.set("n", JsonValue.ofNumber(1));
    built.set("list", list);
    built.set("empty", JsonValue.newObject());
    built.set("none", JsonValue.newArray());
    assert(JSON.stringify(built) == `{"n":1,"list":["x",null],"empty":{},"none":[]}`, "a built value");
    assert(built.toString() == JSON.stringify(built), "toString");
    built.set("n", JsonValue.ofBoolean(true));
    assert(JSON.stringify(built) == `{"n":true,"list":["x",null],"empty":{},"none":[]}`, "set again keeps the place");

    const indented = JSON.stringify(JSON.parse(`{"a":[1,{}],"b":"c"}`), null, 2);
    assert(indented == `{\n  "a": [\n    1,\n    {}\n  ],\n  "b": "c"\n}`, "indented by a number");
    assert(JSON.stringify([1], null, "--") == "[\n--1\n]", "indented by a string");
    assert(JSON.stringify([1], null, 0) == "[1]", "indented by nothing");
}

// set() and push() return `this`, the object itself: a chain from a new value is the caller's under
// every model, returned or given to a parameter that keeps it.
function person(): JsonValue {
    return JsonValue.newObject().set("name", JsonValue.ofString("Ann")).set("age", JsonValue.ofNumber(30));
}

function chained() {
    assert(JSON.stringify(person()) == `{"name":"Ann","age":30}`, "a chain of set() returned");

    const built = JsonValue.newObject()
        .set("n", JsonValue.ofNumber(1))
        .set("list", JsonValue.newArray().push(JsonValue.ofString("x")).push(new JsonValue()))
        .set("empty", JsonValue.newObject());
    assert(JSON.stringify(built) == `{"n":1,"list":["x",null],"empty":{}}`, "a chained build");
    built.set("n", JsonValue.ofBoolean(true)).set("added", JsonValue.ofString("y"));
    assert(JSON.stringify(built) == `{"n":true,"list":["x",null],"empty":{},"added":"y"}`, "set again, chained");
}

// An object literal or a tuple: its fields are known from its type. Stringified first in its program, a
// value whose writing needs other instances of the writer (a number in an object, an array in an array)
// once failed to compile.
function objects() {
    assert(JSON.stringify({ x: 1 }) == `{"x":1}`, "an object literal");
    const record = { s: "a\"b", b: true, n: null, list: [1, 2], empty: {} };
    assert(JSON.stringify(record) == `{"s":"a\\"b","b":true,"n":null,"list":[1,2],"empty":{}}`, "every kind of field");
    assert(record.s == "a\"b", "the object is only read");
    assert(JSON.stringify({ outer: { inner: [{ z: "q" }] } }) == `{"outer":{"inner":[{"z":"q"}]}}`, "nested");
    assert(JSON.stringify([{ a: 1 }, { a: 2 }]) == `[{"a":1},{"a":2}]`, "an array of object literals");
    assert(JSON.stringify({ k: 2, f: () => 1 }) == `{"k":2}`, "a function is left out");
    assert(JSON.stringify([1, "a", true]) == `[1,"a",true]`, "a tuple is an array");
    assert(JSON.stringify({ a: 1, b: [2] }, null, 2) == `{\n  "a": 1,\n  "b": [\n    2\n  ]\n}`, "indented");
}

function roundTrip() {
    const text = `{"s":"a\\"b\\u00e9","n":[1,-2.5,1e+21],"o":{"t":true,"f":false,"z":null}}`;
    const again = JSON.stringify(JSON.parse(text));
    assert(JSON.stringify(JSON.parse(again)) == again, "stable through a round trip");
    assert(JSON.parse(again).get("n").at(2).asNumber() == 1e21, "values survive");
}

function main() {
    objects();
    parsing();
    strings();
    rejected();
    writing();
    chained();
    roundTrip();
    console.log("ALL DONE");
}
