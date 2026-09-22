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
