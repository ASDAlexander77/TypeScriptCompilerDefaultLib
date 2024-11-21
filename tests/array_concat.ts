let fruits = ["banana", "apple", "peach"];
console.log(fruits.length); 

const newFruits = fruits.concat(["banana", "apple", "peach"]);

for (const fruit of fruits) console.log("item = ", fruit);
for (const fruit of newFruits) console.log("item = ", fruit);
