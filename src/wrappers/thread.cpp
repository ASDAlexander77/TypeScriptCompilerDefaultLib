#include <chrono>
#include <cstdint>
#include <thread>

// Native wrappers must be exported from the shared default-lib DLL so JIT-mode
// programs (which bind imports via the DLL export table) can resolve them.
// In AOT mode the static .lib provides them, so the macro is a no-op there.
#ifdef _WIN32
#define TSLANG_EXPORT __declspec(dllexport)
#else
#define TSLANG_EXPORT
#endif

extern "C" TSLANG_EXPORT void std_this_thread_sleep_for(uint32_t milliseconds)
{
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}