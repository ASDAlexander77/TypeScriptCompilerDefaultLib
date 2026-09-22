// A `const` array literal used to keep mutations to itself: `.sort()`/`.reverse()`
// silently did nothing (they mutated a throwaway copy the compiler made for the
// call), and a direct element write crashed (it wrote into what the compiler treated
// as read-only constant data). Fixed in the tslang compiler (identity storage for
// `const` array literals); this exercises the exact reported scenario - the default
// library's Array.sort()/reverse() - both at module scope and inside a function.
const moduleArr = [3, 1, 2];

moduleArr.sort((a, b) => a - b);
console.log(moduleArr);
// Expected output: Array [1, 2, 3]
assert(moduleArr[0] == 1 && moduleArr[1] == 2 && moduleArr[2] == 3);

moduleArr.reverse();
console.log(moduleArr);
// Expected output: Array [3, 2, 1]
assert(moduleArr[0] == 3 && moduleArr[1] == 2 && moduleArr[2] == 1);

moduleArr[0] = 9;
console.log(moduleArr);
// Expected output: Array [9, 2, 1]
assert(moduleArr[0] == 9 && moduleArr[1] == 2 && moduleArr[2] == 1);

function main() {
    const arr = [3, 1, 2];

    arr.sort((a, b) => a - b);
    console.log(arr);
    // Expected output: Array [1, 2, 3]
    assert(arr[0] == 1 && arr[1] == 2 && arr[2] == 3);

    arr.reverse();
    console.log(arr);
    // Expected output: Array [3, 2, 1]
    assert(arr[0] == 3 && arr[1] == 2 && arr[2] == 1);

    arr[0] = 9;
    console.log(arr);
    // Expected output: Array [9, 2, 1]
    assert(arr[0] == 9 && arr[1] == 2 && arr[2] == 1);

    console.log("ALL DONE");
}
