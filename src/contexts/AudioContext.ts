import { audioModuleWasInit, initAudioModule } from "app/audio/src/ts/emaudio/AudioModule";
import { AudioEngine } from "audio/AudioEngine";
import { onMount, setContext } from "svelte";
import { get, writable } from "svelte/store";

export namespace AudioContext {
    export function init() {
        const audio = writable<AudioEngine | null>(null);
        let interval: number | null = null;

        function audioUpdate() {
            const engine = get(audio);
            if (engine)
            {
                try {
                    if (audioModuleWasInit())
                    {
                        engine.update();
                    }
                }
                catch(err)
                {
                    console.error(err);
                }
            }
        }

        onMount(() => {
            initAudioModule()
                .then(() => {
                    audio.set(new AudioEngine);
                    interval = setInterval(audioUpdate, 5);
                });

            return () => {
                if (interval)
                    clearInterval(interval);
                get(audio)?.release();
            };
        });

        setContext("audio", audio);
    }
}
