/**
 * Server error. Thrown by request when a code 500-599 error occurs
 */
export
class ServerError extends Error {
    constructor(code: number, statusText: string) {
        super("Internal Server Error " + code + ": " + statusText);
    }
}
