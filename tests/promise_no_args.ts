// Promise.resolve() and Promise.reject() with no argument: resolve gives a settled promise of
// nothing (void), reject throws undefined, as JavaScript rejects with undefined.

async function done(): Promise<void> {
    await Promise.resolve();
}

function main() {
    await Promise.resolve();
    done();

    let caught = false;
    try {
        Promise.reject();
    } catch (e) {
        caught = true;
    }

    assert(caught, "reject() throws");

    let caughtTyped = false;
    try {
        const n: int = Promise.reject<int>();
        print(n);
    } catch (e) {
        caughtTyped = true;
    }

    assert(caughtTyped, "reject<int>() throws");

    print("ALL DONE");
}
