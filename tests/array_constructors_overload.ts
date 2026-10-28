function main() {

    const a = new Array<number>(10);

    assert(a.length === 10 && a[0] === 0);

    const b = new Array(10, 20, 30);

    assert(b.length === 3 && b[0] === 10 && b[1] === 20 && b[2] === 30);

    console.log("ALL DONE");
}
