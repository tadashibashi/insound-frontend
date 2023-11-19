<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { Icon, Minus, Pause, Play, Plus } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";

    let numInputs = 1;

    const onload = new Delegate<void, [ArrayBuffer]>;

    function onLoadAudio(payload: Result<unknown, unknown>) {
        if (!payload.ok)
            throw Error("Request error.");
        if (!(payload.result instanceof ArrayBuffer))
            throw Error("Wrong data type received from request.");

        onload.invoke(payload.result);
    }


</script>

<Form
    class="max-w-[512px] mx-auto border border-gray-100 mt-4 rounded-md shadow-sm"
    action="/api/test/make-fsb"
    method="POST" onThen={onLoadAudio}
    >
    <div class="relative w-full h-12">
        <p class="absolute top-1 left-3 text-2xl">Load Audio</p>
        <div class="absolute top-1 right-1">
            <button
                class="w-8 border border-gray-100 rounded-md bg-gray-200 hover:bg-gray-100"
                type="button"
                on:click={() => numInputs = Math.min(8, numInputs + 1)}>
                    <Icon src="{Plus}" />
            </button>

            <button
                class="w-8 border border-gray-100 rounded-md bg-gray-200 hover:bg-gray-100"
                type="button"
                on:click={() => numInputs = Math.max(1, numInputs - 1)}>
                    <Icon src="{Minus}" />
            </button>
        </div>
    </div>


    <div class="w-full">
    {#each Array(numInputs) as _, i ("input_" + i)}
        <div>
            <label class="text-xs font-bold block pl-4" for={"Layer_" + (i + 1)}>Layer {i + 1}</label>
            <input
                class="block pl-4 mt-1 mb-2"
                id={"Layer_" + (i + 1)}
                name={"Layer " + (i+1)}
                type="file"
                required />
        </div>
    {/each}
    </div>

    <button
        class="border border-gray-200 rounded-md py-1 px-2 my-4 mx-auto block bg-violet-400 text-white"
        type="submit">
        Load Files
    </button>
</Form>

<AudioPlayer onload={onload} />
