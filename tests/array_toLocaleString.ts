// toLocaleString takes a locale and options, as in JavaScript; with no locale data it gives the
// text toString gives.

function main() {
    const a = [1, 2, 3];
    assert(a.toLocaleString() == "1,2,3", "array toLocaleString()");
    assert(a.toLocaleString("en-US") == "1,2,3", "array toLocaleString(locale)");
    assert(a.toLocaleString("en-US", { style: "currency", currency: "EUR" }) == "1,2,3", "array toLocaleString(locale, options)");
    assert(a.toLocaleString(["en-US", "fr"]) == "1,2,3", "array toLocaleString(locales)");

    const s = ["x" + 1, "y"];
    assert(s.toLocaleString("fr", { timeZone: "UTC" }) == "x1,y", "string array");

    const i8 = new Int8Array(3);
    i8[1] = 5;
    assert(i8.toLocaleString() == "0,5,0", "Int8Array toLocaleString()");
    assert(i8.toLocaleString("en-US", { minimumFractionDigits: 2 }) == "0,5,0", "Int8Array toLocaleString(locale, options)");

    const c = new Uint8ClampedArray(2);
    c[0] = 300;
    assert(c.toLocaleString("en-US") == "255,0", "Uint8ClampedArray toLocaleString(locale)");

    print("ALL DONE");
}
