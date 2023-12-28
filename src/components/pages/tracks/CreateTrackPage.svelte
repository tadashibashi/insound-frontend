<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import { ArrowDownTray, ArrowSmallLeft, ArrowUpTray, Icon, MusicalNote, PlusCircle, XMark } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    import { Transition } from "@rgossiaux/svelte-headlessui";
    import type { MixPreset } from "app/audio/src/ts/MixPresetMgr";
    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import Modal from "app/components/Modal.svelte";
    import { util } from "app/util";
    import { afterUpdate } from "svelte";

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

    let dropZoneDraggedOver = false;

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

    let newFiles: File[] = [];
    let newFileInsertPosition: number = 0;

    // Apply new files to the last file inputs (created and pushed by the drop event)
    afterUpdate(() => {
        const newFileCount = newFiles.length;

        if (newFileCount > 0)
        {
            if (fileInputs.length < newFileCount)
            {
                throw Error("Internal error, something went wrong while processing file drag");
            }

            for (let i = 0; i < newFileCount; ++i)
            {
                const fileInput = fileInputs[newFileInsertPosition + i];
                const input = fileInput.input;
                if (!input) continue;

                const dt = new DataTransfer();
                dt.items.add(newFiles[i]);
                input.files = dt.files;
                fileInput.filepath = newFiles[i].name;
                fileInput.layername = util.fileNameToLabelName(newFiles[i].name);
            }

            newFiles.length = 0;
        }
    });

    let submitEl: HTMLButtonElement;

    const onload = new Delegate<void, [ArrayBuffer | ArrayBuffer[], string[],
        string]>;
    const onunload = new Delegate<void, []>;
    const onRequestText = new Delegate<string, []>;

    const retrieveMix = new Delegate<number[], []>;

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

        fileInputs.push({
            filepath: "",
            input: undefined,
            layername: "Layer " + (fileInputs.length + 1)
        });
    }

    function handleFileChange(fileInput: InputData, index: number)
    {
        const input = fileInput.input;
        if (!input) return;

        if (!input.files)
        {
            fileInput.filepath = "";
            fileInput.layername = "";
            return;
        }

        const numFiles = input.files.length;
        for (let i = 0; i < numFiles; ++i)
        {
            if (i > 0)
            {
                // push new input, add data to queue to be added after render
                const name = input.files[i].name;
                const newFileInput = {
                    input: undefined,
                    filepath: "",
                    layername: "",
                };

                // add new file input
                if (index + i >= fileInputs.length)
                    fileInputs.push(newFileInput);
                else
                    fileInputs.splice(index + i, 0, newFileInput);

                // add new file to the queue (to be inserted after render)
                newFiles.push(input.files[i]);
            }
            else
            {
                // alter current data
                const name = input.files[i].name;
                fileInput.filepath = name;
                fileInput.layername = util.fileNameToLabelName(name);
            }
        }

        if (numFiles > 1)
        {
            // new files need to be inserted on new file inputs, indicate
            // the index at which to begin inserting
            newFileInsertPosition = index + 1;

            // since multiple files were input, we only need the first one on
            // the original input element
            const dt = new DataTransfer();
            dt.items.add(input.files.item(0) as File);

            input.files = dt.files;
        }

        // update fileInputs (assumes fileInput is in the list)
        fileInputs = fileInputs;
    }

    function handleDropFile(evt: DragEvent, fileInput: InputData)
    {
        evt.preventDefault();

        const target = fileInput.input;
        if (!target || !evt.dataTransfer || !evt.dataTransfer.files.length) return;

        const dropFileCount = evt.dataTransfer.files.length;

        for (let i = 0; i < dropFileCount; ++i)
        {
            fileInputs.push({
                filepath: "",
                input: undefined,
                layername: "Layer " + (fileInputs.length + 1)
            });

            newFiles.push(evt.dataTransfer.files.item(i) as File);
        }

        newFileInsertPosition = fileInputs.length - dropFileCount - 1;
        newFiles = newFiles;
        fileInputs = fileInputs;

        dropZoneDraggedOver = false;
    }


</script>

<!-- Modals -->
<Modal bind:show={showAddMixModal} isCancellable={true}>
    <div class="w-full h-full fixed flex items-center justify-center">
        <div class="bg-white rounded-md w-1/2 min-w-[200px] h-auto">
            Hello
            Lorem Ipsum
        </div>
    </div>
</Modal>

<!-- Header -->
<h1 class="ml-10 mt-2 text-3xl">New Track</h1>


