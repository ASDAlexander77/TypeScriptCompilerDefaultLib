#ifndef TSLANG_WRAPPERS_EXPORT_H
#define TSLANG_WRAPPERS_EXPORT_H

// Native wrappers must be exported from the shared default-lib DLL so JIT-mode
// programs (which bind imports via the DLL export table) can resolve them.
//
// Every extern "C" entry point that lib.ts declares in src/native/lib.native.d.ts
// needs this - without it the symbol is absent from the DLL export table and the
// call only resolves in AOT builds.
//
// Only the DLL's copies export: scripts/build_core.bat compiles the wrappers a second
// time for it, with TSLANG_WRAPPERS_DLL. The static archive's copies must not, since a
// program keeps every function it exports - every program carried all the RegExp,
// HTTP and stdio wrappers, called or not, and wrote an import library beside itself.
#if defined(_WIN32) && defined(TSLANG_WRAPPERS_DLL)
#define TSLANG_EXPORT __declspec(dllexport)
#else
#define TSLANG_EXPORT
#endif

#endif
