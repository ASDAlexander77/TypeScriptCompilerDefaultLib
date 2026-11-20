// not own: there the arguments array is only lent to Reflect.construct, which can't give its string to the object
// Reflect.construct of a class that keeps what it is given: the object holds the arguments' values.
class Pair {
    constructor(public name: string, public values: number[]) {}
}

function main() {
    const pair = Reflect.construct(Pair, ["a", [1, 2]]);
    assert(pair.name == "a", "the string kept");
    assert(pair.values.length == 2 && pair.values[1] == 2, "the array kept");

    print("ALL DONE");
}
