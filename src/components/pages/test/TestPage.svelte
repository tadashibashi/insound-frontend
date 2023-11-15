<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { onMount } from "svelte";
    import { AudioEngine, initAudio } from "audio/AudioEngine";
    import { Result } from "app/util/api/Result";


    let audio: AudioEngine;
    let numInputs = 1;
    let isPlaying = false;

    function onThen(payload: unknown) {
        if (!(payload instanceof Result))
            throw Error("Wrong data type received from request.");
        if (!payload.ok)
            throw Error("Request error.");
        if (!(payload.result instanceof ArrayBuffer))
            throw Error("Wrong data type received from request.");
        if (!audio)
            throw Error("Audio engine has not been initialized.");
        console.log(payload.result);
        audio.loadTrack(payload.result);
    }

    function audioUpdate(time: number) {
        requestAnimationFrame(audioUpdate);
        if (audio)
            audio.update();
    }

    onMount(() => {
        // On Start
        initAudio()
            .then(() => {
                audio = new AudioEngine();
                console.log("Audio engine initialized.");
            });

        requestAnimationFrame(audioUpdate);

        // On Shutdown
        return () => {
            audio.release();
        };
    });

    function onPressPlay() {
        if (!audio) return;
        audio.play();
        // audio.setPause(!audio.paused);
        // isPlaying = audio.paused;
    }
</script>

<Form action="/api/test/make-fsb" method="POST" onThen={onThen}>
    <div>
        <button id="add-input" type="button" on:click={() => numInputs = Math.min(8, numInputs + 1)}>+</button>
        <button id="remove-input" type="button" on:click={() => numInputs = Math.max(1, numInputs - 1)}>-</button>
    </div>

    {#each Array(numInputs) as _, i ("input_" + i)}
        <label for={"Layer_" + (i + 1)}>Layer {i + 1}</label>
        <input id={"Layer_" + (i + 1)} name={"Layer " + (i+1)} type=file required />
    {/each}

    <button type="submit">Load Files</button>
</Form>

{#if isPlaying}
<button on:click={onPressPlay}>Pause</button>
{:else}
<button on:click={onPressPlay}>Play</button>
{/if}

