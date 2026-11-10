// process and fs (src/generics/lib.generics.ts): the command line, the environment, the working
// directory and the file system, synchronously.
//
// The same shape as stdio_read_line and http_response_*: a call leaves its text - a file's bytes,
// an argument, a directory entry, or the message of the error it ran into - in a per-thread buffer
// and gives its length (-1 for an error); tslang_os_result_copy_to then copies it into a buffer the
// program owns. Lengths are an int, as Stdio's are: a file of 2 GB or more is an EFBIG error.
//
// Paths and every other string cross as UTF-8. On Windows they are turned into UTF-16 and the wide
// API is used throughout, so a name outside the ANSI code page works.

#include <algorithm>
#include <cerrno>
#include <climits>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cwchar>
#include <filesystem>
#include <mutex>
#include <string>
#include <system_error>
#include <vector>

#include <sys/stat.h>
#include <sys/types.h>

#ifdef _WIN32
#include <windows.h>
#include <shellapi.h>
#pragma comment(lib, "shell32.lib")
#else
#include <unistd.h>
extern char **environ;
#endif

#include "tslang_export.h"

namespace fs = std::filesystem;

static thread_local std::string result;
// readdirSync's names and env()'s entries, taken in one go and handed out one by one
static thread_local std::vector<std::string> entries;

static int set_result(const std::string &text)
{
    result = text;
    return static_cast<int>(result.size());
}

// ---- UTF-8 <-> the platform's own strings ----

#ifdef _WIN32
static std::wstring widen(const char *s)
{
    if (s == nullptr || *s == 0)
    {
        return std::wstring();
    }

    auto size = MultiByteToWideChar(CP_UTF8, 0, s, -1, nullptr, 0);
    if (size <= 0)
    {
        return std::wstring();
    }

    std::wstring wide(static_cast<std::size_t>(size), L'\0');
    MultiByteToWideChar(CP_UTF8, 0, s, -1, &wide[0], size);
    wide.resize(static_cast<std::size_t>(size - 1));
    return wide;
}

static std::string narrow(const wchar_t *s, int length = -1)
{
    if (s == nullptr || length == 0 || (length < 0 && *s == 0))
    {
        return std::string();
    }

    auto size = WideCharToMultiByte(CP_UTF8, 0, s, length, nullptr, 0, nullptr, nullptr);
    if (size <= 0)
    {
        return std::string();
    }

    std::string text(static_cast<std::size_t>(size), '\0');
    WideCharToMultiByte(CP_UTF8, 0, s, length, &text[0], size, nullptr, nullptr);
    if (length < 0)
    {
        // the terminating 0 is counted when the length is not given
        text.resize(static_cast<std::size_t>(size - 1));
    }

    return text;
}

static fs::path to_path(const char *s)
{
    return fs::path(widen(s));
}

static std::string from_path(const fs::path &p)
{
    auto wide = p.wstring();
    return narrow(wide.c_str(), static_cast<int>(wide.size()));
}
#else
static fs::path to_path(const char *s)
{
    return fs::path(s == nullptr ? "" : s);
}

static std::string from_path(const fs::path &p)
{
    return p.string();
}
#endif

// ---- errors, the way Node words them: "ENOENT: no such file or directory, open 'x.txt'" ----

static const char *error_name(const std::error_condition &condition)
{
    if (condition.category() != std::generic_category())
    {
        return "EIO";
    }

    switch (static_cast<std::errc>(condition.value()))
    {
    case std::errc::no_such_file_or_directory:
        return "ENOENT";
    case std::errc::file_exists:
        return "EEXIST";
    case std::errc::permission_denied:
        return "EACCES";
    case std::errc::operation_not_permitted:
        return "EPERM";
    case std::errc::not_a_directory:
        return "ENOTDIR";
    case std::errc::is_a_directory:
        return "EISDIR";
    case std::errc::directory_not_empty:
        return "ENOTEMPTY";
    case std::errc::device_or_resource_busy:
        return "EBUSY";
    case std::errc::invalid_argument:
        return "EINVAL";
    case std::errc::filename_too_long:
        return "ENAMETOOLONG";
    case std::errc::cross_device_link:
        return "EXDEV";
    case std::errc::file_too_large:
        return "EFBIG";
    case std::errc::no_space_on_device:
        return "ENOSPC";
    case std::errc::read_only_file_system:
        return "EROFS";
    case std::errc::too_many_files_open:
        return "EMFILE";
    default:
        return "EIO";
    }
}

