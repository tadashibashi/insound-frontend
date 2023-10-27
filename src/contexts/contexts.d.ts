type UserToken = import("shared/schemas/user/UserToken").UserToken;

interface UserContext {
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    user: import("svelte/store").Readable<UserToken | null>;
}

// App-wide contexts
declare module "svelte" {
    declare function setContext(key: "user", context: UserContext): UserContext;
    declare function getContext(key: "user"): UserContext;
}
