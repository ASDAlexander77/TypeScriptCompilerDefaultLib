// fs: files and directories, synchronously. Works in __fs_test under the working directory, the
// repository root, which it removes first and last.
function errorOf(f: () => void): string {
    try {
        f();
    } catch (e: Error) {
        return e.message;
    }

    return "";
}

function main() {
    const dir = "__fs_test";
    fs.rmSync(dir, { recursive: true, force: true });
    assert(!fs.existsSync(dir), "nothing there to start with");

    // directories
    fs.mkdirSync(dir);
    assert(fs.existsSync(dir), "made");
    assert(fs.statSync(dir).isDirectory, "a directory");
    assert(errorOf(() => { fs.mkdirSync(dir); }).startsWith("EEXIST"), "made twice");
    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(dir + "/a/b/c", { recursive: true });
    assert(fs.statSync(dir + "/a/b/c").isDirectory, "and its parents");
    assert(errorOf(() => { fs.mkdirSync(dir + "/x/y"); }).startsWith("ENOENT"), "a missing parent");

    // text
    const file = dir + "/hello.txt";
    fs.writeTextFileSync(file, "hello");
    assert(fs.readTextFileSync(file) == "hello", "written and read");
    fs.appendTextFileSync(file, ", world\n");
    assert(fs.readTextFileSync(file) == "hello, world\n", "appended");
    fs.writeTextFileSync(file, "aé€😀");
    assert(fs.readTextFileSync(file) == "aé€😀", "UTF-8, and written over");

    const stats = fs.statSync(file);
    assert(stats.isFile && !stats.isDirectory, "a file");
    assert(stats.size == 10, "10 bytes");
    assert(stats.mtimeMs > 0, "a modification time");

    fs.writeTextFileSync(file, "");
    assert(fs.readTextFileSync(file) == "" && fs.statSync(file).size == 0, "emptied");

    // bytes, a 0 among them
    const data = dir + "/data.bin";
    fs.writeFileSync(data, new Uint8Array([1, 0, 255, 10]));
    fs.appendFileSync(data, new Uint8Array([13]));
    const bytes = fs.readFileSync(data);
    assert(bytes.length == 5, "5 bytes");
    assert(bytes[0] == 1 && bytes[1] == 0 && bytes[2] == 255 && bytes[3] == 10 && bytes[4] == 13, "as they were");
    fs.writeFileSync(data, new Uint8Array([]));
    assert(fs.readFileSync(data).length == 0, "no bytes");

    // copy, rename, list
    fs.writeTextFileSync(file, "copied");
    fs.copyFileSync(file, dir + "/copy.txt");
    assert(fs.readTextFileSync(dir + "/copy.txt") == "copied", "copied");
    fs.renameSync(dir + "/copy.txt", dir + "/renamed.txt");
    assert(!fs.existsSync(dir + "/copy.txt") && fs.readTextFileSync(dir + "/renamed.txt") == "copied", "renamed");

    const names = fs.readdirSync(dir);
    assert(names.length == 4, "four entries");
    assert(names[0] == "a" && names[1] == "data.bin" && names[2] == "hello.txt" && names[3] == "renamed.txt", "sorted");
    assert(fs.readdirSync(dir + "/a/b/c").length == 0, "an empty directory");

    // errors
    assert(errorOf(() => { fs.readTextFileSync(dir + "/missing.txt"); }).startsWith("ENOENT"), "read what is not there");
    assert(errorOf(() => { fs.readFileSync(dir + "/missing.txt"); }).includes("missing.txt"), "the message names the path");
    assert(errorOf(() => { fs.statSync(dir + "/missing.txt"); }).startsWith("ENOENT"), "stat what is not there");
    assert(errorOf(() => { fs.readdirSync(file); }).startsWith("ENOTDIR") || errorOf(() => { fs.readdirSync(file); }).startsWith("ENOENT"), "list a file");
    assert(errorOf(() => { fs.renameSync(dir + "/missing.txt", dir + "/x.txt"); }).startsWith("ENOENT"), "rename what is not there");
    assert(errorOf(() => { fs.writeTextFileSync(dir + "/x/y/z.txt", "no"); }).startsWith("ENOENT"), "write under a missing directory");

    // removing
    assert(errorOf(() => { fs.rmSync(dir + "/a"); }).startsWith("EISDIR"), "rm a directory without recursive");
    assert(errorOf(() => { fs.rmdirSync(dir + "/a"); }) != "", "rmdir a directory that is not empty");
    fs.rmdirSync(dir + "/a/b/c");
    assert(!fs.existsSync(dir + "/a/b/c"), "rmdir an empty one");
    fs.rmSync(file);
    assert(!fs.existsSync(file), "rm a file");
    assert(errorOf(() => { fs.rmSync(file); }).startsWith("ENOENT"), "rm it again");
    fs.rmSync(file, { force: true });

    fs.rmSync(dir, { recursive: true });
    assert(!fs.existsSync(dir), "and all of it");

    console.log("ALL DONE");
}
