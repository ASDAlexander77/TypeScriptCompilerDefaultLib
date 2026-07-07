# TypeScriptCompilerDefaultLib
Implementation of Default Core Library for TypeScript Compiler

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
