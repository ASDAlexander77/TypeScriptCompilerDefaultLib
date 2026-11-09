# TypeScriptCompilerDefaultLib

[![Tests](https://github.com/ASDAlexander77/TypeScriptCompilerDefaultLib/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/ASDAlexander77/TypeScriptCompilerDefaultLib/actions/workflows/tests.yml)

Implementation of Default Core Library for TypeScript Compiler

Tests of the latest push to `main`, by memory model:

| | `gc` | `rc` | `none` | `own` |
|---|---|---|---|---|
| Windows | ![Windows gc](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Fwindows-gc.json) | ![Windows rc](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Fwindows-rc.json) | ![Windows none](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Fwindows-none.json) | ![Windows own](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Fwindows-own.json) |
| Ubuntu 24.04 | ![Ubuntu gc](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Flinux-gc.json) | ![Ubuntu rc](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Flinux-rc.json) | ![Ubuntu none](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Flinux-none.json) | ![Ubuntu own](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FASDAlexander77%2FTypeScriptCompilerDefaultLib%2Fbadges%2Flinux-own.json) |

Each badge covers release and debug builds, compiled and under the JIT.

## Building

```
build.bat                  # x64, release and debug, all three memory models
build.bat release gc       # x64, just that one
```

Every build stages into one tree, `__build\defaultlib`, which a program takes with
`--default-lib-path=__build`. The binaries are split by target, as its LLVM triple names it
(arch, vendor, OS, environment), then by build mode, then by memory model:

```
__build\defaultlib\{lib,dll}\<arch>\<vendor>\<os>\<env>\<debug|release>\<gc|rc|none>\
  e.g. lib\x86_64\pc\windows\msvc\release\gc\TypeScriptDefaultLib.lib
       lib\aarch64\unknown\linux\android\release\gc\libTypeScriptDefaultLib.a
__build\defaultlib\*.d.ts, generics\ ...   (the declarations, shared by every build)
```

The scripts do not spell these folders out: they ask the compiler, which looks the library up
the same way (`tslang --print-default-lib-dir=<lib|dll> [-mtriple=...] [--di] -mm=<model>`).

For 32-bit Windows, set `TSLANG_ARCH=x86` before calling `build.bat` (it is an
environment variable, not a positional argument, the same idiom as `TSLANG_TOOLCHAIN`):

```
set TSLANG_ARCH=x86
build.bat
```

Clear it afterwards - `set TSLANG_ARCH=` (or `Remove-Item Env:TSLANG_ARCH` in
PowerShell) - since it is a session-wide environment variable, not a
one-shot argument: a later plain `build.bat` or `tslang --install-default-lib`
run in the same shell would otherwise silently build only the x86 tree.

This stages into `__build\defaultlib\{lib,dll}\i386\pc\windows\msvc\<debug|release>\<gc|rc|none>\`,
alongside the x64 tree. It requires two things already built in the compiler
repo:

- the x86 Boehm GC: `prepare_3rdParty.bat <debug|release> x86` in `TypeScriptCompiler`;
- the x86 `TypeScriptAsyncRuntime.lib`, which the DLL build links:
  `scripts\build_tslang_runtime_<debug|release>_x86.bat` in `TypeScriptCompiler`, which
  puts it in `__build\tslang-runtime\<debug|release>\x86\`.

### Android

On a Windows host, with the Android NDK (tested with r30) in `ANDROID_NDK_HOME`:

```
scripts\build_android.bat                        # all three ABIs, release and debug, all models
scripts\build_android.bat arm64-v8a release gc   # just that one
```

This builds for API level 29 (the lowest with `timespec_get`) into the same tree as every
other target: `__build\defaultlib\lib\<aarch64|arm|x86_64>\unknown\linux\android\<debug|release>\<gc|rc|none|own>\`.
It needs a `tslang.exe` that can target Android (`TOOL_PATH`, default: the compiler's
release build tree). Android has no libcurl, so HTTP is `src\wrappers\http_stub.cpp`: `fetch()`
throws. Only the static library is built: tslang links it into every Android binary.

The collector and the async runtime come from the compiler repo:
`scripts\build_gc_release_android.bat` and `scripts\build_tslang_runtime_release_android.bat`.
tslang links through the NDK (`--android-ndk-path`, or `ANDROID_NDK_HOME`). For example, for
arm64-v8a under `gc`, a shared library an app loads, or an executable:

```
tslang --emit=dll -mtriple=aarch64-linux-android29 --opt -mm=gc ^
    --default-lib-path=__build ^
    --gc-lib-path=<TypeScriptCompiler>\3rdParty\gc\android\arm64-v8a\release\lib ^
    --tslang-lib-path=<TypeScriptCompiler>\__build\tslang-runtime\release\android\arm64-v8a ^
    mylib.ts -o libmylib.so
```

`--emit=exe` takes the same options. Either way the output is one self-contained binary: the
static default library, collector and libc++ are linked in, so it needs only Bionic's libc, libm
and libdl. The triple has to carry the API level (`...-android29`).

The Windows release zip carries all of this prebuilt for all three ABIs (`arm64-v8a`, `armeabi-v7a`, `x86_64`): the
default library in every mode and model, in its `defaultlib` tree beside the Windows one, and the
collector and async runtime as release builds:

```
defaultlib\...                                 --default-lib-path=<zip>
android\<abi>\lib\libgc.a                       --gc-lib-path=<zip>\android\<abi>\lib
android\<abi>\lib\libTypeScriptAsyncRuntime.a   --tslang-lib-path=<zip>\android\<abi>\lib
```

so with the zip and an NDK, nothing needs building.

## Testing

```
tests.ps1                          # x64, all four passes: release/debug x compile/jit
$Env:TSLANG_ARCH="x86"; .\tests.ps1 # x86, release/compile and debug/compile only
```

The JIT is host-only (`--emit=jit` refuses an x86 target by design), so under
`TSLANG_ARCH=x86` `tests.ps1` prints "jit is host-only; skipped for x86" and runs only
the two compile passes, against the x86 tree built above. It compiles with
`-mtriple=i686-pc-windows-msvc` and points `--gc-lib-path`/`--tslang-lib-path` at the x64
build trees under `TypeScriptCompiler` (the compiler appends `x86` to each itself), so an
x64 value already set in `$Env:GC_LIB_PATH`/`$Env:TSLANG_LIB_PATH` for the session can't
leak into the x86 build.

A test that reads standard input (`console.readLine`) gets it from `tests/<name>.stdin`, which
`tests.ps1` and `tests.sh` pipe into it. `.gitattributes` keeps those files byte for byte, so a
`\r\n` in one stays part of the test. Under `tests.sh` a test without one reads an empty input.

## Docs

- [fetch / Headers / Response](docs/fetch.md) — built-in HTTP client

## Implemented classes & functions

Globals (`src/lib.ts`):

- `parseInt`, `parseFloat`, `isNaN`, `isFinite`
- `Boolean`
- `Number`
- `BigInt`
- `Date`
- `RegExp`, `MatchResults`, `MatchIndicesResults`
- `String`: `String.fromCharCode` (each code written as UTF-8, a surrogate pair as one
  character), plus the `string` prototype methods it wraps: `at`, `charAt`, `charCodeAt`,
  `codePointAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`,
  `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`,
  `replace`, `replaceAll`, `search`, `slice`, `split`, `startsWith`, `substring`,
  `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toUpperCase`,
  `toWellFormed`, `trim`, `trimStart`, `trimEnd`
- `Math` (static)
- `ArrayBuffer`
- `Headers`, `Response`, `fetch` — see [docs/fetch.md](docs/fetch.md)
- `JSON.parse`, and the `JsonValue` it gives. There are no objects whose fields are found at run
  time, so a value is read through accessors: `kind`, `isNull`, `asBoolean`, `asNumber`, `asString`,
  `length`, `at(i)`, `has(key)`, `get(key)`, `keys()`. Asking for the wrong kind is a `TypeError`; a
  key or index that is not there gives a JSON null. Text that is not JSON is a `SyntaxError`, and
  nesting past 512 levels a `RangeError`. A `\u0000` in a string is a `SyntaxError`, because a string
  ends at its first 0. A value is built with `JsonValue.ofBoolean`, `ofNumber`, `ofString`, `newArray`
  and `newObject`, then `push` and `set`.

  ```ts
  const config = JSON.parse(`{"name":"tslang","sizes":[1,2]}`);
  console.log(config.get("name").asString(), config.get("sizes").at(1).asNumber());
  ```
- `console` (static): `log`, `warn`, `error`, `assert`, and `readLine`, which returns the next
  line of standard input without its line break, or `null` at the end of input:

  ```typescript
  let line: string | null = null;
  while ((line = console.readLine()) != null) {
      console.log(`> ${line}`);
  }
  ```

Generics (`src/generics/lib.generics.ts`):

- `Array<T>`, `TypedArray<T>` (and the typed-array aliases: `Int8Array`, `Uint8Array`,
  `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `BigInt64Array`,
  `BigUint64Array`, `Float32Array`, `Float64Array`). A typed array is made from an array of
  its elements (`new Uint8Array([1, 2, 3])`) or a length (`new Uint8Array(4096)`, each element 0)
- `Map<K, V>`
- `Set<V>`
- `Atomics`: `add`, `sub`, `and`, `or`, `xor`, `exchange`, `compareExchange`, `load`,
  `store`, `isLockFree` over the integer typed arrays, and `wait`/`notify` over an
  `Int32Array` or a `BigInt64Array` (no `waitAsync`)
- `Thread`: `Thread.spawn(fn)` runs `fn` on a new native thread and returns a `ThreadHandle<R>`
  whose `join()` waits for it and gives back `fn`'s result, or throws an `Error` with the message
  of what `fn` threw. `Thread.hardwareConcurrency()` says how many threads the machine runs at
  once. Threads share memory through what their functions capture, such as an `Int32Array` used
  with `Atomics`. Join every thread. Under `-mm=rc` what the function captures is marked shared
  (`Shared.share`), so its counts change atomically. Under `-mm=gc` the thread registers with the
  collector. Under `-mm=own` captured values move into the thread, so threads that share an array
  hold it in a `const` `Shared<T>` each function captures, which works under every model. A thread
  can return an object; `join()` lends it, and the `ThreadHandle` keeps it.

  ```ts
  const counter = new Shared(new Int32Array([0]));
  const workers: ThreadHandle<int>[] = [];
  for (let t = 0; t < 4; t++) {
      workers.push(Thread.spawn((): int => {
          for (let i = 0; i < 1000; i++) Atomics.add(counter.value, 0, 1);
          return 1000;
      }));
  }
  for (const w of workers) w.join();
  console.log(Atomics.load(counter.value, 0)); // 4000
  ```
- `Worker<In, Out>`, as MDN's `Worker`: a function on its own thread that talks to the thread that
  made it only through messages. `new Worker(body, name?)` runs `body(self)` on a new thread, where
  `self` is a `WorkerScope<In, Out>` (MDN's `DedicatedWorkerGlobalScope`: `postMessage`, `onmessage`,
  `close()`, `name`); `body` sets `self.onmessage` and returns, and the worker then hands each
  message to it until it calls `self.close()`. The worker is a function, not a script URL, and `self`
  is its parameter, not a global. On the creating side, `postMessage`, `onmessage` and `onerror`
  are as in a browser, with `MessageEvent<T>` (`data`) and `ErrorEvent` (`message`).
  There is no event loop to deliver what the worker posts, so the creating thread asks for it:
  `receive(timeout?)` takes the next message; `dispatch(timeout?)` hands what has arrived to
  `onmessage` / `onerror` and says how many, from the program's own loop; `join()` does so until the
  worker has closed, then ends its thread. `terminate()` ends a worker that never closes: what is
  queued for it is dropped, it stops once the handler running now returns (it is not interrupted),
  and nothing more is delivered from it. Join or terminate every worker. `closed` says whether it
  has ended.
  What the worker throws reaches `onerror` (none set: it is written to stderr); a throw from a
  handler leaves the worker running, a throw from `body` ends it. A message is handed over, not
  copied: under `-mm=own` it moves, and elsewhere the sender should not change it afterwards (post
  `JSON.stringify(x)` for a copy).
  Under `-mm=own` a handler kept in an object can't change a local of the function that set it, so
  a creating-side `onmessage` keeps its state in a `Shared<T>` it captures, or the program uses
  `receive()`. And once `body` captures anything from the creating thread, the worker's handlers can
  use that (through a second handle, `const counter = shared;` inside `body`) or post with `self`,
  not both.

  ```ts
  const worker = new Worker<int, string>((self: WorkerScope<int, string>) => {
      self.onmessage = (e: MessageEvent<int>) => {
          self.postMessage(`squared: ${e.data * e.data}`);
      };
  });
  worker.onerror = (e: ErrorEvent) => console.error(e.message);
  for (let i = 1; i <= 3; i++) worker.postMessage(i);
  for (let i = 1; i <= 3; i++) {
      const reply = worker.receive();
      if (reply != undefined) console.log(reply.data); // squared: 1, squared: 4, squared: 9
  }
  worker.terminate();
  ```
- `JSON.stringify(value, null, space)` takes numbers, strings, booleans, `null`, arrays of those,
  `JsonValue`s, and classes with a `toJSON()`, which can return a `JsonValue` to write out the class's
  fields. An object literal or a tuple is a `TypeError`, a `BigInt` too. `space` is a number or a
  string; a replacer is not supported, only `null`.
  Under `-mm=own` it takes a number or a string only (use `value.stringify()` for a `JsonValue`), and a
  `JsonValue` is built one step at a time, not with chained `set`s.
- `WeakMap<K, V>`: `get`, `set`, `has`, `delete`. `WeakSet<K>`: `add`, `has`, `delete`. Keys are
  objects, compared by identity. `-mm=gc` only, as `WeakRef` is. A value is held strongly, so a value
  that refers to its own key keeps that key alive.
- `Promise`: `resolve`, `reject`, `all`, `allSettled`, `race`, `any`. The compiler takes
  `Promise<T>` as `T` (an async function returns its value and `await` gives it back), so
  these work on values that have already settled and a rejection is a thrown exception.
  There is no `then`/`catch`/`finally`.
- `Stdio`: bytes to and from the standard streams, as they are. `Stdio.read(buffer)` fills a
  `Uint8Array` from stdin and says how many bytes it read (fewer than `buffer.length` only at
  the end of input, 0 when nothing was left); `Stdio.readAll()` gives the rest of stdin;
  `Stdio.write(bytes)` / `Stdio.writeError(bytes)` write to stdout / stderr and flush. On
  Windows each call switches its stream to binary mode and back, so `"\n"` stays one byte and a
  0x1A byte doesn't end the input, while `console.log`/`console.readLine` keep text mode. Reads
  share stdin's buffer with `console.readLine`, so the two can be mixed.
- `TextEncoder`, `TextDecoder` (UTF-8 only). `encode` copies a string's bytes (strings are UTF-8
  already); `encodeInto` writes whole characters that fit and reports `read` in UTF-16 units.
  `decode` turns each ill-formed sequence into U+FFFD, or throws a `TypeError` with
  `{ fatal: true }`, and drops a leading BOM unless `{ ignoreBOM: true }`. Another encoding label
  is a `RangeError`, and there is no `stream` option. A string ends at its first 0, so a 0 byte
  ends the decoded string there.

  ```ts
  const text = new TextDecoder().decode(Stdio.readAll());
  Stdio.write(new TextEncoder().encode(text.toUpperCase()));
  ```

Errors (`src/core/core.d.ts`):

- `Error`
- `RangeError`
- `SyntaxError`

Not yet implemented, both needing changes in the compiler rather than here: a `Promise` object
(`then`/`catch`/`finally`), since the compiler takes `Promise<T>` as `T`; and `Symbol` beyond the
well-known symbols used internally, since `Symbol` is built into the compiler and a library
declaration of it hides `[Symbol.iterator]`.
