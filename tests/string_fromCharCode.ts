function main() {
    assert(String.fromCharCode() == "", "no codes");
    assert(String.fromCharCode(72, 101, 108, 108, 111) == "Hello", "ASCII");

    // strings are UTF-8: a code takes as many bytes as its UTF-8 form
    const e = String.fromCharCode(0xE9);
    assert(e.length == 2 && e == "é", "two bytes");
    const euro = String.fromCharCode(0x20AC);
    assert(euro.length == 3 && euro == "€", "three bytes");

    // a surrogate pair is one character of four bytes
    const smile = String.fromCharCode(0xD83D, 0xDE00);
    assert(smile.length == 4 && smile == "😀", "surrogate pair");

    // a code is a UTF-16 unit: only its low 16 bits count, as in JavaScript
    assert(String.fromCharCode(0x10041) == "A", "low 16 bits");

    // a string's character codes round-trip
    const text = "round trip";
    const codes: int[] = [];
    for (let i = 0; i < text.length; i++) codes.push(text.charCodeAt(i));
    assert(String.fromCharCode(...codes) == text, "round trip");

    console.log(String.fromCharCode(72, 105, 33), e, euro, smile);
    console.log("ALL DONE");
}
