# process / fs

The command line, the environment, the working directory and the file system, synchronously. Both
are namespaces in `src/generics/lib.generics.ts` over the C++ wrapper `src/wrappers/os.cpp`.

## process

Node's `process`, with functions where Node has properties (a namespace in the library holds no
state of its own, so `argv` and `env` are read when they are asked for):

```ts
namespace process {
    function argv(): string[];                       // Node: process.argv
    function getEnv(name: string): string | undefined; // Node: process.env[name]
    function setEnv(name: string, value: string): void;
    function unsetEnv(name: string): void;           // Node: delete process.env[name]
    function env(): Map<string, string>;             // every variable, by name
    function cwd(): string;
    function chdir(directory: string): void;
    function pid(): int;
    function platform(): string;                     // "win32", "linux", "android", "darwin"
    function exit(code?: int): void;
}
```

- `argv()[0]` is the program. A compiled program's arguments follow it. Under the JIT the program
  is `tslang`, so its options come next, then the script, then the script's own arguments - the way
  `node script.js a b` gives `["node", "script.js", "a", "b"]`. On Linux and Android the arguments
  are read from `/proc/self/cmdline`, on Windows from `GetCommandLineW`.
- `setEnv` and `unsetEnv` change the environment of this process and of the processes it starts.
  A name that is empty or has an `=` in it is an `Error` (`EINVAL`). Unsetting a variable that is
  not set is no error. On Windows the variables are read and written through the Win32 API, which
  every C runtime in the process shares (under the JIT this library has a C runtime of its own),
  and names are case-insensitive there, as always on Windows.
- `exit(code)` flushes every C stream and ends the process: nothing after it runs, no `finally`
  block either. Under the JIT on Windows it flushes this library's streams (`console.log`,
  `Stdio`), not the host's, so text from `print()` not yet flushed may be lost there.

## fs

```ts
namespace fs {
    function existsSync(path: string): boolean;
    function statSync(path: string): FileStats;   // { isFile, isDirectory, size, mtimeMs }
    function readFileSync(path: string): Uint8Array;
    function readTextFileSync(path: string): string;
    function writeFileSync(path: string, data: Uint8Array): void;
    function writeTextFileSync(path: string, text: string): void;
    function appendFileSync(path: string, data: Uint8Array): void;
    function appendTextFileSync(path: string, text: string): void;
    function readdirSync(path: string): string[];
    function mkdirSync(path: string, options?: { recursive?: boolean }): void;
    function rmSync(path: string, options?: { recursive?: boolean, force?: boolean }): void;
    function rmdirSync(path: string): void;
    function renameSync(oldPath: string, newPath: string): void;
    function copyFileSync(src: string, dest: string): void;
}
```

- The names are Node's. Node's `readFileSync(path, "utf8")` and its `writeFileSync` that takes a
  string are `readTextFileSync` and `writeTextFileSync` here (Deno's names), since a function here
  has one result type: `readFileSync` gives bytes, `writeFileSync` takes them.
- Text is UTF-8, and a string ends at its first 0, so a file that is not text is read with
  `readFileSync`. Paths are UTF-8 on every platform; on Windows they go through the wide API, so a
  name outside the ANSI code page works.
- `statSync` follows symbolic links. `size` is in bytes; `mtimeMs` is the last modification in
  milliseconds since 1970, as `new Date(ms)` takes it (to the second on Windows).
- `readdirSync` gives the names in the directory, without `.` and `..`, sorted: the operating system
  gives them in no set order.
- `mkdirSync` without `recursive` needs the parent, and a directory already there is `EEXIST`; with
  it every missing parent is made too and a directory already there is no error.
- `rmSync` removes a file; a directory only with `recursive`, and then all it holds (`EISDIR`
  without). With `force` a path that is not there is no error. `rmdirSync` removes an empty
  directory.
- `renameSync` and `copyFileSync` replace a file already at the destination.
- Files of 2 GB or more are an `EFBIG` error: lengths are an `int`, as `Stdio`'s are.

An error is an `Error` whose message is Node's: the code, what it means, the call and the path.

```ts
try {
    fs.readTextFileSync("settings.json");
} catch (e: Error) {
    console.log(e.message); // ENOENT: no such file or directory, open 'settings.json'
}
```

The code is one of `ENOENT`, `EEXIST`, `EACCES`, `EPERM`, `ENOTDIR`, `EISDIR`, `ENOTEMPTY`, `EBUSY`,
`EINVAL`, `ENAMETOOLONG`, `EXDEV`, `EFBIG`, `ENOSPC`, `EROFS`, `EMFILE`, or `EIO` for any other; what
it means is the C runtime's wording, so its letter case differs between platforms.

## Example

```ts
function main() {
    const args = process.argv();
    const dir = args.length > 1 ? args[args.length - 1] : process.cwd();
    for (const name of fs.readdirSync(dir)) {
        const stats = fs.statSync(dir + "/" + name);
        console.log(stats.isDirectory ? `${name}/` : `${name} ${stats.size}`);
    }
}
```