<!-- Form State 0: Audio file selection -->
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


    <div class="w-full h-12 mb-2">
        <p class="text-2xl text-center text-gray-500">Sound Layers</p>
    </div>

    <!-- Audio file selection boxes -->
    <Form
        class="max-w-[512px] mx-auto mb-2 rounded-md"
        action={testLoadAudioHandler}
        method="POST" onThen={testLoadAudioHandlerHandler}
        >

        <div class={fileInputs.length <= 1 ? "sr-only" : "w-full p-2"}>
        {#each fileInputs as fileInput, i (fileInput)}
            <div class={i === fileInputs.length - 1 ? "sr-only" : "group relative flex items-center mb-2"} draggable>
                <div class="relative">
                    <p class="absolute left-2 -top-1.5 bg-white px-1 font-bold text-[8px] text-gray-200">Layer {i + 1}</p>
                    <input class="text-xs px-4 py-1 border border-gray-100"
                        bind:value={fileInput.layername}
                        type="text"
                        name="name"
                    />
                </div>


                <label class="text-xs font-bold select-none" for={"Layer_" + (i + 1)}>
                    <input
                        bind:this={fileInput.input}
                        on:change={(evt) => {
                            const target = evt.currentTarget;
                            if (!target || !target.files || !target.files.length) return;

                            if (i === fileInputs.length - 1)
                                handleNewFileChange(evt);

                            handleFileChange(fileInput, i);
                        }}
                        class="sr-only"
                        id={"Layer_" + (i + 1)}
                        name={"Layer " + (i+1)}
                        type="file"
                        multiple
                    />

                    {#if !fileInput.filepath}
                        <div class="inline border border-gray-200 rounded-md p-1 cursor-pointer select-none"><Icon class="inline-block mr-1" src="{ArrowUpTray}" mini solid size="16" />
                            Upload audio
                        </div>
                    {:else}
                        <div class="inline-flex justify-center items-center">
                            <div class="flex items-center justify-center">
                                <div class="border-t border border-gray-200 w-4"></div>
                            </div>
                            <div class="inline-flex rounded border border-gray-100 shadow-sm">

                                <div class="inline-flex justify-center items-center w-6 aspect-square bg-violet-100">
                                    <Icon class="inline rounded-md p-1 drop-shadow-sm" src="{MusicalNote}" />
                                </div>
                                <div class="border-l inline-flex items-center">
                                    <p class="mx-1 text-xs font-mono font-medium">{fileInput.filepath}</p>
                                </div>
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

        <!-- Add layer drop zone when no layers are visible -->
        {#if fileInputs.length === 1}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div  class="relative w-full flex flex-col items-center justify-center p-10 rounded-md min-w-[300px] border-dashed border-2 border-gray-200 text-gray-300 select-none cursor-default"
            on:dragenter={(evt)=>{evt.preventDefault(); dropZoneDraggedOver=true;}}
            on:dragover={(evt)=>evt.preventDefault()}
            on:drop={(evt) => handleDropFile(evt, fileInputs[0])}
        >
            <Icon class="block mb-2" src="{ArrowDownTray}" size="48" />
            <p class="text-center text-xs"><label for="Layer_1" class="cursor-pointer inline font-bold text-gray-400">Choose an audio file</label> or drag one here</p>

            {#if dropZoneDraggedOver}
            <div class="absolute w-full h-full rounded-md opacity-20 bg-gray-900"
                on:dragleave={(evt) => {evt.preventDefault(); dropZoneDraggedOver=false;}}
                on:dragover={(evt) => evt.preventDefault()}
            />
            {/if}
        </div>
        {/if}

        <button class="sr-only" bind:this={submitEl}></button>

    </Form>

    {#if fileInputs.length > 1}
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
    {/if}

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

        <!-- Player -->
        <AudioPlayer onload={onload} onunload={onunload}
            mixPresets={mixPresets}
            showMarkers={showMarkers}
            looping={looping}
            transitionTime={transitionTime}
            retrieveMix={retrieveMix}
        />

        <!-- Mix Presets -->
        <div class="flex justify-between">
            <!-- Title -->
            <div class="flex">
                <h2 class="text-xl mr-4">Mix Presets</h2>
                <button on:click={() => {
                    showAddMixModal = true;
                }}
                >Add Mix <Icon class="inline" src="{PlusCircle}" size="16" /></button>
            </div>

            <!-- Transition Time -->
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

        <!-- Script -->
        <h2 class="text-xl mb-3 ml-2">Script</h2>
        <TextEditor
            onRequestText={onRequestText}
            onSave={()=> console.log("saved.")}
            value={defaultScript}
        />

        <!-- Submit Button -->
        <button type="button" class="block mx-auto mt-4 px-2 py-1 bg-violet-700 text-white rounded-md">Submit</button>
    </div>

</div>

