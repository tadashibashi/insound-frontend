<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { ArrowRight, ArrowUpTray, Icon, Minus, MusicalNote, Pause, Play, Plus, XMark } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    import { Transition } from "@rgossiaux/svelte-headlessui";
    import type { MixPreset } from "app/audio/src/ts/MixPresetMgr";
    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";

    let fileInputs: InputData[] = [{layername: "Layer 1", filepath: "", input: undefined}];
    let filePaths: string[] = [];

    let formState = 0;

    let mixPresets: MixPreset[] = [];

    interface InputData {
        layername: string;
        filepath: string;
        input: HTMLInputElement | undefined;
    }

    let errorMessages: string[] = [];
    $: showErrors = errorMessages.length > 0;

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

    function collectFiles(): File[]
    {
        const files: File[] = [];
        const numInputs = fileInputs.length;

        for (let i = 0; i < numInputs; ++i)
        {
            const input = fileInputs[i].input;
            if (!input || !input.files || !input.files.item(0))
                continue;
            files.push(
                input.files.item(0) as File );
        }

        return files;
    }

    async function testLoadAudioHandler(): Promise<Result<ArrayBuffer[], unknown>>
    {
        const files = collectFiles();

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

    function removeInputSlot(index: number)
    {
        index = Math.floor(index);
        if (index < fileInputs.length && fileInputs.length > 1)
        {


            const temp = [...fileInputs];

            filePaths.splice(index, 1);
            temp.splice(index, 1);

            filePaths = filePaths;
            fileInputs = temp;
        }
    }

    function handleNewFileChange(evt: Event)
    {
        const target = evt.currentTarget as HTMLInputElement;

        if (!target || !target.value) return;
        const lastFileInput = fileInputs[fileInputs.length-1];

        fileInputs.push({
            filepath: "",
            input: undefined,
            layername: "Layer " + (fileInputs.length + 1)
        });
    }

    function handleFileChange(fileInput: InputData)
    {
        let name = fileInput.input?.value || "";
        if (name.startsWith("C:\\fakepath\\"))
        {
            name = name.substring(12);
        }

        if (name.length)
            fileInput.filepath = name;

        // update fileInputs (assumes fileInput is in the list)
        fileInputs = fileInputs;
    }


</script>
<h1 class="ml-10 mt-2 text-3xl">New Track</h1>



<Transition
    class="absolute flex flex-col items-center justify-center w-full"
    show={formState === 0}
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
>

<!-- Error message box -->
<Transition
    class="flex flex-col items-center justify-center w-full"
    show={showErrors}
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"

    on:outroend={() => errorMessages.length = 0}
>
    <ErrorAlert title="An error occurred during your submission" errorList={errorMessages} oncancel={() => showErrors = false}/>
</Transition>

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
        <div class={i === fileInputs.length - 1 ? "sr-only" : "group relative flex items-center mb-2"}>
            <input class="text-xs px-4 py-1 border border-gray-100" bind:value={fileInput.layername} type="text" name="name" />

            <label class="text-xs font-bold pl-4" for={"Layer_" + (i + 1)}>
                <input
                    bind:this={fileInput.input}
                    on:change={(evt) => {
                        if (i === fileInputs.length - 1)
                            handleNewFileChange(evt);

                        handleFileChange(fileInput);
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

                {#if !fileInput.filepath}
                    <div class="inline border border-gray-200 rounded-md p-1 cursor-pointer select-none"><Icon class="inline-block mr-1" src="{ArrowUpTray}" mini solid size="16" />
                        Upload audio
                    </div>
                {:else}
                    <div class="inline-flex rounded border border-gray-100 shadow-sm">
                        <div class="inline-flex justify-center items-center w-6 aspect-square bg-violet-100">
                            <Icon class="inline rounded-md p-1 drop-shadow-sm" src="{MusicalNote}" />
                        </div>
                        <div class="border-l inline-flex items-center">
                            <p class="mx-1 text-xs font-mono font-medium">{fileInput.filepath}</p>
                        </div>
                    </div>
                {/if}
            </label>

            <!-- Delete layer button -->
            {#if fileInputs.length > 1}
            <button
                class="rounded border bg-red-300 border-red-300 ml-2 opacity-0 group-hover:opacity-100"
                type="button"
                on:click={() => removeInputSlot(i)}
            >
                <Icon class="text-white" src="{XMark}" size="16"/>
            </button>
            {/if}

        </div>

        {#if i === fileInputs.length-1}
            <label for={"Layer_" + (i + 1)}
                class="mt-4 w-full border-t-2 border-gray-50 transition-colors duration-500 rounded-b-md bg-white hover:bg-gray-50 flex justify-center text-gray-400 hover:text-gray-500 cursor-pointer"
            >
                <p class="text-lg font-bold">+</p>
            </label>
        {/if}
    {/each}
    </div>
    </div>

    <button class="sr-only" bind:this={submitEl}></button>

</Form>
<div class="w-full flex justify-center mt-3">
    <button
        class="bg-violet-500 text-white px-2 rounded-md border border-violet-600"
        on:click={()=> {
            const files = collectFiles();
            if (files.length === 0)
            {
                errorMessages.length = 0;
                errorMessages.push("No audio files were attached.");
                errorMessages = errorMessages;
                return;
            }
            formState = 1;
            submitEl.click();
        }}
    >
        Next
    </button>
</div>

</Transition>

<div class={"absolute transition-opacity duration-300 " + (formState === 1 ? "opacity-100" : "opacity-0 pointer-events-none")}>
    <AudioPlayer onload={onload} mixPresets={mixPresets} />
    <h2 class="text-xl mb-3 ml-2">Script</h2>
    <TextEditor
        onRequestText={onRequestText}
        onSave={()=> console.log("saved.")}
    />
</div>



<!-- <div class="mt-4 ml-4">
    <input  bind:value={mixNameValue} placeholder="Mix Name" />
    <button class="block" on:click={handleAddMixClick}>Add Mix</button>
</div> -->


