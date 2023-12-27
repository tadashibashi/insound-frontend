<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { ArrowRight, ArrowSmallLeft, ArrowUpTray, Backward, Icon, Minus, MusicalNote, Pause, Play, Plus, PlusCircle, XMark } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    import { Transition } from "@rgossiaux/svelte-headlessui";
    import type { MixPreset } from "app/audio/src/ts/MixPresetMgr";
    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import Modal from "app/components/Modal.svelte";

    interface InputData {
        layername: string;
        filepath: string;
        input: HTMLInputElement | undefined;
    }

    // ===== Form state =======================================================

    let fileInputs: InputData[] = [
        {layername: "Layer 1", filepath: "", input: undefined}
    ];

    // state tracker, shows different parts of the form when set
    // 0: file loader
    // 1: options + audio previewer
    let formState = 0;

    // error messages to display
    let errorMessages: string[] = [];
    $: showErrors = errorMessages.length > 0;

    let showAddMixModal = false;

    // ===== Options ==========================================================

    let mixPresets: MixPreset[] = [];
    let showMarkers = true;
    let looping = true;
    let transitionTime = 1;

    const defaultScript =
`--Called after track finishes loading
function on_ready()
    print("Track is ready!")
end

--Called when the playhead crosses a marker
function on_marker(name, offset)
    print("Marker: "..name..", "..offset)
    if name == "LoopStart" then
        print("Loop started")
    end
end
`;



    let submitEl: HTMLButtonElement;

    const onload = new Delegate<void, [ArrayBuffer | ArrayBuffer[], string[],
        string]>;
    const onunload = new Delegate<void, []>;
    const onRequestText = new Delegate<string, []>;

    const retrieveMix = new Delegate<number[], []>;

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

    function resetAudio()
    {
        onload.invoke([], [], "");
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
        names.pop(); // remove last one, since it's a dummy input waiting for user input
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
            temp.splice(index, 1);
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

<Modal bind:show={showAddMixModal} isCancellable={true}>
    <div class="w-full h-full fixed flex items-center justify-center">
        <div class="bg-white rounded-md w-1/2 min-w-[200px] h-auto">
            Hello
            Lorem Ipsum
        </div>
    </div>
</Modal>

<h1 class="ml-10 mt-2 text-3xl">New Track</h1>


<div
    class={"absolute flex flex-col items-center justify-center w-full transition-opacity duration-300 " +
        (formState === 0 ? "opacity-100" : "opacity-0 pointer-events-none")}
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
        </div>


        <div class="w-full">
        {#each fileInputs as fileInput, i (fileInput)}
            <div class={i === fileInputs.length - 1 ? "sr-only" : "group relative flex items-center mb-2"}>
                <div class="relative">
                    <p class="absolute left-2 -top-1.5 bg-white px-1 font-bold text-[8px] text-gray-200">Layer {i + 1}</p>
                    <input class="text-xs px-4 py-1 border border-gray-100"
                        bind:value={fileInput.layername}
                        type="text"
                        name="name"
                    />
                </div>


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
            class="bg-violet-700 text-white px-2 rounded-md border border-violet-600"
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
                errorMessages.length = 0;
                errorMessages = errorMessages;
                submitEl.click();
            }}
        >
            Next
        </button>
    </div>

</div>

<div class={"absolute w-full mt-4 transition-opacity duration-300 flex justify-center "
    + (formState === 1 ? "opacity-100" : "opacity-0 pointer-events-none")}>
    <button class="absolute left-2 flex-none" on:click={() => {formState = 0; testLoadAudioHandler(); onunload.invoke(); }}>
        <Icon class="inline" size="14" src="{ArrowSmallLeft}" /> Back
    </button>
    <div class="w-3/4">

        <!-- options -->
        <table>
            <tbody>
                <tr>
                    <td class="p-1">
                        <label for="show-markers-input" class="block text-xs font-bold select-none">
                            Show Markers
                        </label>
                    </td>
                    <td>
                        <Switch id="show-markers-input" bind:enabled={showMarkers} description="Option whether to show audio markers to end viewer." />
                    </td>
                    <td class="p-1">
                        <label for="is-looping-input" class="ml-4 block text-xs font-bold select-none">
                            Looping
                        </label>
                    </td>
                    <td>
                        <Switch id="is-looping-input" bind:enabled={looping} description="Option whether to set track to looping"/>
                    </td>
                </tr>
            </tbody>
        </table>
        <AudioPlayer onload={onload} onunload={onunload}
            mixPresets={mixPresets}
            showMarkers={showMarkers}
            looping={looping}
            transitionTime={transitionTime}
            retrieveMix={retrieveMix}
        />

        <div class="flex justify-between">
            <div class="flex">
                <h2 class="text-xl mr-4">Mix Presets</h2>
                <button on:click={() => {
                    showAddMixModal = true;
                }}
                >Add Mix <Icon class="inline" src="{PlusCircle}" size="16" /></button>
            </div>

            <tr>
                <td class="p-1">
                    <label for="transition-time" class="block text-xs font-bold">
                        Transition Time (s)
                    </label>
                </td>
                <td>
                    <input id="transition-time" type="number" min="0" max="10" step=".1" bind:value={transitionTime} class="pl-2 border border-gray-100"/>
                </td>
            </tr>
        </div>

        <h2 class="text-xl mb-3 ml-2">Script</h2>
        <TextEditor
            onRequestText={onRequestText}
            onSave={()=> console.log("saved.")}
            value={defaultScript}
        />

        <button type="button" class="block mx-auto mt-4 px-2 py-1 bg-violet-700 text-white rounded-md">Submit</button>
    </div>

</div>

