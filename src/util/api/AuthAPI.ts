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
            t.boolean().required(), t.string().required());

        return res.ok;
    }

    /**
     * Check whether current user token is valid
     * @return whether token is valid.
     */
    export
    async function checkUser(): Promise<boolean> {
        const res = await request(ROOT + "/check");

        return res.ok;
    }


    /**
     * Verify account via token received in email
     */
    export
    async function activate(token: string)
    {
        return request(ROOT + "/activate", "POST", {
            token,
        },
        t.string().required(), t.string().required());
    }
}
