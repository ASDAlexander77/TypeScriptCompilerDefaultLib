// A position or index outside the string is clamped, as in JavaScript, before it becomes a pointer
// into the string or a byte count: slice with its end before its start computed a negative count
// and copied past the result (#27); a negative position read before the string; a position past
// the end read after its terminator. trim, which dropped the last kept character, is here too.
function main() {
    const s = "abcdef";

    // slice: an end at or before the start is empty - slice does not swap, substring does
    assert(s.slice(4, 1) == "", "slice(4, 1)");
    assert(s.slice(-1, -3) == "", "slice(-1, -3)");
    assert(s.slice(3, 3) == "", "slice(3, 3)");
    assert(s.slice(2, 4) == "cd", "slice(2, 4)");
    assert(s.slice(-3) == "def", "slice(-3)");
    assert(s.slice(-10, 2) == "ab", "slice(-10, 2)");
    assert(s.slice(4, 100) == "ef", "slice(4, 100)");
    assert(s.slice(10) == "", "slice(10)");
    assert(s.substring(4, 1) == "bcd", "substring(4, 1) swaps");

    // a negative end counts from the end: the parameter was the type of `length`, unsigned, so a
    // negative end became huge and was clamped to the length
    assert(s.slice(1, -3) == "bc", "slice(1, -3)");
    assert(s.slice(-1, 3) == "", "slice(-1, 3)");
    assert(s.substring(1, -3) == "a", "substring(1, -3) is substring(0, 1)");
    assert(!s.endsWith("ab", -1), "endsWith('ab', -1)");

    // startsWith: a negative position is 0
    assert(s.startsWith("ab", -5), "startsWith('ab', -5)");
    assert(!s.startsWith("b", -5), "startsWith('b', -5)");

    // endsWith: the end position is clamped to [0, length]
    assert(s.endsWith("ef", 100), "endsWith('ef', 100)");
    assert(s.endsWith("ab", 2), "endsWith('ab', 2)");
    assert(!s.endsWith("a", -5), "endsWith('a', -5)");
    assert(s.endsWith("", -5), "endsWith('', -5)");

    // includes: a negative position is 0, one past the end finds only ""
    assert(s.includes("a", -5), "includes('a', -5)");
    assert(!s.includes("f", 10), "includes('f', 10)");
    assert(s.includes("", 10), "includes('', 10)");

    // indexOf: as includes, and past the end nothing but "" is found
    assert(s.indexOf("b", -5) == 1, "indexOf('b', -5)");
    assert(s.indexOf("x", 10) == -1, "indexOf('x', 10)");
    assert(s.indexOf("f", 10) == -1, "indexOf('f', 10)");
    assert(s.indexOf("", 10) == 6, "indexOf('', 10)");

    // lastIndexOf: the position is clamped to [0, length]
    assert(s.lastIndexOf("a", 100) == 0, "lastIndexOf('a', 100)");
    assert(s.lastIndexOf("f", 100) == 5, "lastIndexOf('f', 100)");
    assert(s.lastIndexOf("", 100) == 6, "lastIndexOf('', 100)");
    assert(s.lastIndexOf("a", -5) == 0, "lastIndexOf('a', -5)");
    assert(s.lastIndexOf("b", -5) == -1, "lastIndexOf('b', -5)");

    // padStart / padEnd: an empty pad string pads nothing
    assert("x".padStart(5, "") == "x", "padStart(5, '')");
    assert("x".padEnd(5, "") == "x", "padEnd(5, '')");
    assert("x".padStart(3, "ab") == "abx", "padStart(3, 'ab')");
    assert("x".padEnd(4, "ab") == "xaba", "padEnd(4, 'ab')");

    // trim: substring's end is exclusive, and the last kept character was passed as the end
    assert("  ab  ".trim() == "ab", "trim");
    assert("ab".trim() == "ab", "trim, nothing to trim");
    assert("   ".trim() == "", "trim, all spaces");
    assert("".trim() == "", "trim, empty");
    assert("  ab  ".trimStart() == "ab  ", "trimStart");
    assert("   ".trimStart() == "", "trimStart, all spaces");
    assert("  ab  ".trimEnd() == "  ab", "trimEnd");
    assert("ab".trimEnd() == "ab", "trimEnd, nothing to trim");
    assert("   ".trimEnd() == "", "trimEnd, all spaces");
    assert("".trimEnd() == "", "trimEnd, empty");

    console.log("ALL DONE");
}
