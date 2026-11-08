// What works under every memory model, -mm=own too: parsing JSON, reading the result, and building a
// value one step at a time.
function main() {
    const value = JSON.parse(`{"name":"tslang","sizes":[1,2.5],"ok":true}`);
    assert(value.get("name").asString() == "tslang", "a string");
    assert(value.get("sizes").at(1).asNumber() == 2.5, "an element");
    assert(value.get("ok").asBoolean(), "a boolean");
    assert(value.get("missing").isNull(), "a missing key");
    assert(value.length == 3, "three members");

    const built = JsonValue.newObject();
    built.set("n", JsonValue.ofNumber(1));
    assert(built.get("n").asNumber() == 1, "a value that was set");
    assert(built.stringify() == `{"n":1}`, "written out");

    let failed = false;
    try {
        JSON.parse("{");
    } catch (e: SyntaxError) {
        failed = true;
    }

    assert(failed, "text that is not JSON");
    console.log("ALL DONE");
}
