/* ==========================================================================
 * @file request.ts
 * @description
 *     All front-end requests to the backend should be made through these
 *     functions.
 *
 * ========================================================================== */
import { StorageName } from "app/consts";
import type { TSchema, TypeCheck } from "app/util/validation";
import { ValidationError } from "app/util/validation/errors";

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
 * @param     check             The type to assert
 * @param     url               URL endpoint (e.g. "/api/user/create")
 * @param     [method="GET"]    The {@link HttpMethod} name (e.g. `"POST"`).
 *                              Set to `"GET"` by default.
 * @param     [payload]         The payload. Optional.
 * @return    The expected data type from the type check
 */
export async function requestType<T extends TSchema>(
    check: TypeCheck<T>, url: string, method: HttpMethod = "GET", payload?: unknown) {

    const res = await request(url, method, payload);

    if (res instanceof ArrayBuffer)
        throw Error("Typed request must return JSON data, got ArrayBuffer");

    if (check.Check(res)) {
        return res;
    } else {
        throw ValidationError.from(check.Errors(res));
    }
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
export async function request(url: string, method: HttpMethod = "GET", payload?: unknown): Promise<ArrayBuffer | unknown> {
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

    if (res.headers.get("content-type")?.includes("application/json")) {
        return res.json();
    } else {
        return res.arrayBuffer();
    }
}

