#include <cstdio>

#include "tslang_export.h"

// console.log/warn/error route through here rather than the raw write()/_write()
// file-descriptor call, so that their output shares one buffer with print(), which
// lowers to puts(). Mixing the two channels reorders output whenever stdout is not
// a terminal - under a pipe, a redirect, or the VSCode debug console, stdio turns
// fully buffered and holds print()'s text until exit while a bare write() goes
// straight to the fd. fileNo matches the POSIX numbering the callers already use.
//
// The flush at the end of each line is not optional. In JIT mode this wrapper runs
// against the default-lib DLL's own CRT (the wrappers are built /MT, so the DLL
// carries a private static CRT) while print()'s puts() binds to the host tslang.exe
// CRT - two independent stdout buffers. The DLL's buffer is never flushed on exit
// there, so without this the output is lost outright rather than merely reordered.
// Flushing on the terminating newline costs one flush per console.log, not per call.
extern "C" TSLANG_EXPORT void stdio_write(int fileNo, const char *s, int count)
{
    if (count <= 0 || s == nullptr)
    {
        return;
    }

    std::FILE *stream = fileNo == 2 ? stderr : stdout;
    (void)std::fwrite(s, 1, static_cast<std::size_t>(count), stream);

    if (s[count - 1] == '\n')
    {
        std::fflush(stream);
    }
}
