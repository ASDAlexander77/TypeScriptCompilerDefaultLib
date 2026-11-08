#include <atomic>
#include <chrono>
#include <cmath>
#include <condition_variable>
#include <cstdint>
#include <list>
#include <mutex>
#include <thread>

#include "tslang_export.h"

extern "C" TSLANG_EXPORT void std_this_thread_sleep_for(uint32_t milliseconds)
{
    std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
}

// Threads: Thread.spawn / join in src/generics/lib.generics.ts.
//
// The entry point is a TypeScript function `(arg: Opaque) => u32`, handed over as an Opaque: a
// function-typed parameter of a `declare function` reaches C as a three-pointer struct, not as a
// code pointer.
//
// Under -mm=gc the collector has to know the thread before it allocates: it stops and scans only
// the threads registered with it, and aborts a collection started from one it does not know. The
// program's entry point already allowed registration (GC_enable_threads, injected beside GC_init),
// so the thread registers itself first and unregisters before it ends. Only the gc build of the
// library defines TSLANG_MM_GC: the other models do not link the collector.

#ifdef TSLANG_MM_GC
extern "C"
{
    struct GC_stack_base
    {
        void *mem_base;
#if defined(__ia64) || defined(__ia64__) || defined(_M_IA64)
        void *reg_base;
#endif
    };

    int GC_get_stack_base(struct GC_stack_base *);
    int GC_register_my_thread(const struct GC_stack_base *);
    int GC_unregister_my_thread(void);
}

namespace
{
// GC_SUCCESS: registered here, so unregistered at the end; GC_DUPLICATE (already known) and any
// failure leave the registration alone
struct CollectorRegistration
{
    bool registered = false;

    CollectorRegistration()
    {
        struct GC_stack_base stackBase;
        registered = GC_get_stack_base(&stackBase) == 0 && GC_register_my_thread(&stackBase) == 0;
    }

    ~CollectorRegistration()
    {
        if (registered)
        {
            GC_unregister_my_thread();
        }
    }
};
} // namespace
#endif

typedef uint32_t (*ThreadEntry)(void *);

extern "C" TSLANG_EXPORT void *tslang_thread_spawn(void *entry, void *arg)
{
    auto start = reinterpret_cast<ThreadEntry>(entry);
    return new std::thread([start, arg]() {
#ifdef TSLANG_MM_GC
        CollectorRegistration registration;
#endif
        start(arg);
    });
}

extern "C" TSLANG_EXPORT void tslang_thread_join(void *handle)
{
    auto thread = static_cast<std::thread *>(handle);
    thread->join();
    delete thread;
}

extern "C" TSLANG_EXPORT uint32_t tslang_thread_hardware_concurrency()
{
    return std::thread::hardware_concurrency();
}

// Atomics.wait / Atomics.notify. Waiters queue on one lock, in the order they came: notify wakes the
// first `count` of those waiting on the address and says how many it woke, as JavaScript's does. A
// waiter reads the value under the lock, and notify takes the same lock, so a store followed by a
// notify can't fall between a waiter's check and its sleep.
namespace
{
struct Waiter
{
    const void *address;
    bool notified;
    std::condition_variable woken;
};

std::mutex &waitersLock()
{
    static std::mutex lock;
    return lock;
}

std::list<Waiter *> &waiters()
{
    static std::list<Waiter *> list;
    return list;
}

// 0 "ok", 1 "not-equal", 2 "timed-out"
template <typename T> int waitOn(T *address, T expected, double timeoutMs)
{
    std::unique_lock<std::mutex> lock(waitersLock());
    // the element is plain memory that the program changes with LLVM atomics; std::atomic<T> of a
    // lock-free T has T's layout (C++17 has no atomic_ref, and cl no __atomic_load_n)
    static_assert(sizeof(std::atomic<T>) == sizeof(T) && std::atomic<T>::is_always_lock_free);
    if (reinterpret_cast<std::atomic<T> *>(address)->load() != expected)
    {
        return 1;
    }

    Waiter waiter{address, false, {}};
    auto &list = waiters();
    auto position = list.insert(list.end(), &waiter);

    auto notified = [&waiter]() { return waiter.notified; };
    if (std::isnan(timeoutMs) || timeoutMs == INFINITY)
    {
        waiter.woken.wait(lock, notified);
    }
    else
    {
        auto timeout = std::chrono::duration<double, std::milli>(timeoutMs < 0 ? 0 : timeoutMs);
        if (!waiter.woken.wait_for(lock, timeout, notified))
        {
            list.erase(position);
            return 2;
        }
    }

    return 0;
}
} // namespace

extern "C" TSLANG_EXPORT int tslang_atomics_wait32(int32_t *address, int32_t expected, double timeoutMs)
{
    return waitOn(address, expected, timeoutMs);
}

extern "C" TSLANG_EXPORT int tslang_atomics_wait64(int64_t *address, int64_t expected, double timeoutMs)
{
    return waitOn(address, expected, timeoutMs);
}

// wakes at most `count` waiters on the address (all of them when count < 0)
extern "C" TSLANG_EXPORT int tslang_atomics_notify(void *address, int count)
{
    std::lock_guard<std::mutex> lock(waitersLock());
    auto &list = waiters();
    int woken = 0;
    for (auto it = list.begin(); it != list.end() && (count < 0 || woken < count);)
    {
        if ((*it)->address != address)
        {
            ++it;
            continue;
        }

        (*it)->notified = true;
        (*it)->woken.notify_one();
        it = list.erase(it);
        woken++;
    }

    return woken;
}
