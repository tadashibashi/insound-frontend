/* ==========================================================================
 * @file request.ts
 * @description
 *     All front-end requests to the backend should be made through these
 *     functions.
 *
 * ========================================================================== */
import { StorageName } from "app/consts";
import type { Schema } from "yup";

/**
 * Method name `string` that is passed to an http request.
 * Limited to the needs of this project.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";




/**
 * Make a request to the server and validate the response body with a type check
 * Server-side data type must be a JSON object response.
 * All requests to the backend
 * server should be made through this function or {@link request}
 * @param     schema             The type to assert
 * @param     url               URL endpoint (e.g. "/api/user/create")
 * @param     [method="GET"]    The {@link HttpMethod} name (e.g. `"POST"`).
 *                              Set to `"GET"` by default.
 * @param     [payload]         The payload. Optional.
 * @return    The expected data type from the type check
 */
export async function requestType<T extends Schema>(
    schema: T, url: string, method: HttpMethod = "GET", payload?: unknown) {

    const res = await request(url, method, payload);

    return schema.validate(res, {abortEarly: false});
}



/**
 * Send a fetch request with optional payload. All requests to the backend
 * server should be made through this function or {@link requestType}
 * @param      url            The url endpoint
 * @param      [method="GET"] The http method, default: "GET"
 * @param      [payload]      The body to pass to the request. Send FormData to
 *                            pass a multi-part form data. All other types will
 *                            be interpreted as JSON
 * @return     Response body - user must make assertions as to its type.
 */
export async function request(url: string, method: HttpMethod = "GET",
    payload?: unknown): Promise<ArrayBuffer | unknown> {

    // Create and send the request
    let headers: HeadersInit = {};

    // Setup the body with payload if any provided
    let body: BodyInit | undefined = undefined;
    if (payload) {
        if (payload instanceof FormData) {
            body = payload;
        } else {
            headers["content-type"] = "application/json";
            body = JSON.stringify(payload);
        }
    }

    // Set the authorization header if there's a user token in local storage
    if (localStorage.getItem(StorageName.User))
        headers["authorization"] = "Bearer " + localStorage.getItem(StorageName.User);

    const res = await fetch(url, {
        body,
        headers,
        method
    });

    // Process response
    if (!res.ok) {
        switch (res.status) {
            case 401:
                localStorage.removeItem(StorageName.User);
                break;
            default:
                throw Error("Problem with request, status " + res.status + ": " + res.statusText);
                break;
        }
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        // JSON body type
        return res.json();
    } else if (contentType.includes("text/")) {
        // Some text type
        return res.text();
    } else {
        // Potentially an unknown file body type
        return res.arrayBuffer();
    }
}