static int fail(const std::error_code &ec, const char *op, const char *path, const char *dest = nullptr)
{
    auto condition = ec.default_error_condition();
    std::string message = error_name(condition);
    message += ": ";
    message += condition.message();
    message += ", ";
    message += op;
    if (path != nullptr)
    {
        message += " '";
        message += path;
        message += "'";
    }

    if (dest != nullptr)
    {
        message += " -> '";
        message += dest;
        message += "'";
    }

    set_result(message);
    return -1;
}

static int fail_errno(int error, const char *op, const char *path)
{
    return fail(std::error_code(error, std::generic_category()), op, path);
}

static int fail_errc(std::errc error, const char *op, const char *path)
{
    return fail(std::make_error_code(error), op, path);
}

// ---- the result buffer ----

extern "C" TSLANG_EXPORT int tslang_os_result_length()
{
    return static_cast<int>(result.size());
}

extern "C" TSLANG_EXPORT void tslang_os_result_copy_to(char *buffer, int count)
{
    if (buffer == nullptr || count <= 0)
    {
        return;
    }

    auto size = result.size() < static_cast<std::size_t>(count) ? result.size() : static_cast<std::size_t>(count);
    result.copy(buffer, size);
}

// ---- process ----

// The command line as the operating system gave it to the process: under the JIT that is tslang's
// own, with the script after its options. Taken once: it does not change.
static std::vector<std::string> arguments;
static std::once_flag argumentsTaken;

static void take_arguments()
{
#ifdef _WIN32
    int count = 0;
    auto argv = CommandLineToArgvW(GetCommandLineW(), &count);
    if (argv != nullptr)
    {
        for (int i = 0; i < count; i++)
        {
            arguments.push_back(narrow(argv[i]));
        }

        LocalFree(argv);
    }
#else
    // /proc/self/cmdline: the arguments, each ended by a 0 (Linux and Android)
    auto file = std::fopen("/proc/self/cmdline", "rb");
    if (file == nullptr)
    {
        return;
    }

    std::string all;
    char chunk[4096];
    std::size_t read;
    while ((read = std::fread(chunk, 1, sizeof(chunk), file)) > 0)
    {
        all.append(chunk, read);
    }

    std::fclose(file);

    std::size_t start = 0;
    while (start < all.size())
    {
        auto end = all.find('\0', start);
        if (end == std::string::npos)
        {
            end = all.size();
        }

        arguments.push_back(all.substr(start, end - start));
        start = end + 1;
    }
#endif
}

extern "C" TSLANG_EXPORT int tslang_process_argc()
{
    std::call_once(argumentsTaken, take_arguments);
    return static_cast<int>(arguments.size());
}

// argument `i`'s length, or -1 past the last one
extern "C" TSLANG_EXPORT int tslang_process_argv(int i)
{
    std::call_once(argumentsTaken, take_arguments);
    if (i < 0 || static_cast<std::size_t>(i) >= arguments.size())
    {
        return -1;
    }

    return set_result(arguments[static_cast<std::size_t>(i)]);
}

// The variable's length, or -1 when it is not set. On Windows the process environment is read and
// written through the Win32 API, not the C runtime's copy of it: under the JIT this library has a
// C runtime of its own, whose copy the program's would not see.
extern "C" TSLANG_EXPORT int tslang_process_getenv(const char *name)
{
    if (name == nullptr || *name == 0)
    {
        return -1;
    }

#ifdef _WIN32
    auto wideName = widen(name);
    auto size = GetEnvironmentVariableW(wideName.c_str(), nullptr, 0);
    if (size == 0)
    {
        // not set, or set to "" - which the second call tells apart
        SetLastError(ERROR_SUCCESS);
        wchar_t empty[1];
        GetEnvironmentVariableW(wideName.c_str(), empty, 1);
        if (GetLastError() == ERROR_ENVVAR_NOT_FOUND)
        {
            return -1;
        }

        return set_result(std::string());
    }

    std::wstring value(size, L'\0');
    auto length = GetEnvironmentVariableW(wideName.c_str(), &value[0], size);
    return set_result(narrow(value.c_str(), static_cast<int>(length)));
#else
    auto value = std::getenv(name);
    if (value == nullptr)
    {
        return -1;
    }

    return set_result(value);
#endif
}

