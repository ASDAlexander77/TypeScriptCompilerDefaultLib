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

This stages into `__build\defaultlib\{lib,dll}\x86\<debug|release>\<gc|rc|none>\`,
alongside the existing x64 tree. It requires two things already built in the compiler
repo:

- the x86 Boehm GC: `prepare_3rdParty.bat <debug|release> x86` in `TypeScriptCompiler`;
- the x86 `TypeScriptAsyncRuntime.lib`, which the DLL build links:
  `scripts\build_tslang_runtime_<debug|release>_x86.bat` in `TypeScriptCompiler`, which
  puts it in `__build\tslang-runtime\<debug|release>\x86\`.

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
