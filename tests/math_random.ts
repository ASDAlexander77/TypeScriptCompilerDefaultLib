// Math.random is spread over [0, 1): on Windows nothing above 0.000016 came back, as the range of
// rand() there is 32767 and the larger one of Linux was assumed
function main() {
    let lowest = 1.0;
    let highest = 0.0;
    let sum = 0.0;
    const count = 10000;
    for (let i = 0; i < count; i++) {
        const r = Math.random();
        assert(r >= 0 && r < 1, "in [0, 1)");
        if (r < lowest) lowest = r;
        if (r > highest) highest = r;
        sum += r;
    }

    assert(lowest < 0.01, "some near 0");
    assert(highest > 0.99, "some near 1");
    const mean = sum / count;
    assert(mean > 0.45 && mean < 0.55, "about a half on average");

    console.log("ALL DONE");
}
