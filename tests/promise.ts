// Promise<T> is T: an async function returns its value and `await` gives it back. The Promise
// functions take and return such values, already settled. Promise.reject is in promise_reject.ts.

async function twice(n: int): Promise<int> {
    return n * 2;
}

function main() {
    const one: Promise<int> = Promise.resolve(1);
    assert(one == 1, "resolve");

    const both = Promise.all([twice(2), twice(5)]);
    assert(both.length == 2 && both[0] == 4 && both[1] == 10, "all");

    const awaited = await Promise.all([twice(3), twice(4)]);
    assert(awaited[0] == 6 && awaited[1] == 8, "await all");

    assert(Promise.race([twice(7), twice(8)]) == 14, "race");
    assert(Promise.any(["a", "b"]) == "a", "any");

    const settled = Promise.allSettled([1, 2]);
    assert(settled.length == 2 && settled[0].status == "fulfilled" && settled[1].value == 2, "allSettled");

    let raceCaught = false;
    try {
        const none: int[] = [];
        Promise.race(none);
    } catch (e: Error) {
        raceCaught = true;
    }

    assert(raceCaught, "race of no values");

    print("ALL DONE");
}