static bool valid_name(const char *name)
{
    return name != nullptr && *name != 0 && std::strchr(name, '=') == nullptr;
}

extern "C" TSLANG_EXPORT int tslang_process_setenv(const char *name, const char *value)
{
    if (!valid_name(name))
    {
        return fail_errc(std::errc::invalid_argument, "setenv", name);
    }

#ifdef _WIN32
    auto wideName = widen(name);
    auto wideValue = widen(value);
    if (!SetEnvironmentVariableW(wideName.c_str(), wideValue.c_str()))
    {
        return fail(std::error_code(static_cast<int>(GetLastError()), std::system_category()), "setenv", name);
    }

    // the C runtime's copy as well, for getenv in C code linked with the program
    _wputenv_s(wideName.c_str(), wideValue.c_str());
#else
    if (setenv(name, value == nullptr ? "" : value, 1) != 0)
    {
        return fail_errno(errno, "setenv", name);
    }
#endif

    return 0;
}

extern "C" TSLANG_EXPORT int tslang_process_unsetenv(const char *name)
{
    if (!valid_name(name))
    {
        return fail_errc(std::errc::invalid_argument, "unsetenv", name);
    }

#ifdef _WIN32
    auto wideName = widen(name);
    // a variable that is not set is not an error, as with unsetenv
    if (!SetEnvironmentVariableW(wideName.c_str(), nullptr) && GetLastError() != ERROR_ENVVAR_NOT_FOUND)
    {
        return fail(std::error_code(static_cast<int>(GetLastError()), std::system_category()), "unsetenv", name);
    }

    // "" removes it from the C runtime's copy
    _wputenv_s(wideName.c_str(), L"");
#else
    if (unsetenv(name) != 0)
    {
        return fail_errno(errno, "unsetenv", name);
    }
#endif

    return 0;
}

// How many variables are set: each is then tslang_process_env_entry(i), "NAME=value".
extern "C" TSLANG_EXPORT int tslang_process_env_count()
{
    entries.clear();

#ifdef _WIN32
    auto block = GetEnvironmentStringsW();
    if (block != nullptr)
    {
        for (auto entry = block; *entry != 0; entry += wcslen(entry) + 1)
        {
            // "=C:=C:\\dir": the working directory of each drive, which cmd.exe keeps; not a variable
            if (*entry != L'=')
            {
                entries.push_back(narrow(entry));
            }
        }

        FreeEnvironmentStringsW(block);
    }
#else
    if (environ != nullptr)
    {
        for (auto entry = environ; *entry != nullptr; entry++)
        {
            entries.push_back(*entry);
        }
    }
#endif

    return static_cast<int>(entries.size());
}

// entry `i` of the last tslang_process_env_count or tslang_fs_read_dir, its length; -1 past the last
extern "C" TSLANG_EXPORT int tslang_os_entry(int i)
{
    if (i < 0 || static_cast<std::size_t>(i) >= entries.size())
    {
        return -1;
    }

    return set_result(entries[static_cast<std::size_t>(i)]);
}

extern "C" TSLANG_EXPORT int tslang_process_cwd()
{
    std::error_code ec;
    auto path = fs::current_path(ec);
    if (ec)
    {
        return fail(ec, "uv_cwd", nullptr);
    }

    return set_result(from_path(path));
}

extern "C" TSLANG_EXPORT int tslang_process_chdir(const char *path)
{
    std::error_code ec;
    fs::current_path(to_path(path), ec);
    if (ec)
    {
        return fail(ec, "chdir", path);
    }

    return 0;
}

