/**
 * @file UserAPI.ts
 * @description
 *     Contains the UserAPI namespace for directly interfacing with the
 *     server track api. Should not be used by components directly. Instead,
 *     use UserSrv.ts functions.
 */
import { request } from "./request";
import * as t from "yup";

/**
 * Wrapper around the backend User API.
 */
export namespace UserAPI {
    const decoder = new TextDecoder();
    const ROOT = "/api/auth/";

    /**
     * Creates a user account.
     * Returns the token if creation was succesful
     *
     * @param      {FormData}  formData  The form data
     * @return     {Promise}   user token string
     */
    export async function createOne(formData: FormData): Promise<string> {
        const res = await request(ROOT + "email", "POST", formData);

        if (!(res instanceof ArrayBuffer)) throw new Error("Invalid response");

        return decoder.decode(res);
    }

    /**
     * Reads a user's data
     *
     * @param      {string}   id      The identifier
     * @return     {Promise<unknown>}  { description_of_the_return_value }
     */
    export async function readOne(id: string): Promise<unknown> {
        id = encodeURIComponent(id);
        return request(ROOT + id);
    }

    /**
     * Update a user
     *
     * @param      {string}    id        The identifier
     * @param      {FormData}  formData  The form data
     * @return     {Promise}   { description_of_the_return_value }
     */
    export async function updateOne(id: string, formData: FormData) {
        id = encodeURIComponent(id);
        return request(ROOT + id, "PATCH", formData);
    }

    /**
     * Delete a user
     *
     * @param      {string}   id      The identifier
     * @return     {Promise<boolean>}  Whether user was deleted.
     */
    export async function deleteOne(id: string) {
        id = encodeURIComponent(id);
        return request(ROOT + id, "DELETE");
    }

    /**
     * Login a user via email.
     *
     * @param      {string}   email     The email
     * @param      {string}   password  The password
     * @return     {Promise<string>}  gets a user token if successful
     */
    export async function loginEmail(email: string, password: string): Promise<string> {
        const buf = await request(ROOT + "login/email", "POST", {
            email, password,
        });

        if ( !(buf instanceof ArrayBuffer) ) {
            throw Error("Invalid type in response!");
        }

        return decoder.decode(buf);
    }

    export async function logout() {
        await request(ROOT + "logout", "POST");
    }

    const UserCheck = t.object({
            auth: t.boolean().required(),
        });

    export async function checkUser(): Promise<boolean> {
        const res = await request(ROOT + "check") as any;

        if (UserCheck.isValidSync(res)) {
            return res.auth;
        }

        throw Error("Internal Error: received invalid server response");
    }
}
