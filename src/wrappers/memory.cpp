#include <cstddef>
#include <cstring>

#include "tslang_export.h"

// A copy of `count` bytes into `dest`, which has `destSize` bytes left, that ends the process
// rather than write past them. Windows has the CRT's memcpy_s: its invalid parameter handler ends
// the process. glibc and Bionic have no memcpy_s, but have the fortified copy _FORTIFY_SOURCE
// uses, which aborts with "buffer overflow detected"; the builtin calls it, or a plain memcpy
// where the compiler can prove the copy fits.
//
// In C++, not in lib.win32.ts / lib.linux.ts: the compiler emits memcpy_s / __memcpy_chk for
// copies of its own, and a TypeScript declaration of the same function in a module that makes such
// a copy before the declaration is lowered is a second definition of the symbol.
extern "C" TSLANG_EXPORT void boundedCopy(void *dest, size_t destSize, const void *src, size_t count)
{
#ifdef _WIN32
    memcpy_s(dest, destSize, src, count);
#else
    __builtin___memcpy_chk(dest, src, count, destSize);
#endif
}
