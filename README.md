# TypeScriptCompilerDefaultLib
Implementation of Default Core Library for TypeScript Compiler

## Building

```
build.bat                  # x64, release and debug, all three memory models
build.bat release gc       # x64, just that one
```

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

This stages into `__build\defaultlib\{lib,dll}\x86\<debug|release>\<gc|rc|none>\`,
alongside the existing x64 tree. It requires two things already built in the compiler
repo:

- the x86 Boehm GC: `prepare_3rdParty.bat <debug|release> x86` in `TypeScriptCompiler`;
- the x86 `TypeScriptAsyncRuntime.lib`, which the DLL build links:
  `scripts\build_tslang_runtime_<debug|release>_x86.bat` in `TypeScriptCompiler`, which
  puts it in `__build\tslang-runtime\<debug|release>\x86\`.

### Android

On a Windows host, with the Android NDK (tested with r30) in `ANDROID_NDK_HOME`:

```
scripts\build_android.bat                        # arm64-v8a and x86_64, release and debug, all models
scripts\build_android.bat arm64-v8a release gc   # just that one
```

This builds for API level 29 (the lowest with `timespec_get`) into
`__build\android\<abi>\defaultlib\lib\<debug|release>\<gc|rc|none>\`, one complete tree
per ABI. It needs a `tslang.exe` that can target Android (`TOOL_PATH`, default: the compiler's
release build tree). Android has no libcurl, so HTTP is `src\wrappers\http_stub.cpp`: `fetch()`
throws. Only the static library is built: tslang links it into every Android binary.

The collector and the async runtime come from the compiler repo:
`scripts\build_gc_release_android.bat` and `scripts\build_tslang_runtime_release_android.bat`.
tslang links through the NDK (`--android-ndk-path`, or `ANDROID_NDK_HOME`). For example, for
arm64-v8a under `gc`, a shared library an app loads, or an executable:

```
tslang --emit=dll -mtriple=aarch64-linux-android29 --opt -mm=gc ^
    --default-lib-path=__build\android\arm64-v8a ^
    --gc-lib-path=<TypeScriptCompiler>\3rdParty\gc\android\arm64-v8a\release\lib ^
    --tslang-lib-path=<TypeScriptCompiler>\__build\tslang-runtime\release\android\arm64-v8a ^
    mylib.ts -o libmylib.so
```

`--emit=exe` takes the same options. Either way the output is one self-contained binary: the
static default library, collector and libc++ are linked in, so it needs only Bionic's libc, libm
and libdl. The triple has to carry the API level (`...-android29`).

The Windows release zip carries all of this prebuilt, per ABI (`arm64-v8a`, `x86_64`): the
default library in every mode and model, the collector and async runtime as release builds:

```
android\<abi>\defaultlib\...                    --default-lib-path=<zip>\android\<abi>
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
- `String` (plus the `string` prototype methods it wraps: `at`, `charAt`, `charCodeAt`,
  `codePointAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`,
  `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`,
  `replace`, `replaceAll`, `search`, `slice`, `split`, `startsWith`, `substring`,
  `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toUpperCase`,
  `toWellFormed`, `trim`, `trimStart`, `trimEnd`)
- `Math` (static)
- `ArrayBuffer`
- `Headers`, `Response`, `fetch` — see [docs/fetch.md](docs/fetch.md)
- `console` (static): `log`, `warn`, `error`, `assert`

Generics (`src/generics/lib.generics.ts`):

- `Array<T>`, `TypedArray<T>` (and the typed-array aliases: `Int8Array`, `Uint8Array`,
  `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `BigInt64Array`,
  `BigUint64Array`, `Float32Array`, `Float64Array`)
- `Map<K, V>`
- `Set<V>`

Errors (`src/core/core.d.ts`):

- `Error`
- `RangeError`

Not yet implemented: `Promise`, `JSON.parse`/`JSON.stringify`, `Symbol` (beyond the
well-known symbols used internally), `WeakMap`/`WeakSet`.
