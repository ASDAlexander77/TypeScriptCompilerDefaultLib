#include <chrono>
#include <thread>

extern "C" void _sleep(unsigned long milliseconds)
{
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}