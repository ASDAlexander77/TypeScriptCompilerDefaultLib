// process: the command line, the environment, the working directory, and what the process is.
function errorOf(f: () => void): string {
    try {
        f();
    } catch (e: Error) {
        return e.message;
    }

    return "";
}

function main() {
    // argv()[0] is the program: the test's executable, or tslang under the JIT, followed there by
    // the script. Either way one of them names this test.
    const args = process.argv();
    assert(args.length >= 1, "the program is the first argument");
    let named = false;
    for (const arg of args) {
        if (arg.includes("process")) {
            named = true;
        }
    }
    assert(named, "the command line names this test");

    // the environment
    assert(process.getEnv("TSLANG_TEST_NOT_SET_ANYWHERE") == undefined, "a variable that is not set");
    process.setEnv("TSLANG_TEST_VAR", "value one");
    assert(process.getEnv("TSLANG_TEST_VAR") == "value one", "a variable just set");
    process.setEnv("TSLANG_TEST_VAR", "é and €");
    assert(process.getEnv("TSLANG_TEST_VAR") == "é and €", "set again, to UTF-8");
    process.setEnv("TSLANG_TEST_EMPTY", "");
    assert(process.getEnv("TSLANG_TEST_EMPTY") == "", "set to nothing is still set");

    const vars = process.env();
    assert(vars.get("TSLANG_TEST_VAR") == "é and €", "env() has it");
    assert(vars.size > 1, "env() has more than this test's own");

    process.unsetEnv("TSLANG_TEST_VAR");
    assert(process.getEnv("TSLANG_TEST_VAR") == undefined, "unset");
    process.unsetEnv("TSLANG_TEST_VAR");
    assert(!process.env().has("TSLANG_TEST_VAR"), "env() no longer has it");

    assert(errorOf(() => { process.setEnv("A=B", "x"); }).startsWith("EINVAL"), "a name with =");
    assert(errorOf(() => { process.setEnv("", "x"); }).startsWith("EINVAL"), "an empty name");

    // the working directory
    const start = process.cwd();
    assert(start.length > 0, "a working directory");
    process.chdir("tests");
    const inTests = process.cwd();
    assert(inTests != start && inTests.endsWith("tests"), "chdir into tests");
    process.chdir("..");
    assert(process.cwd() == start, "and back");
    assert(errorOf(() => { process.chdir("no such directory here"); }).startsWith("ENOENT"), "chdir to nowhere");

    assert(process.pid() > 0, "a process id");

    const platform = process.platform();
    assert(platform == "win32" || platform == "linux" || platform == "android" || platform == "darwin", "a platform");

    console.log("ALL DONE");
}
