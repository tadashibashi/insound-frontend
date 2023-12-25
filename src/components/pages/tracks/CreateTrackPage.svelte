<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { ArrowUpTray, Icon, Minus, MusicalNote, Pause, Play, Plus, XMark } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    let numInputs = 1;
    let fileInputs: InputData[] = [{layername: "Layer 1", filepath: "", input: undefined}];
    let filePaths: string[] = [];
    let dummy: HTMLInputElement | undefined = undefined;

    interface InputData {
        layername: string;
        filepath: string;
        input: HTMLInputElement | undefined;
    }

    let submitEl: HTMLButtonElement;

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

    async function testLoadAudioHandler(): Promise<Result<ArrayBuffer[], unknown>>
    {
        const files: File[] = [];

        for (let i = 0; i < numInputs; ++i)
        {
            const input = fileInputs[i].input;
            if (!input || !input.files || !input.files.item(0))
                continue;
            files.push(
                input.files.item(0) as File );
        }

        if (!files.length)
            throw Error("No audio files");

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

    function handleInput(evt: InputEvent)
    {
        console.log(evt.dataTransfer);
    }

    function removeInputSlot(index: number)
    {
        index = Math.floor(index);
        if (index < numInputs && numInputs > 1)
        {


            const temp = [...fileInputs];

            filePaths.splice(index, 1);
            temp.splice(index, 1);

            filePaths = filePaths;
            fileInputs = temp;
            --numInputs;
        }
    }


</script>
<h1 class="ml-10 mt-2 text-3xl">New Track</h1>
<Form
    class="max-w-[512px] mx-auto border border-gray-50 mt-4 rounded-md shadow-sm"
    action={testLoadAudioHandler}
    method="POST" onThen={testLoadAudioHandlerHandler}
    >
    <div class="p-2">
        <div class="relative w-full h-12 mb-2">
        <p class="text-2xl">Layers</p>

        <p class="text-xs font-bold"><span>Name</span></p>
<!--         <div class="absolute top-1 right-1">


            <button
                class="w-8 border border-gray-100 rounded-md bg-gray-200 hover:bg-gray-100"
                type="button"
                on:click={() => numInputs = Math.max(1, numInputs - 1)}>
                    <Icon src="{Minus}" />
            </button>
        </div> -->
    </div>


    <div class="w-full">
    {#each fileInputs as fileInput, i (fileInput)}
        <div class="group relative flex items-center mb-2">

            <input class="text-xs px-4 py-1 border border-gray-100" bind:value={fileInput.layername} type="text" name="name" />
            <label class="text-xs font-bold pl-4" for={"Layer_" + (i + 1)}>
                {#if fileInput !== undefined}
                <input
                    bind:this={fileInput.input}
                    on:change={(evt) => {

                        for (let i = 0; i < fileInputs.length; ++i)
                        {
                            let name = fileInputs[i].input?.value || "";
                            if (name.startsWith("C:\\fakepath\\"))
                            {
                                name = name.substring(12);
                            }

                            if (name.length)
                                fileInput.filepath = name;
                        }

                        submitEl.click();
                    }}
                    on:drop={evt => {
                        evt.preventDefault();
                        if (evt.dataTransfer && evt.dataTransfer.files &&
                            evt.dataTransfer.files.length)
                        {
                            fileInputs[i]
                        }

                    }}

                    class="sr-only"
                    id={"Layer_" + (i + 1)}
                    name={"Layer " + (i+1)}
                    type="file"
                />
                {/if}

                {#if !filePaths[i]}
                    <div class="inline border border-gray-200 rounded-md p-1 cursor-pointer select-none"><Icon class="inline-block mr-1" src="{ArrowUpTray}" mini solid size="16" />
                        Upload audio
                    </div>
                {:else}
                    <div class="inline-flex rounded border border-gray-100">
                        <div class="inline-flex justify-center items-center w-6 aspect-square p-1">
                            <Icon class="inline rounded-md" src="{MusicalNote}" />
                        </div>
                        <div class="border-l inline-flex items-center">
                            <p class="mx-1 text-xs font-mono font-medium">{filePaths[i]}</p>
                        </div>
                    </div>
                {/if}
            </label>
            {#if fileInputs.length > 1}
            <button
                class="border bg-red-300 border-red-300 ml-2 opacity-0 group-hover:opacity-100"
                type="button"
                on:click={() => removeInputSlot(i)}
            >
                <Icon class="text-white" src="{XMark}" size="16"/>
            </button>
            {/if}

        </div>
    {/each}
    </div>
    </div>


    <button
        class="mt-4 w-full border-t-2 border-gray-50 transition-colors rounded-b-md bg-white hover:bg-gray-200 hover:border-transparent flex justify-center text-gray-400 hover:text-gray-500"
        type="button"
        on:click={() => {fileInputs.push({filepath: "", input: undefined, layername: "Layer " + (fileInputs.length + 1)}); fileInputs = fileInputs; ++numInputs}}>
            <p class="text-lg font-bold">+</p>
    </button>

    <button class="sr-only" bind:this={submitEl}></button>

</Form>

<AudioPlayer onload={onload} />

<h2 class="text-xl mb-3 ml-2">Script</h2>
<TextEditor
    onRequestText={onRequestText}
    onSave={()=> console.log("saved.")}
/>

