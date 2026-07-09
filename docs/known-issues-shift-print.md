# Known issue: `console.log` prints negative `>>` results as unsigned

## Status: open, not yet fixed

## Summary

`console.log` (and likely other formatting/printing paths) prints the raw unsigned
32-bit bit pattern for `i32` values that are the *correctly computed* result of a
signed right-shift (`>>`) on a negative operand, instead of the signed decimal value.

```ts
let vneg = -16
let r = vneg >> 3
console.log(typeof r)   // "i32"
console.log(r)           // 4294967294  <-- wrong, should print -2
console.log(r === -2)    // true        <-- the underlying value IS correct
console.log(r < 0)       // true        <-- also correct
```

The bug is in **formatting/printing only**. The actual computed value is correct
(`r === -2` and `r < 0` both evaluate `true`), so arithmetic and comparisons are
unaffected — only the printed/displayed representation is wrong. This means it did
not affect the `math.ts` test suite (which uses `===`-based assertions, not string
comparison of printed output), so it slipped through unnoticed until manual
investigation of a related shift bug.

## How it was found

While fixing the shift-count-masking bug (`10 << 100` producing garbage under `-O3`,
see [tests/shift_ops.ts](../tests/shift_ops.ts) and the `LowerToLLVM.cpp`/`MLIRGen.cpp`
fix in the `TypeScriptCompiler` repo), manual verification of related shift edge cases
turned up this separate display-only bug:

```
v10<<31 = 0             expect -2147483648   (both values are 0 mod 2^32, wrapping — not a bug)
v10<<30 = 2147483648    expect -2147483648   <-- printed unsigned
-16>>3  = 4294967294    expect -2            <-- printed unsigned
-16>>35 = 4294967294    expect -2            <-- printed unsigned (after masking fix, still wrong)
```

Reproduced consistently in both JIT and `--emit=exe` modes, release and debug builds.

## Suspected cause (not yet investigated in code)

Values produced by `>>` (signed right shift, `arith::ShRSIOp`/`arith::ShRUIOp` — see
`ArithmeticBinaryOpLowering` in `tslang/lib/TypeScript/LowerToLLVM.cpp`) may end up
tagged/typed as an **unsigned** `i32` somewhere between codegen and the `console.log`
formatting path, even though the value's bit pattern is the correct two's-complement
signed result. Candidates to check first:

- Whether `ShRUIOp`/`ShRSIOp` selection in `BinOp<...>` (see
  `UnaryBinLogicalOrHelper.h:47-81`) affects the *result* type's signedness, not just
  which shift instruction is chosen — i.e. does picking `ShRUIOp` for the unsigned
  branch of the template also cause the result to be reinterpreted/retyped as
  unsigned for subsequent consumers like `console.log`.
- The `console.log`/number-to-string runtime formatting code (likely in the
  `TypeScriptRuntime`/default lib, not the compiler) — check whether it decides
  signed vs. unsigned formatting based on something other than the MLIR/LLVM type's
  actual signedness attribute.
- Whether this only affects `>>` specifically (not `<<`, not `>>>`, which are already
  expected to be unsigned) — needs confirmation with `<<` producing a negative i32
  result via other means (e.g. `1 << 31`).

## Suggested next steps

1. Reproduce minimally and isolate whether the bad value originates before or after
   the `console.log` call (e.g. compare `r.toString()` vs. direct `console.log(r)`,
   or write the value out via a different path like string concatenation/template
   literal, which appeared to format correctly for other negative i32s elsewhere in
   testing — needs re-confirmation).
2. Check the type of `r` as seen by the runtime formatter — is it genuinely `i32`
   (signed) or has it been widened/retyped `u32` somewhere in the `ShRSIOp` lowering
   or in argument marshaling to the `console.log`/print runtime call.
3. Once isolated, fix at the source (correct type/signedness propagation) rather than
   patching the formatter, unless the formatter itself is confirmed to be the sole
   culprit.

## Test coverage

No automated test currently exists for this bug (it's a display bug that
assertion-based tests like `isEq`/`===` can't catch by design). Once the cause is
understood, add a test that either:
- captures/compares actual `console.log` stdout text (requires extending
  `tests.ps1`'s harness, which currently only checks exit codes), or
- exercises the runtime's number-to-string conversion function directly (if exposed)
  and asserts on the resulting string via `isEq`.
