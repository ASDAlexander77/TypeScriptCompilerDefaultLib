// A String object's startsWith gives a boolean: lib.d.ts declared it with no result type, so a call
// had no value (`const r = s.startsWith("he")` left `r` unresolved) while lib.ts returned one.
// scripts\check_declarations.ps1 found it, comparing each declaration with what lib.ts compiles to.
function main() {
    const s = new String("hello");
    const r = s.startsWith("he");
    assert(r, "a prefix");
    assert(!s.startsWith("lo"), "not a prefix");
    assert(s.startsWith("lo", 3), "from a position");
    console.log("ALL DONE");
}
