type MixPreset = import("app/util/MixPreset").MixPreset;
type UserToken = import("shared/schemas/user/UserToken").UserToken;
type AudioChannel = import("audio/AudioChannel").AudioChannel;

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
    channel: AudioChannel | null;
}

// External controls for an AudioPlayer component
interface AudioPlayerExternalControls {
    /**
     * Load audio into the player
     *
     * @param data binary data of a single FSB, or multiple audio files
     * @param layerNames name of each audio layer
     * @param script text of lua script
     */
    load(data: ArrayBuffer[] | ArrayBuffer, channels: AudioChannel[], script: string): void;

    /**
     * Unload data from audio player
     */
    unload(): void;
}

interface AudioSubmissionData
{
    looping: boolean;
    mixPresets: MixPreset[];
    transitionTime: number;
    script: string;
    showMarkers: boolean;
}
