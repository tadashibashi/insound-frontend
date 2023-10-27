import { onMount, setContext } from "svelte";
import { writable } from "svelte/store";
import { UserSrv } from "app/util/service/UserSrv";

export namespace UserContext {
    export function init() {
        const user = writable<UserToken | null>(null);

        onMount(async () => user.set(await UserSrv.getLocalUser()));

        setContext("user", {
            login, logout, user,
        });

        async function login(email: string, password: string) {
            const res = await UserSrv.loginEmail(email, password);
            if (res)
                user.set(res);
            return !!res;
        }

        async function logout() {
            user.set(null);
            await UserSrv.logout();
        }
    }
}
