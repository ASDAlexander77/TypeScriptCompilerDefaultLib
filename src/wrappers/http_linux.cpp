#include <curl/curl.h>
#include <string>
#include <cstring>

// Opaque handle wrapping a completed HTTP exchange; mirrors http.cpp (Windows/WinHTTP)
// so lib.ts can call the same http_* functions on either platform.
struct HttpResponse
{
    bool success = false;
    int errorCode = 0;
    int statusCode = 0;
    std::string headers;
    std::string body;
};

static size_t writeBody(char *ptr, size_t size, size_t nmemb, void *userdata)
{
    auto *response = static_cast<HttpResponse *>(userdata);
    response->body.append(ptr, size * nmemb);
    return size * nmemb;
}

static size_t writeHeaders(char *ptr, size_t size, size_t nmemb, void *userdata)
{
    auto *response = static_cast<HttpResponse *>(userdata);
    response->headers.append(ptr, size * nmemb);
    return size * nmemb;
}

extern "C" HttpResponse *http_request(const char *method, const char *url, const char *headers, const char *body, size_t bodyLength)
{
    auto *response = new HttpResponse();

    CURL *curl = curl_easy_init();
    if (curl == nullptr)
    {
        response->errorCode = -1;
        return response;
    }

    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeBody);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, response);
    curl_easy_setopt(curl, CURLOPT_HEADERFUNCTION, writeHeaders);
    curl_easy_setopt(curl, CURLOPT_HEADERDATA, response);

    if (bodyLength > 0)
    {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)bodyLength);
    }

    struct curl_slist *headerList = nullptr;
    if (headers != nullptr && headers[0] != '\0')
    {
        std::string headerStr(headers);
        size_t pos = 0;
        while (pos < headerStr.size())
        {
            size_t next = headerStr.find("\r\n", pos);
            if (next == std::string::npos)
                next = headerStr.size();
            if (next > pos)
                headerList = curl_slist_append(headerList, headerStr.substr(pos, next - pos).c_str());
            pos = next + 2;
        }

        if (headerList != nullptr)
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerList);
    }

    CURLcode res = curl_easy_perform(curl);
    if (res == CURLE_OK)
    {
        long statusCode = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &statusCode);
        response->statusCode = (int)statusCode;
        response->success = true;
    }
    else
    {
        response->errorCode = (int)res;
    }

    if (headerList != nullptr)
        curl_slist_free_all(headerList);
    curl_easy_cleanup(curl);

    return response;
}

extern "C" bool http_response_success(HttpResponse *r)
{
    return r->success;
}

extern "C" int http_response_error_code(HttpResponse *r)
{
    return r->errorCode;
}

extern "C" int http_response_status(HttpResponse *r)
{
    return r->statusCode;
}

extern "C" size_t http_response_headers_length(HttpResponse *r)
{
    return r->headers.size();
}

extern "C" void http_response_headers_copy_to(HttpResponse *r, char *buffer, size_t count)
{
    r->headers.copy(buffer, count);
}

extern "C" size_t http_response_body_length(HttpResponse *r)
{
    return r->body.size();
}

extern "C" void http_response_body_copy_to(HttpResponse *r, char *buffer, size_t count)
{
    r->body.copy(buffer, count);
}

extern "C" void http_response_free(HttpResponse *r)
{
    delete r;
}
