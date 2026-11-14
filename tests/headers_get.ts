// Headers.get gives the value, or null when there is no such header. The class's private methods
// used to be declared before its public ones, so a program's call of `get` ran another method.
function main() {
    const h = new Headers();
    h.set("Content-Type", "text/plain");
    h.append("Accept", "a");
    h.append("accept", "b");

    const type = h.get("content-type");
    assert(type != null, "a header that is there");
    if (type != null) {
        assert(type == "text/plain", "its value");
    }

    const accept = h.get("ACCEPT");
    if (accept != null) {
        assert(accept == "a, b", "appended values are joined");
    }

    assert(h.get("x-missing") == null, "null for a header that is not there");
    assert(h.has("accept"), "has");
    assert(!h.has("x-missing"), "has not");

    h.delete("accept");
    assert(h.get("accept") == null, "null once deleted");
    assert(h.toRawString() == "content-type: text/plain\r\n", "raw");

    console.log("ALL DONE");
}