extern "C" TSLANG_EXPORT int tslang_process_pid()
{
#ifdef _WIN32
    return static_cast<int>(GetCurrentProcessId());
#else
    return static_cast<int>(getpid());
#endif
}

// what Node's process.platform says
extern "C" TSLANG_EXPORT int tslang_process_platform()
{
#if defined(_WIN32)
    return set_result("win32");
#elif defined(__ANDROID__)
    return set_result("android");
#elif defined(__APPLE__)
    return set_result("darwin");
#elif defined(__linux__)
    return set_result("linux");
#else
    return set_result("unknown");
#endif
}

// Every stream flushed first, console.log's and Stdio's among them.
extern "C" TSLANG_EXPORT void tslang_process_exit(int code)
{
    std::fflush(nullptr);
    std::exit(code);
}

// ---- fs ----

static std::FILE *open_file(const char *path, const char *mode)
{
#ifdef _WIN32
    std::FILE *file = nullptr;
    auto error = _wfopen_s(&file, widen(path).c_str(), widen(mode).c_str());
    if (error != 0)
    {
        errno = error;
        return nullptr;
    }

    return file;
#else
    return std::fopen(path, mode);
#endif
}

// the whole file into the result: its length, or -1
extern "C" TSLANG_EXPORT int tslang_fs_read_file(const char *path)
{
    auto file = open_file(path, "rb");
    if (file == nullptr)
    {
        return fail_errno(errno, "open", path);
    }

    std::string bytes;
    char chunk[65536];
    for (;;)
    {
        auto read = std::fread(chunk, 1, sizeof(chunk), file);
        if (read > 0)
        {
            if (bytes.size() + read > static_cast<std::size_t>(INT_MAX))
            {
                std::fclose(file);
                return fail_errc(std::errc::file_too_large, "read", path);
            }

            bytes.append(chunk, read);
        }

        if (read < sizeof(chunk))
        {
            break;
        }
    }

    // a directory opens on Linux, and its read then fails with EISDIR
    auto failed = std::ferror(file) != 0;
    auto error = errno;
    std::fclose(file);
    if (failed)
    {
        return fail_errno(error != 0 ? error : EIO, "read", path);
    }

    result.swap(bytes);
    return static_cast<int>(result.size());
}

// `count` bytes to the file, which it creates, or empties first unless `append`
extern "C" TSLANG_EXPORT int tslang_fs_write_file(const char *path, const char *bytes, int count, int append)
{
    auto file = open_file(path, append ? "ab" : "wb");
    if (file == nullptr)
    {
        return fail_errno(errno, "open", path);
    }

    if (bytes != nullptr && count > 0 && std::fwrite(bytes, 1, static_cast<std::size_t>(count), file) != static_cast<std::size_t>(count))
    {
        auto error = errno;
        std::fclose(file);
        return fail_errno(error != 0 ? error : EIO, "write", path);
    }

    if (std::fclose(file) != 0)
    {
        return fail_errno(errno, "close", path);
    }

    return 0;
}

// 1 a file, 2 a directory, 3 something else (a device, a pipe); -1 an error, ENOENT when there is
// nothing there. Symbolic links are followed. The modification time is in milliseconds since 1970.
extern "C" TSLANG_EXPORT int tslang_fs_stat(const char *path, double *size, double *mtimeMs)
{
    int mode;
#ifdef _WIN32
    struct _stat64 info;
    if (_wstat64(widen(path).c_str(), &info) != 0)
    {
        return fail_errno(errno, "stat", path);
    }

    mode = info.st_mode;
    *size = static_cast<double>(info.st_size);
    *mtimeMs = static_cast<double>(info.st_mtime) * 1000.0;
#else
    struct stat info;
    if (stat(path, &info) != 0)
    {
        return fail_errno(errno, "stat", path);
    }

    mode = info.st_mode;
    *size = static_cast<double>(info.st_size);
    *mtimeMs = static_cast<double>(info.st_mtim.tv_sec) * 1000.0 + static_cast<double>(info.st_mtim.tv_nsec / 1000000);
#endif

#ifdef _WIN32
    const int typeMask = _S_IFMT, regular = _S_IFREG, directory = _S_IFDIR;
#else
    const int typeMask = S_IFMT, regular = S_IFREG, directory = S_IFDIR;
#endif

    if ((mode & typeMask) == regular)
    {
        return 1;
    }

    if ((mode & typeMask) == directory)
    {
        return 2;
    }

    return 3;
}

