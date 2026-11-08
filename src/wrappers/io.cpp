#include <cstdio>
#include <string>

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

// console.readLine(): stdio_read_line reads the next line of stdin into a per-thread buffer and gives its
// length (without the line break, "\n" or "\r\n"), or -1 at the end of input; stdio_line_copy_to
// then copies it into a buffer the program owns, the way fetch() takes a response body.
//
// Reading through this wrapper rather than a getchar() the program declares itself matters under
// the JIT: as with stdio_write above, this runs against the default-lib DLL's own CRT, whose stdin
// buffer is not the host's, so a program mixing the two would lose whatever one of them buffered.
static thread_local std::string currentLine;

extern "C" TSLANG_EXPORT int stdio_read_line()
{
    // before reading, so a prompt written with console.log/stdio_write without a line break shows
    std::fflush(stdout);

    currentLine.clear();

    auto read = false;
    int c;
    while ((c = std::fgetc(stdin)) != EOF)
    {
        read = true;
        if (c == '\n')
        {
            break;
        }

        currentLine.push_back(static_cast<char>(c));
    }

    if (!read)
    {
        return -1;
    }

    if (!currentLine.empty() && currentLine.back() == '\r')
    {
        currentLine.pop_back();
    }

    return static_cast<int>(currentLine.size());
}

extern "C" TSLANG_EXPORT void stdio_line_copy_to(char *buffer, int count)
{
    if (buffer == nullptr || count <= 0)
    {
        return;
    }

    auto size = currentLine.size() < static_cast<std::size_t>(count) ? currentLine.size() : static_cast<std::size_t>(count);
    currentLine.copy(buffer, size);
}
