<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { Icon, Minus, Pause, Play, Plus } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";
    import KnobWidget from "app/components/widgets/KnobWidget.svelte";
    import { NumberParameter } from "audio/params/types/NumberParameter";

    let numInputs = 1;

    const onload = new Delegate<void, [ArrayBuffer, string[], string]>;
    const onRequestText = new Delegate<string, []>;

    function loadAudioHandler(payload: Result<unknown, unknown>) {
        if (!payload.ok)
            throw Error("Request error.");
        if (!(payload.result instanceof ArrayBuffer))
            throw Error("Wrong data type received from request.");

        let text = "";
        if (onRequestText.handleCount)
        {
            text = onRequestText.invoke();
        }

        onload.invoke(payload.result, [], text); // todo: add layer names in array
    }


</script>

<KnobWidget class="m-16 w-16"
    param={new NumberParameter("acorn", 0, 0, 10, 1, 1, false, (name, val) => {})}/>

<Form
    class="max-w-[512px] mx-auto border border-gray-100 mt-4 rounded-md shadow-sm"
    action="/api/test/make-fsb"
    method="POST" onThen={loadAudioHandler}
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

<h2 class="text-xl mb-3 ml-2">Script</h2>
<TextEditor
    onRequestText={onRequestText}
    onSave={()=> console.log("saved.")}
/>

