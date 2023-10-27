/**
 * @file UserSrv.ts
 * @description
 *     Contains functions usable by components for interacting with the user api
 */
import { UserToken } from "app/util/schemas/user/UserToken";
import { UserAPI } from "../api/UserAPI";
import { StorageName } from "app/consts";
import { ValidationError } from "app/util/validation/errors";

export namespace UserSrv {
    /**
     * Get the current user token as a {@link UserToken} from local storage.
     * First checks with the server to make sure it's valid.
     *
     * @return  The user token, or `null` if it expired.
     */
    export async function getLocalUser(): Promise<UserToken | null> {
        if (!await UserAPI.checkUser()) {
            return cleanUp();
        }

        const token = localStorage.getItem(StorageName.User);
        if (!token) return null;

        const payloadStr = token.split(".")[1];

        const payload = JSON.parse(atob(payloadStr));

        // if token expired or invalid signature
        if (payload.exp * 1000 < Date.now() ||
            !UserToken.Validator.Check(payload)) {

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

    export async function logout() {
        // Remove local user info
        localStorage.removeItem(StorageName.User);

        await UserAPI.logout();
    }

    export async function loginEmail(email: string, password: string) {
        const token = await UserAPI.loginEmail(email, password);
        return emplaceUser(token);
    }

    export async function signupEmail(data: FormData) {
        const token = await UserAPI.createOne(data);
        return emplaceUser(token);
    }


    /**
     * Takes a User jsonwebtoken from a request saves it into local storage.
     * Returns a parsed {@link UserToken} for convenience as it also runs
     * a check on its validity.
     *
     * @param      token     The token
     * @return     The token converted to a {@link UserToken},
     *             `null` if expired
     */
    function emplaceUser(token: string): UserToken | null {
        // check that token is unexpired and matches first
        const user = JSON.parse(atob(token.split(".")[1]));

        // Validate the user token, in case
        const errors = UserToken.Validator.Errors(user);
        if (errors.First()) {
            throw ValidationError.from(errors);
        }

        if (!user || !user.exp || user.exp * 1000 < Date.now() ||
            errors.First()) {
            return null;
        }

        localStorage.setItem(StorageName.User, token);
        return user;
    }
}
