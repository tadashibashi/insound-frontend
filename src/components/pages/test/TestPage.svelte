<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { Icon, Minus, Pause, Play, Plus } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    let numInputs = 1;
    let fileInputs: HTMLInputElement[] = [];

    const onload = new Delegate<void, [ArrayBuffer | ArrayBuffer[], string[],
        string]>;
    const onRequestText = new Delegate<string, []>;

    function loadAudioHandler(payload: Result<unknown, unknown>,
        data: FormData)
    {
        if (!payload.ok)
            throw Error("Request error.");
        if (!(payload.result instanceof ArrayBuffer))
            throw Error("Wrong data type received from request.");

        let text = "";
        const names = data.getAll("name").map(val => val.toString());
        if (onRequestText.handleCount)
        {
            text = onRequestText.invoke();
        }

        onload.invoke(payload.result, names, text);
    }

    async function testLoadAudioHandler(data: FormData): Promise<Result<ArrayBuffer[], unknown>>
    {
        const files: File[] = [];

        for (let i = 0; i < numInputs; ++i)
        {
            const fileInput = fileInputs[i]
            if (!fileInput || !fileInput.files || !fileInput.files.item(0))
                continue;
            files.push(
                fileInput.files.item(0) as File );
        }

        const promises: Promise<ArrayBuffer>[] = [];
        for (let i = 0; i < files.length; ++i)
        {
            promises.push(files[i].arrayBuffer());
        }

        try {
            const result = await Promise.all(promises)
            return new Result(result);
        }
        catch(err)
        {
            console.error(err);
            return new Result([], err);
        }
    }

    function isArrayBufferArray(testObj: any): testObj is ArrayBuffer[]
    {
        return Array.isArray(testObj) &&
            (testObj.length === 0 || testObj[0] instanceof ArrayBuffer);
    }

    function testLoadAudioHandlerHandler(payload: Result<unknown, unknown>,
        data: FormData)
    {
        if (!payload.ok)
            throw Error("Request error.");
        const result = payload.result;
        if (!isArrayBufferArray(result))
            throw Error("Wrong data type received from request.");

        let text = "";
        const names = data.getAll("name").map(val => val.toString());
        if (onRequestText.handleCount)
        {
            text = onRequestText.invoke();
        }

        onload.invoke(result, names, text);
    }


</script>
    <!-- action="/api/test/make-fsb" -->
<Form
    class="max-w-[512px] mx-auto border border-gray-100 mt-4 rounded-md shadow-sm"
    action={testLoadAudioHandler}
    method="POST" onThen={testLoadAudioHandlerHandler}
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
            <input class="text-xs font-bold block pl-4" type="text" value="Layer {i + 1}" name="name" />
            <!-- <label class="text-xs font-bold block pl-4" for={"Layer_" + (i + 1)}>Layer {i + 1}</label> -->
            <input
                bind:this={fileInputs[i]}
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

