const paragraph = "I think Ruth's dog is cuter than your dog!";

console.log(paragraph.replaceAll("dog", "monkey"));
// Expected output: "I think Ruth's monkey is cuter than your monkey!"

assert(paragraph.replaceAll("dog", "monkey") == "I think Ruth's monkey is cuter than your monkey!");

// Global flag required when calling replaceAll with regex
const regex = /Dog/gi;

console.log(paragraph.replaceAll(regex, "ferret"));
// Expected output: "I think Ruth's ferret is cuter than your ferret!"

assert(paragraph.replaceAll(regex, "ferret") == "I think Ruth's ferret is cuter than your ferret!");

// extra test for infitine loop
console.log("xxx".replaceAll("", "_"));