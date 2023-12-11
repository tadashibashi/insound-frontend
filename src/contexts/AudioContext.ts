import { initAudioModule } from "app/audio/src/ts/emaudio/AudioModule";
import { AudioEngine } from "audio/AudioEngine";
import { onMount, setContext } from "svelte";
import { get, writable } from "svelte/store";

export namespace AudioContext {
    export function init() {
        const audio = writable<AudioEngine | null>(null);
        let interval: NodeJS.Timeout | null = null;

        function audioUpdate() {
            const engine = get(audio);
            if (engine)
            {
                if (engine.updateHandler)
                    engine.updateHandler();
                engine.update();
            }
        }

        onMount(() => {
            initAudioModule()
                .then(() => {
                    audio.set(new AudioEngine);
                    interval = setInterval(audioUpdate, 10);
                });

            return () => {
                if (interval)
                    clearInterval(interval);
                const engine = get(audio);
                engine?.release();
            };
        });

        setContext("audio", audio);
    }
}
