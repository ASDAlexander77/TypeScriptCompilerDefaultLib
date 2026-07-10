#include <chrono>
#include <cstdint>
#include <thread>

extern "C" void std_this_thread_sleep_for(uint32_t milliseconds)
{
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}