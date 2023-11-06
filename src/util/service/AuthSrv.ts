import { StorageName } from "app/consts";
import { AuthAPI } from "../api/AuthAPI";
import { UserAPI } from "../api/UserAPI";
import { UserToken } from "../schemas/user/UserToken";

export namespace AuthSrv {

    /**
     * Log-out client from user account
     */
    export
    async function logout(): Promise<boolean>
    {
        const res = await AuthAPI.logout();

        if (res) {
            localStorage.removeItem(StorageName.User);
            return true;
        }

        return false;
    }

    /**
     * Login client to user account
     *
     * @param  email     email address
     * @param  password  password
     * @param  password2 honeypot
     *
     * @return user token or `null` if token expired.
     */
    export
    async function loginEmail(email: string, password: string,
        password2: string)
    {
        const result = await AuthAPI.loginEmail(email, password, password2);

        if (result.ok)
            emplaceUser(result.result);

        return result;
    }

    /**
     * Create a user account
     * @param data - form data to pass to the endpoint
     */
    export
    async function signupEmail(data: FormData)
    {
        return UserAPI.createOne(data);
    }


    /**
     * Get the current user token as a {@link UserToken} from local storage.
     * First checks with the server to make sure it's valid.
     *
     * @return  The user token, or `null` if it expired or does not exist.
     */
    export
    async function getLocalUser(): Promise<UserToken | null>
    {
        if (!await AuthAPI.checkUser()) {
            return cleanUp();
        }

        const token = localStorage.getItem(StorageName.User);
        if (!token) return null;

        const payloadStr = token.split(".")[1];

        const payload = JSON.parse(atob(payloadStr));

        // if token expired or invalid signature
        if (payload.exp * 1000 < Date.now() ||
            !UserToken.isValidSync(payload)) {

            return cleanUp();
        }

        return payload;

        /**
         * Helper to delete invalid token.
         * Returns null, so it can be called like so: `return cleanUp();`
         */
        function cleanUp() {
            localStorage.removeItem(StorageName.User);
            return null;
        }
    }

    export
    async function verifyEmail(token: string)
    {
        await AuthAPI.verifyEmail(token);
    }


    // ===== Helper functions =================================================

    /**
     * Takes a User jsonwebtoken from a request saves it into local storage.
     * Returns a parsed {@link UserToken} for convenience as it also runs
     * a check on its validity.
     *
     * @param      token     The token
     * @return     The token converted to a {@link UserToken},
     *             `null` if expired
     */
    function emplaceUser(token: string): UserToken | null
    {
        // check that token is unexpired and matches first
        const user = JSON.parse(atob(token.split(".")[1]));

        if (!user || !user.exp || user.exp * 1000 < Date.now() ||
            !UserToken.isValidSync(user)) {
            return null;
        }

        localStorage.setItem(StorageName.User, token);
        return user;
    }
}
