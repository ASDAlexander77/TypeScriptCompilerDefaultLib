# fetch / Headers / Response

A minimal, synchronous HTTP client built into the default library, modeled after the
web-standard `fetch()` API.

## API

```ts
function fetch(url: string, init?: {
    method?: string,
    headers?: [string, string][],
    body?: string
}): Response;

class Headers {
    constructor(init?: [string, string][]);
    static parse(rawHeaders: string): Headers;

    append(name: string, value: string): void;
    set(name: string, value: string): void;
    get(name: string): string;
    has(name: string): boolean;
    delete(name: string): void;
    toRawString(): string;
}

class Response {
    status: int;
    headers: Headers;

    get ok(): boolean;      // true for 2xx status codes
    text(): string;
    json(): any;             // TODO: parses nothing yet, returns the raw body
}
```

## Example

```ts
const response = fetch("http://example.com/");
if (response.ok) {
    console.log(response.text());
}

const posted = fetch("http://example.com/api", {
    method: "POST",
    headers: [["Content-Type", "application/json"]],
    body: '{"hello":"world"}'
});
```

## Design notes

- **Synchronous, not `async`.** `fetch` is a plain function, not `async function
  fetch(): Response`. The compiler's async lowering currently fails
  (`failed to legalize operation 'async.runtime.load'`) when an `async function`
  returns a class-typed value, so `await fetch(...)` isn't usable yet. Revisit once
  that compiler limitation is fixed.
- **`Headers` stores entries as two parallel arrays** (`names`/`values`), not a `Map`.
  A `Map<string, string>` field triggered an unrelated linker issue (duplicate
  `Headers..size` COMDAT symbols) when a program using `Headers` was compiled and
  linked against the static default lib. Parallel arrays sidestep it; header lists
  are always small, so the O(n) lookup cost is negligible.
- **`json()` doesn't parse JSON yet** — there's no `JSON.parse` in the default lib.
  It currently just returns the raw body text.

## Platform implementation

Native networking lives in `src/wrappers/`:

- **Windows** (`http.cpp`): uses WinHTTP. Strings are converted UTF-8 ↔ UTF-16 at the
  WinHTTP boundary only; everywhere else in the runtime, strings are narrow/UTF-8
  (see `lib.win32.ts`'s CRT bindings for the established convention).
- **Linux** (`http_linux.cpp`): uses libcurl (`-lcurl`).

Both expose the same `extern "C"` surface (declared in `src/native/lib.native.d.ts`):
`http_request`, `http_response_success`, `http_response_error_code`,
`http_response_status`, `http_response_headers_length` /
`http_response_headers_copy_to`, `http_response_body_length` /
`http_response_body_copy_to`, `http_response_free`. `fetch()` in `src/lib.ts` wraps
these into the `Headers`/`Response` classes.

## Known compiler bug this feature exposed (now fixed)

Building the default lib in release mode initially crashed `Headers.parse()` with a
segfault on realistic multi-header input, while the identical code worked in debug
builds. Root cause: MLIR's generic CSE pass ran on the `ts` dialect before allocation
calls were lowered, and `ts.Cast` (the op that materializes a fresh heap allocation
when casting an empty-array literal to a heap-backed array type) was incorrectly
marked `Pure`. Two structurally-identical casts — one per class field initialized to
`[]` in a constructor — got merged into one, aliasing the two fields' backing arrays.
Fixed upstream in `TypeScriptCompiler` (commit `795fbe0e`, "Fix root cause of
GC_malloc CSE bug: CastOp was incorrectly marked Pure"), with a regression test at
`tslang/test/tester/tests/gc_malloc_cse_o3.ts`.
