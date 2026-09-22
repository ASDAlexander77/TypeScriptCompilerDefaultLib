console.log("xxx".replaceAll("", "_"));
// Expected output: "_x_x_x_"

assert("xxx".replaceAll("", "_") == "_x_x_x_");

console.log("xxx".replace("", "_"));
// Expected output: "_xxx"

assert("xxx".replace("", "_") == "_xxx");

// control: normal, non-empty pattern, adjacent matches
console.log("xxxx".replaceAll("x", "_"));
// Expected output: "____"

assert("xxxx".replaceAll("x", "_") == "____");

// control: overlapping pattern (matches don't re-scan consumed characters)
console.log("aaa".replaceAll("aa", "_"));
// Expected output: "_a"

assert("aaa".replaceAll("aa", "_") == "_a");

// control: match at the very end of the subject
console.log("xax".replaceAll("x", "_"));
// Expected output: "_a_"

assert("xax".replaceAll("x", "_") == "_a_");

// control: empty subject with an empty pattern
console.log("".replaceAll("", "_"));
// Expected output: "_"

assert("".replaceAll("", "_") == "_");

// control: no match
console.log("abc".replaceAll("z", "_"));
// Expected output: "abc"

assert("abc".replaceAll("z", "_") == "abc");

// control: pattern longer than the subject
console.log("xxx".replaceAll("xxxx", "_"));
// Expected output: "xxx"

assert("xxx".replaceAll("xxxx", "_") == "xxx");

console.log("ALL DONE");
