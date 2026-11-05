// not own: -mm=own cannot build Promise.reject (a thrown parameter), nor carry the string
// Promise.resolve returns, a borrow of its argument, out of an `await`.
// A rejected promise is a thrown exception: Promise.reject throws its reason, with its own class.

async function greet(name: string): Promise<string> {
    return "hello " + name;
}

function main() {
    assert(await Promise.resolve(greet("you")) == "hello you", "await resolve");

    let caught = false;
    try {
        Promise.reject<int>(new Error("no"));
    } catch (e: Error) {
        caught = e.message == "no";
    }

    assert(caught, "reject throws its reason");

    let caughtRange = false;
    try {
        Promise.reject(new RangeError("range"));
    } catch (e: RangeError) {
        caughtRange = e.message == "range";
    }

    assert(caughtRange, "reject keeps the reason's class");

    print("ALL DONE");
}
