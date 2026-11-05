// An awaited Promise.all, in a function of its own. Beside a typed `catch` (on Linux, where such a
// function body is wrapped for its cleanup) it failed under -mm=own until the compiler emptied a
// moved-from slot (TypeScriptCompiler #771); this file has no catch and builds under own as it is.

async function twice(n: int): Promise<int> {
    return n * 2;
}

function main() {
    const awaited = await Promise.all([twice(3), twice(4)]);
    assert(awaited.length == 2 && awaited[0] == 6 && awaited[1] == 8, "await all");

    print("ALL DONE");
}
