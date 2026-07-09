#include <chrono>
#include <cstdint>
#include <thread>

extern "C" void _sleep(uint32_t milliseconds)
{
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}