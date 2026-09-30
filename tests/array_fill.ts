function main() {
    const array1 = [1, 2, 3, 4];

    // Fill with 0 from position 2 until position 4
    const zeros = array1.fill(0, 2, 4);
    console.log(zeros);
    // Expected output: Array [1, 2, 0, 0]
    assert(zeros.length == 4 && zeros[0] == 1 && zeros[1] == 2 && zeros[2] == 0 && zeros[3] == 0);

    // Fill with 5 from position 1
    const fives = array1.fill(5, 1);
    console.log(fives);
    // Expected output: Array [1, 5, 5, 5]
    assert(fives.length == 4 && fives[0] == 1 && fives[1] == 5 && fives[2] == 5 && fives[3] == 5);

    const sixes = array1.fill(6);
    console.log(sixes);
    // Expected output: Array [6, 6, 6, 6]
    assert(sixes.length == 4 && sixes[0] == 6 && sixes[1] == 6 && sixes[2] == 6 && sixes[3] == 6);

    // `end` is not filled: this wrote one past it, and past the end of the array when `end` is its length
    const inner = [1, 2, 3].fill(9, 1, 2);
    console.log(inner);
    // Expected output: Array [1, 9, 3]
    assert(inner.length == 3 && inner[0] == 1 && inner[1] == 9 && inner[2] == 3);

    console.log("ALL DONE");
}
