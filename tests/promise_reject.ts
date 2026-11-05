// A rejected promise is a thrown exception: Promise.reject throws its reason, with its own class.
// The string Promise.resolve returns borrows its argument; under -mm=own the await gives back a copy.

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
