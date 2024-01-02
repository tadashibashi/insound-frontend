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
                        if (engine.updateHandler)
                            engine.updateHandler();
                        engine.update();
                    }
                }
                catch(err)
                {
                    engine.reset();
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
                const engine = get(audio);
                engine?.release();
            };
        });

        setContext("audio", audio);
    }
}
