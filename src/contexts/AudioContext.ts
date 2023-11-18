import { AudioEngine, initAudio } from "audio/AudioEngine";
import { onMount, setContext } from "svelte";
import { get, writable } from "svelte/store";

export namespace AudioContext {
    export function init() {
        const audio = writable<AudioEngine | null>(null);

        function audioUpdate(time: number) {
            const handle = requestAnimationFrame(audioUpdate);
            const engine = get(audio);
            if (engine)
                engine.update();
            else
                cancelAnimationFrame(handle);
        }

        onMount(() => {
            initAudio()
                .then(() => {
                    audio.set(new AudioEngine);
                    audioUpdate(0);
                });

            return () => {
                const engine = get(audio);
                engine?.release();
            };
        });

        setContext("audio", audio);
    }
}
