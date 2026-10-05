#include <cstddef>

#include "tslang_export.h"

// The http_* functions lib.ts calls (see http_linux.cpp), for a target with no HTTP client
// (Android, where libcurl is not part of the platform). Every request fails, as one does in
// http_linux.cpp when curl cannot start, so fetch() throws instead of the library failing to
// link.
struct HttpResponse
{
    int errorCode = -1;
};

extern "C" TSLANG_EXPORT HttpResponse *http_request(const char *, const char *, const char *, const char *, size_t)
{
    return new HttpResponse();
}

extern "C" TSLANG_EXPORT bool http_response_success(HttpResponse *)
{
    return false;
}

extern "C" TSLANG_EXPORT int http_response_error_code(HttpResponse *r)
{
    return r->errorCode;
}

extern "C" TSLANG_EXPORT int http_response_status(HttpResponse *)
{
    return 0;
}

extern "C" TSLANG_EXPORT size_t http_response_headers_length(HttpResponse *)
{
    return 0;
}

extern "C" TSLANG_EXPORT void http_response_headers_copy_to(HttpResponse *, char *, size_t)
{
}

extern "C" TSLANG_EXPORT size_t http_response_body_length(HttpResponse *)
{
    return 0;
}

extern "C" TSLANG_EXPORT void http_response_body_copy_to(HttpResponse *, char *, size_t)
{
}

extern "C" TSLANG_EXPORT void http_response_free(HttpResponse *r)
{
    delete r;
}
