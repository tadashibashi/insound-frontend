import { AuthSrv } from "app/util/service/AuthSrv";
import { onMount, setContext } from "svelte";
import { writable } from "svelte/store";

export namespace UserContext {
    export function init() {
        const user = writable<UserToken | null>(null);

        onMount(async () => user.set(await AuthSrv.getLocalUser()));

        setContext("user", {
            login, logout, user,
        });

        async function login(email: string, password: string, password2: string)
        {
            return AuthSrv.loginEmail(email, password, password2);
        }

        async function logout() {
            user.set(null);
            return AuthSrv.logout();
        }
    }
}
