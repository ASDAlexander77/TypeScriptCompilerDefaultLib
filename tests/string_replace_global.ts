// RegExp.replace with the "g" flag replaces every match, as replaceAll does; without it,
// only the first. A pattern that matches nothing gives the string back unchanged.
assert("abcabc".replace(new RegExp("a", "g"), "x") == "xbcxbc");
assert("abcabc".replace(/a/g, "x") == "xbcxbc");
assert("abcabc".replace(/a/, "x") == "xbcabc");
assert("John Smith, Jane Doe".replace(/(\w+)\s(\w+)/g, "$2 $1") == "Smith John, Doe Jane");
assert("Dog dog DOG".replace(/dog/gi, "cat") == "cat cat cat");

assert("abc".replace(/z/, "y") == "abc");
assert("abc".replace(/z/g, "y") == "abc");

console.log("ALL DONE");
