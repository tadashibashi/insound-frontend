import { Schema } from "yup";

export
type SchemaLike<T> = {
    validate: (obj: any) => Promise<T>;
};

/**
 * Create a result from a response. Decoupled from constructor to allow for
 * asynchronous creation, and treat the Result class as a simple data container
 *
 */
export
async function createResult<R, E>(response: Response, bodyType?: SchemaLike<R>,
    errorType?: SchemaLike<E>)
{
    let result: Result<R, E>;
    if (response.ok)
    {
        result = new Result<R, E>(await getBody(response, bodyType) as R, undefined);
    }
    else
    {
        result = new Result<R, E>(undefined, await getBody(response, errorType) as E);
    }

    return result;
}

/**
 * Create a result from a response without type checks. Decoupling from
 * constructor allows for asynchronous parsing of the Response on creation.
 *
 */
export
async function createUnknownResult(response: Response) {
    let result: Result<unknown, unknown>;
    if (response.ok)
    {
        result = new Result<unknown, unknown>(
            await getBody(response) as unknown, undefined);
    }
    else
    {
        result = new Result<unknown, unknown>(
            undefined, await getBody(response) as unknown);
    }

    return result;
}

/**
 * Class that holds the result of a request, whether it be an error or the
 * payload body.
 *
 * Content-Type parsing behaviors:
 * "application/json"
 *     JSON-parsed object
 * "text/*"
 *     JavaScript string
 *  anything else:
 *     ArrayBuffer
 * or an exception will be thrown in the constructor.
 */
export
class Result<Body, Err>
{
    private body_?: Body;
    private error_?: Err;

    constructor(body?: Body, error?: Err)
    {
        this.body_ = body;
        this.error_ = error;
    }

    /**
     * Check whether the request was successful
     */
    get ok(): boolean
    {
        return this.body_ !== undefined;
    }

    /**
     * Get the body of the request. Call only when Result#ok === true.
     * Throws an exception otherwise.
     *
     */
    get result(): Body
    {
        if (this.body_ === undefined)
            throw Error("Attempted to access body on non-ok status.");
        return this.body_;
    }

    /**
     * Get the error of the request. Call only when Result#isSuccess === false.
     * Throws an exception otherwise.
     *
     */
    get error(): Err
    {
        if (this.error_ === undefined)
            throw Error("Attempted to access error on `res.ok` status.");
        return this.error_;
    }
}

// ===== Helper functions =====================================================


/**
 * Parses the response for the body depending on content type.
 * If JSON, it will search for a field called "result", and validate that
 * value.
 *
 * Assumes that `res.ok` is `true`.
 *
 */
async function getBody<T>(res: Response, schema?: SchemaLike<T>): Promise<T | unknown>
{
    const type = res.headers.get("Content-Type") || "";

    if (type.startsWith("application/json"))
    {
        const o = await res.json();
        return schema ? schema.validate(o) : o;
    }
    else if (type.startsWith("text/"))
    {
        const s = await res.text();
        return schema ? schema.validate(s) : s;
    }
    else
    {
        const buf = await res.arrayBuffer();
        return schema ? schema.validate(buf) : buf;
    }
}
