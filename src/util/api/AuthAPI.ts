import { FormErrors } from "../schemas/FormErrors";
import { request } from "./request";
import * as t from "yup";

export namespace AuthAPI {
    const ROOT = "/api/auth";

    /**
     * Login a user via email.
     *
     * @param      email     The email
     * @param      password  The password
     * @return     gets a user token if successful
     */
    export
    async function loginEmail(email: string, password: string,
        password2: string)
    {

        return request(ROOT + "/login/email",
            "POST",
            {
                email, password, password2,
            },
            t.string().required(), FormErrors);
    }

    /**
     * Log a user out.
     *
     * @return whether logout was successful.
     */
    export
    async function logout(): Promise<boolean>
    {
        const res = await request(ROOT + "/logout",
            "POST",
            null,
            t.string().required(), t.string().required());

        return res.ok;
    }


    /**
     * Type received from checkUser response
     */
    const UserCheck = t.object({
            auth: t.boolean().required(),
        }).required();

    /**
     * Check whether current user token is valid
     * @return whether token is valid.
     */
    export
    async function checkUser(): Promise<boolean> {
        const res = await request(ROOT + "/check", "GET", null,
            UserCheck, t.string().required());

        return res.ok;
    }

    /**
     * Verify account via token received in email
     */
    export
    async function verifyEmail(token: string): Promise<boolean>
    {
        const res = await request(ROOT + "/verify", "POST", {
            token,
        },
        t.string().required(), t.string().required());

        return res.ok;
    }
}
