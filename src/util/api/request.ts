/* ==========================================================================
 * @file request.ts
 * @description
 *     All front-end requests to the backend should be made through these
 *     functions.
 *
 * ========================================================================== */
import { StorageName } from "app/consts";
import type { Schema } from "yup";
import { Cookie } from "../cookies";
import { Result, createResult, createUnknownResult } from "./Result";
import { ServerError } from "./ServerError";

/**
 * Method name `string` that is passed to an http request.
 * Limited to the needs of this project.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
export
async function request(url: string): Promise<Result<unknown, unknown>>;
export
async function request(url: string, method: HttpMethod):
    Promise<Result<unknown, unknown>>;
export
async function request(url: string, method: HttpMethod, payload: unknown):
    Promise<Result<unknown, unknown>>;
export
async function request<R, E>(url: string, method: HttpMethod, payload: unknown,
    bodySchema: Schema<R>, errorSchema: Schema<E>) : Promise<Result<R, E>>;
export
async function request<R, E>(url: string, method: HttpMethod="GET", payload?: unknown,
    bodySchema?: Schema<R>, errorSchema?: Schema<E>):
    Promise<Result<R, E> | Result<unknown, unknown>>
{
    // Make request, and receive response
    let res: Response;
    {
        // Create headers
        let headers: HeadersInit = {};

        // Setup the body with payload if any provided
        let body: BodyInit | undefined = undefined;
        if (payload)
        {
            // Automatically pass CSRF token
            const csrftoken = Cookie.get("csrftoken");
            if (csrftoken)
                headers["X-CSRF-TOKEN"] = csrftoken;

            if (payload instanceof FormData)
            {
                // FormData API will automatically set headers in fetch
                body = payload;
            }
            else
            {
                headers["content-type"] = "application/json";

                try {
                    body = JSON.stringify(payload);
                }
                catch(e)
                {
                    console.error("Error while stringifying Request payload:",
                        e);
                    throw e;
                }
            }
        }

        // Set the Authorization header from user token
        if (localStorage.getItem(StorageName.User))
        {
            headers["authorization"] = "Bearer " +
                localStorage.getItem(StorageName.User);
        }

        // Perform request
        try {
            res = await fetch(url, {
                body,
                headers,
                method
            });
        }
        catch(e)
        {
            console.error("Error during fetch:", e);
            throw e;
        }
    }


    // Process response
    if (!res.ok)
    {
        switch (res.status)
        {
            case 401:
                // Any invalid access should remove user token as invalid
                localStorage.removeItem(StorageName.User);
                break;
            default:
                break;
        }

        // Alert program of server error
        if (res.status >= 500 && res.status < 600)
            throw new ServerError(res.status, res.statusText);

        // Client errors should not throw here since the program logic revolves
        // around displaying mistakes to user form input, etc.
    }


    // Parse the result
    if (bodySchema && errorSchema)
    {
        return createResult<R, E>(res, bodySchema, errorSchema);
    }
    else
    {
        return createUnknownResult(res);
    }
}

