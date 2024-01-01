type UserToken = import("shared/schemas/user/UserToken").UserToken;

interface UserContext {
    logout: () => Promise<void>;
    login: (email: string, password: string, password2: string) => Promise<boolean>;
    user: import("svelte/store").Readable<UserToken | null>;
}

type AudioCtx = import("svelte/store").Readable<import("audio/AudioEngine").AudioEngine | null>;


// App-wide contexts
declare module "svelte" {
    declare function setContext(key: "user", context: UserContext): UserContext;
    declare function setContext(key: "audio", context: AudioContext): AudioContext;
    declare function getContext(key: "user"): UserContext;
    declare function getContext(key: "audio"): AudioCtx;
}

// Represents one input element in the list
interface InputData {
    layername: string;
    filepath: string;
    input: HTMLInputElement | undefined;
    isProblematic: boolean;
}