// The names in the directory, sorted (the operating system gives them in no set order): how many,
// each then tslang_os_entry(i). Not "." or "..".
extern "C" TSLANG_EXPORT int tslang_fs_read_dir(const char *path)
{
    entries.clear();

    std::error_code ec;
    fs::directory_iterator it(to_path(path), ec);
    if (ec)
    {
        return fail(ec, "scandir", path);
    }

    for (; it != fs::directory_iterator(); it.increment(ec))
    {
        entries.push_back(from_path(it->path().filename()));
    }

    if (ec)
    {
        entries.clear();
        return fail(ec, "scandir", path);
    }

    std::sort(entries.begin(), entries.end());
    return static_cast<int>(entries.size());
}

// Not `recursive`: the parent must be there and the directory must not. `recursive`: every missing
// parent too, and a directory already there is no error.
extern "C" TSLANG_EXPORT int tslang_fs_mkdir(const char *path, int recursive)
{
    auto p = to_path(path);
    std::error_code ec;
    if (recursive)
    {
        fs::create_directories(p, ec);
        if (ec)
        {
            return fail(ec, "mkdir", path);
        }

        return 0;
    }

    // create_directory gives false, with no error, for a directory that is already there
    if (!fs::create_directory(p, ec))
    {
        return ec ? fail(ec, "mkdir", path) : fail_errc(std::errc::file_exists, "mkdir", path);
    }

    return 0;
}

// Node's rmSync: a file, or with `recursive` a directory and all it holds; with `force` nothing
// there is not an error.
extern "C" TSLANG_EXPORT int tslang_fs_remove(const char *path, int recursive, int force)
{
    auto p = to_path(path);
    std::error_code ec;
    auto status = fs::symlink_status(p, ec);
    if (ec || !fs::exists(status))
    {
        if (force && (!ec || ec == std::errc::no_such_file_or_directory))
        {
            return 0;
        }

        return ec ? fail(ec, "rm", path) : fail_errc(std::errc::no_such_file_or_directory, "rm", path);
    }

    if (fs::is_directory(status))
    {
        if (!recursive)
        {
            return fail_errc(std::errc::is_a_directory, "rm", path);
        }

        fs::remove_all(p, ec);
    }
    else
    {
        fs::remove(p, ec);
    }

    if (ec)
    {
        return fail(ec, "rm", path);
    }

    return 0;
}

// Node's rmdirSync: an empty directory
extern "C" TSLANG_EXPORT int tslang_fs_rmdir(const char *path)
{
    auto p = to_path(path);
    std::error_code ec;
    auto status = fs::symlink_status(p, ec);
    if (ec)
    {
        return fail(ec, "rmdir", path);
    }

    if (!fs::exists(status))
    {
        return fail_errc(std::errc::no_such_file_or_directory, "rmdir", path);
    }

    if (!fs::is_directory(status))
    {
        return fail_errc(std::errc::not_a_directory, "rmdir", path);
    }

    fs::remove(p, ec);
    if (ec)
    {
        return fail(ec, "rmdir", path);
    }

    return 0;
}

// A file replaces one already at `to`, as rename(2) does on every platform.
extern "C" TSLANG_EXPORT int tslang_fs_rename(const char *from, const char *to)
{
    std::error_code ec;
    fs::rename(to_path(from), to_path(to), ec);
    if (ec)
    {
        return fail(ec, "rename", from, to);
    }

    return 0;
}

// A copy of the file's bytes, over a file already at `to`, as Node's copyFileSync.
extern "C" TSLANG_EXPORT int tslang_fs_copy_file(const char *from, const char *to)
{
    std::error_code ec;
    fs::copy_file(to_path(from), to_path(to), fs::copy_options::overwrite_existing, ec);
    if (ec)
    {
        return fail(ec, "copyfile", from, to);
    }

    return 0;
}
