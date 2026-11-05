// not own
// An awaited Promise.all. Under -mm=own on Linux, tslang reports the array literal's temporary as
// "moved here on some paths only" at the await; it builds under own on Windows. Kept apart from
// promise.ts so the rest of that test still runs under own everywhere.

async function twice(n: int): Promise<int> {
    return n * 2;
}

function main() {
    const awaited = await Promise.all([twice(3), twice(4)]);
    assert(awaited.length == 2 && awaited[0] == 6 && awaited[1] == 8, "await all");

    print("ALL DONE");
}
