// JsonValue by key: value["name"] and value[0] read through get(), value["name"] = member and
// value[0] = element write through set(). A key that names a JsonValue member (length, kind, ...) is
// that member.
function read(value: JsonValue) {
    assert(value["name"].asString() == "tslang", "a literal key");
    assert(value["sizes"][1].asNumber() == 2.5, "an element of a member");
    assert(value["sizes"][7].isNull(), "an element past the end");
    assert(value["missing"].isNull(), "a missing key");

    const key = "ok";
    assert(value[key].asBoolean(), "a const key");

    let other = "name";
    assert(value[other].asString() == "tslang", "a variable key");

    let index = 0;
    assert(value["sizes"][index].asNumber() == 1, "a variable index");

    // members of JsonValue, not of the JSON object
    assert(value["length"] == 3, "the length getter");
    assert(value["kind"] == "object", "the kind getter");

    // the methods take keys and indexes too
    assert(value.get("sizes").get(1).asNumber() == 2.5, "get with an index");
}

function write() {
    const value = JsonValue.newObject();
    value["n"] = JsonValue.ofNumber(1);
    value["s"] = JsonValue.ofString("a");
    value["n"] = JsonValue.ofNumber(2);
    assert(value["n"].asNumber() == 2, "a member written again");
    assert(value.stringify() == `{"n":2,"s":"a"}`, "written out, in order");

    const list = JsonValue.newArray();
    list[0] = JsonValue.ofNumber(1);
    list[2] = JsonValue.ofNumber(3);
    list[0] = JsonValue.ofNumber(0);
    assert(list.length == 3, "an element past the end makes room");
    assert(list.stringify() == `[0,null,3]`, "with nulls before it");
}

function main() {
    read(JSON.parse(`{"name":"tslang","sizes":[1,2.5],"ok":true}`));

    // Under -mm=own, two writes by key to a JsonValue crash the compiler (TypeScriptCompiler,
    // a known issue); value.set(key, member) works there.
    if (__MEMORY_MODEL__ != "own") {
        write();
    }

    // an index that is not there in an array to write
    let failed = false;
    try {
        JsonValue.newArray().set(-1, JsonValue.ofNumber(1));
    } catch (e: RangeError) {
        failed = true;
    }

    assert(failed, "a negative index");

    console.log("ALL DONE");
}
