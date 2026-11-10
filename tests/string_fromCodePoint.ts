// String.fromCodePoint: each code point as its UTF-8 bytes.
function rangeError(f: () => void): boolean {
    try {
        f();
    } catch (e: RangeError) {
        return true;
    }

    return false;
}

function main() {
    assert(String.fromCodePoint() == "", "no code points");
    assert(String.fromCodePoint(72, 105) == "Hi", "ASCII");

    const e = String.fromCodePoint(0xE9);
    assert(e.length == 2 && e == "é", "two bytes");
    const euro = String.fromCodePoint(0x20AC);
    assert(euro.length == 3 && euro == "€", "three bytes");

    // one code point, not a surrogate pair as fromCharCode takes
    const smile = String.fromCodePoint(0x1F600);
    assert(smile.length == 4 && smile == "😀", "four bytes");
    assert(smile == String.fromCharCode(0xD83D, 0xDE00), "the same as the surrogate pair");
    assert(String.fromCodePoint(0x10FFFF).length == 4, "the last code point");

    assert(rangeError(() => { String.fromCodePoint(0x110000); }), "past the last code point");
    assert(rangeError(() => { String.fromCodePoint(-1); }), "negative");

    // fromCharCode still the same after sharing its encoder
    assert(String.fromCharCode(0xD83D, 0xDE00) == "😀" && String.fromCharCode(0xE9) == "é", "fromCharCode");

    console.log(String.fromCodePoint(0x48, 0x1F600, 0x20AC));
    console.log("ALL DONE");
}
