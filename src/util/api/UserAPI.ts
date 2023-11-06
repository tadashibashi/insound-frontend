/**
 * @file UserAPI.ts
 * @description
 *     Contains the UserAPI namespace for directly interfacing with the
 *     server track api. Should not be used by components directly. Instead,
 *     use UserSrv.ts functions.
 */
import { FormErrors } from "../schemas/FormErrors";
import { UserToken } from "../schemas/user/UserToken";
import { request } from "./request";
import * as t from "yup";

/**
 * Wrapper around the backend User API.
 */
export namespace UserAPI
{
    /**
     * Root URL for this api
     */
    const ROOT = "/api/auth/";


    /**
     * Creates a user account.
     * Returns the token if creation was succesful
     *
     * @param      formData  The form data
     * @return     result "Success" or a list of form errors
     */
    export
    async function createOne(formData: FormData)
    {
        return request(ROOT + "email", "POST", formData,
            t.string().required(), FormErrors);
    }


    /**
     * Read a user's data
     *
     * @param      id      The id of the user profile to read
     *
     * @return     The UserToken or null if there was a problem.
     *             User may not have permission to read a profile if it is
     *             private, etc.
     */
    export
    async function readOne(id: string)
    {
        id = encodeURIComponent(id);
        const result = await request(ROOT + id, "GET", null,
            UserToken, t.string().required());

        if (!result.ok)
            return null;

        return result.result;
    }


    /**
     * Update a user
     *
     * @param      id        The identifier of the user to update
     * @param      formData  The form data
     *
     * @return     result "Success" or a list of form errors
     */
    export
    async function updateOne(id: string, formData: FormData)
    {
        id = encodeURIComponent(id);
        return request(ROOT + id, "PATCH", formData,
            t.string().required(), FormErrors);
    }


    /**
     * Delete a user
     *
     * @param      id      The identifier of the user to delete
     * @return     Whether user was deleted.
     */
    export
    async function deleteOne(id: string)
    {
        id = encodeURIComponent(id);
        const res = await request(ROOT + id, "DELETE", null);
        return res.ok;
    }
}
