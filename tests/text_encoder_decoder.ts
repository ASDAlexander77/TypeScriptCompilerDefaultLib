// TextEncoder / TextDecoder: strings are UTF-8, so encode copies their bytes and decode checks them,
// each ill-formed sequence becoming U+FFFD, or a TypeError with `fatal`.
function bytesOf(...values: int[]): Uint8Array {
    const data: u8[] = [];
    for (const v of values) {
        data.push(<u8>v);
    }

    return new Uint8Array(data);
}

function main() {
    const encoder = new TextEncoder();
    assert(encoder.encoding == "utf-8", "encoder encoding");

    // "a", "é" (2 bytes), "€" (3), "😀" (4)
    const text = "aé€😀";
    const bytes = encoder.encode(text);
    assert(bytes.length == 10, "10 bytes");
    assert(bytes[0] == 0x61, "a");
    assert(bytes[1] == 0xC3 && bytes[2] == 0xA9, "é");
    assert(bytes[3] == 0xE2 && bytes[4] == 0x82 && bytes[5] == 0xAC, "€");
    assert(bytes[6] == 0xF0 && bytes[7] == 0x9F && bytes[8] == 0x98 && bytes[9] == 0x80, "😀");
    assert(encoder.encode().length == 0, "nothing to encode");

    const decoder = new TextDecoder();
    assert(decoder.encoding == "utf-8", "decoder encoding");
    assert(!decoder.fatal && !decoder.ignoreBOM, "decoder defaults");
    assert(decoder.decode(bytes) == text, "round trip");
    assert(decoder.decode() == "", "nothing to decode");

    // encodeInto writes whole characters only; read counts UTF-16 units
    const destination = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    const result = encoder.encodeInto(text, destination);
    assert(result.read == 3 && result.written == 6, "a, é and € fit, 😀 does not");
    const whole = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const all = encoder.encodeInto(text, whole);
    assert(all.read == 5 && all.written == 10, "😀 counts as two units");

    // a leading byte order mark is dropped, unless ignoreBOM
    const withBOM = bytesOf(0xEF, 0xBB, 0xBF, 0x68, 0x69);
    assert(decoder.decode(withBOM) == "hi", "BOM dropped");
    // fromCharCode, not a "﻿" literal: tslang reads that literal as an empty string
    const bom = String.fromCharCode(0xFEFF);
    assert(new TextDecoder("utf-8", { ignoreBOM: true }).decode(withBOM) == bom + "hi", "BOM kept");

    // ill-formed input: one U+FFFD per maximal subpart
    assert(decoder.decode(bytesOf(0x61, 0xFF, 0x62)) == "a�b", "an invalid byte");
    assert(decoder.decode(bytesOf(0x61, 0xE2, 0x82)) == "a�", "a truncated sequence at the end");
    assert(decoder.decode(bytesOf(0xE2, 0x82, 0x61)) == "�a", "a truncated sequence, then ASCII");
    assert(decoder.decode(bytesOf(0xC0, 0x80)) == "��", "an overlong encoding");
    assert(decoder.decode(bytesOf(0xED, 0xA0, 0x80)) == "���", "a surrogate");

    let threw = false;
    try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytesOf(0x61, 0xFF));
    } catch (e) {
        threw = true;
    }

    assert(threw, "fatal throws on ill-formed input");

    let rejected = false;
    try {
        new TextDecoder("latin1");
    } catch (e) {
        rejected = true;
    }

    assert(rejected, "only utf-8");
    assert(new TextDecoder(" UTF8 ").encoding == "utf-8", "a label is trimmed and its case ignored");

    console.log("ALL DONE");
}
