console.log("xxx".replaceAll("", "_"));
// Expected output: "_x_x_x_"

assert("xxx".replaceAll("", "_") == "_x_x_x_");

console.log("xxx".replace("", "_"));
// Expected output: "_xxx"

assert("xxx".replace("", "_") == "_xxx");

// control: normal, non-empty pattern
console.log("xxxx".replaceAll("x", "_"));
// Expected output: "____"

assert("xxxx".replaceAll("x", "_") == "____");

console.log("ALL DONE");
