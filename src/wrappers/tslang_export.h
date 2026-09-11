#ifndef TSLANG_WRAPPERS_EXPORT_H
#define TSLANG_WRAPPERS_EXPORT_H

// Native wrappers must be exported from the shared default-lib DLL so JIT-mode
// programs (which bind imports via the DLL export table) can resolve them.
// In AOT mode the static .lib provides them, so the macro is a no-op there.
//
// Every extern "C" entry point that lib.ts declares in src/native/lib.native.d.ts
// needs this - without it the symbol is absent from the DLL export table and the
// call only resolves in AOT builds.
#ifdef _WIN32
#define TSLANG_EXPORT __declspec(dllexport)
#else
#define TSLANG_EXPORT
#endif

#endif
