// not own: reduceRight over an array of arrays may start from an element and return it as it is, a
// second owner of it, which -mm=own refuses by design
function main() {

  const array1 = [
    [0, 1],
    [2, 3],
    [4, 5],
  ];

  const result = array1.reduceRight((accumulator, currentValue) =>
    accumulator.concat(currentValue),
  );

  //console.log(result);
  if (result != undefined) console.log(result);

  // Expected output: Array [4, 5, 2, 3, 0, 1]
    console.log("ALL DONE");
}
