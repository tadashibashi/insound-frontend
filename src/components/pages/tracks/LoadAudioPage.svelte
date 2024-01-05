<script lang="ts">
    import Dropzone from "app/components/widgets/Dropzone.svelte";
    import { util } from "app/util";
    import debounce from "app/util/debounce";
    import { afterUpdate, onMount } from "svelte";
    import { ArrowDownTray, ArrowRight, ArrowUpTray, ArrowUturnLeft,
        EllipsisVertical, ExclamationCircle, Icon, MusicalNote, XCircle, XMark
    } from "svelte-hero-icons";
    import DropFilesCard from "./DropFilesCard.svelte";

    // ===== User callbacks ===================================================
    export let onsubmit: (files: File[]) => void = () => {};

    // ===== State Variables ==================================================

    export let show: boolean = true;

    // Input rows data. Externally bindable.
    export let fileInputs: InputData[] = [createInputData()];

    $: submissionProblematic = fileInputs.some(input => input.isProblematic);

    // ----- UI State ---------------------------------------------------------

    // Temp file cached to work around Chrome's file-removing behavior
    let chromeFileCache: File | null = null;

    // New file queue to insert into newly created <input> elements.
    let newFileQueue: File[] = [];
    // Index to insert new files
    let newFileInsertPosition: number = 0;

    // Indicates which input is being dragged
    let draggingInput: InputData | null = null;
    // Y position where the mouse is currently dragging
    let draggingInputY: number = 0;

    let isDraggingOverDropzone = false;

    // ===== Callbacks ========================================================

    // Set-up and breakdown callbacks
    onMount(() => {
        document.addEventListener("drag",
            handleDraggingForDraggingInput);
        document.addEventListener("drop",
            handleDropForDraggingInput);
        window.addEventListener("dragend", handleDragEnd);

        return () => {
            document.removeEventListener("drag",
                handleDraggingForDraggingInput);
            document.removeEventListener("drop",
                handleDropForDraggingInput);
            window.removeEventListener("dragend", handleDragEnd);
        };
    });

    afterUpdate(() => {
        applyNewFileQueue();
    });

    // ----- Drag & Drop ------------------------------------------------------

    /** Called when mouse moves while drag-moving an input element */
    function handleDraggingForDraggingInput(evt: MouseEvent)
    {
        if (draggingInput && draggingInputY !== evt.y)
        {
            draggingInputY = evt.y;
        }
    }

    function handleDragEnd()
    {
        if (draggingInput)
        {
            draggingInput = null;
        }
    }

    /**
     * Handles "dropping" a dragged input. When a successful drop occurs, input
     * will be spliced from fileInputs array, and inserted to new position.
     */
    function handleDropForDraggingInput(evt: MouseEvent)
    {
        if (!draggingInput) return;

        if (!draggingInput.input)
        {
            draggingInput = null;
            return;
        }

        // find position to splice from
        const spliceFrom = fileInputs.findIndex(
            input => draggingInput === input);
        if (spliceFrom === -1) // position not found
        {
            draggingInput = null;
            return;
        }

        // find position to insert to
        let insertTo = spliceFrom;
        // length minus one - skip last input used invisibly to collect new files
        const length = fileInputs.length - 1;

        let wasSet = false;
        for (let i = 0; i < length; ++i)
        {
            const curInput = fileInputs[i].input;
            if (!curInput) continue;

            const checkRect = curInput.getBoundingClientRect();
            if (evt.y < checkRect.top + checkRect.height * .5)
            {
                insertTo = i <= spliceFrom ? i : Math.max(i-1, 0);
                wasSet = true;
                break;
            }
        }

        // check if y was past the last slot, if so, set it to last slot
        if (!wasSet)
        {
            insertTo = length - 1;
        }

        if (insertTo === spliceFrom) // same position, no need to mutate array
        {
            draggingInput = null;
            return;
        }

        // successfully got positions, perform op on array
        const temp = [...fileInputs];
        temp.splice(spliceFrom, 1);
        temp.splice(insertTo, 0, draggingInput);

        draggingInput = null;
        fileInputs = temp;
    }

    /** Handle dropped files over drop zone (when no inputs are visible) */
    function handleDroppedFiles(files: File[])
    {
        if (files.length === 0) return;
        const startPos = fileInputs.length - 1;

        for (let i = 0; i < files.length; ++i)
        {
            addInputSlot();
            newFileQueue.push(files[i]);
        }

        newFileInsertPosition = startPos;
        fileInputs = fileInputs;
    }

    function handleSubmit()
    {
        if (submissionProblematic) return;

        fileInputs.forEach(input => input.isProblematic = false);

        const files = collectFiles();
        onsubmit(files);

        fileInputs = fileInputs;
    }

    // ===== Helpers ==========================================================

    /** Create a default InputData object */
    function createInputData()
    {
        return {
            layername: "",
            filepath: "",
            input: undefined,
            isProblematic: false,
        }
    }

    /** Consolidate files from inputs */
    function collectFiles(): File[]
    {
        const files: File[] = [];
        const numInputs = fileInputs.length - 1;

        for (let i = 0; i < numInputs; ++i)
        {
            const input = fileInputs[i].input;
            if (!input || !input.files || !input.files.item(0))
                continue;
            files.push(input.files.item(0) as File);
        }

        return files;
    }

    /** Remove input slot from fileInputs array */
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

    /** Add a new blank input slot to the fileInputs array */
    function addInputSlot(index?: number)
    {
        if (index === undefined || index >= fileInputs.length)
            fileInputs.push(createInputData());
        else
            fileInputs.splice(index, 0, createInputData());
    }

    /** Handles file change of an input element (supports multiple files) */
    function changeFile(index: number)
    {
        const fileInput = fileInputs[index];
        if (!fileInput) return;

        const input = fileInput.input;
        if (!input || !input.files) return;

        // Work around undesirable Chrome behavior - cancel
        // causes current file to be dropped. If it was,
        // replace it with cached file
        if (input.value === "" && chromeFileCache)
        {
            const dt = new DataTransfer();
            dt.items.add(chromeFileCache);

            input.files = dt.files;
            return;
        }

        // visit each user-uploaded file
        const fileCount = input.files.length;
        for (let i = 0; i < fileCount; ++i)
        {
            if (i > 0) // when multi-file file
            {
                // prepare new input elements and new file queue
                addInputSlot(index + i);
                newFileQueue.push(input.files[i]);
            }
            else       // when first file
            {
                // update metadata in fileInput object
                const name = input.files[i].name;
                fileInput.filepath = name;
                fileInput.layername = util.fileNameToLabelName(name);
                fileInput.isProblematic = false;

                // if last input, add replacement invisible input at end
                if (index === fileInputs.length - 1)
                {
                    addInputSlot();
                }
            }
        }

        // Post-handle multi-file input
        if (fileCount > 1)
        {
            // insertions begin after target input element
            newFileInsertPosition = index + 1;

            // since multiple files were added, we only need the first one on
            // original input, others will be distributed to new input slots
            // via the newFileQueue
            const dt = new DataTransfer();
            dt.items.add(input.files.item(0) as File);
            input.files = dt.files;
        }

        // Indicate that we've mutated the fileInputs array
        fileInputs = fileInputs;
    }

    /** Auto-called during afterUpdate to apply any changes of newFileQueue */
    function applyNewFileQueue()
    {
        const newFileCount = newFileQueue.length;

        if (newFileCount === 0) return;

        if (fileInputs.length < newFileInsertPosition + newFileCount)
        {
            throw Error("Internal error, cannot apply file changes due " +
                "to insufficient number of file input elements");
        }

        // visit each file in the queue
        for (let i = 0; i < newFileCount; ++i)
        {
            const fileInput = fileInputs[newFileInsertPosition + i];
            if (!fileInput)
            {
                throw Error("Internal error, missing InputData object to " +
                    "attach new file to.");
            }

            const input = fileInput.input;
            if (!input)
            {
                throw Error("Internal error, missing input element to " +
                    "attach new file to.");
            }

            // apply new file to the input element, set name
            const newFile = newFileQueue[i];
            const dt = new DataTransfer();
            dt.items.add(newFile);

            input.files = dt.files;
            fileInput.filepath = newFile.name;
            fileInput.layername = util.fileNameToLabelName(newFile.name);
            fileInput.isProblematic = false;
        }

        // done handling new files, clear the queue
        newFileQueue.length = 0;
    }

    function resetFiles()
    {
        fileInputs = [createInputData()];
        newFileQueue.length = 0;

        fileInputs = fileInputs;
    }

</script>

<div
    class={"absolute flex flex-col items-center justify-center w-full transition-opacity duration-300 select-none " +
        (show ? "opacity-100" : "opacity-0 pointer-events-none") + " " +
        (draggingInput ? "cursor-move" : "")}
>
    <div class="w-full h-12 mb-2">
        <p class="text-2xl text-center text-gray-500 selection-none">Sound Layers</p>
    </div>

    <div class="w-2/3 h-8 relative">
        <button on:click={() => resetFiles()} class={"text-gray-400 hover:bg-gray-100 text-sm hover:text-gray-500 transition-colors duration-200 py-1 px-2 rounded-full absolute right-0 " +
            (fileInputs.length > 1 ? "" : "sr-only pointer-events-none")}>
            Reset <Icon class="inline -translate-y-[2px]" src={ArrowUturnLeft} size="16" />
        </button>
    </div>


    <!-- Audio file selection boxes -->
    <div class="max-w-[512px] mx-auto mb-2 rounded-md selection-none">

        <Dropzone class={(fileInputs.length <= 1 ? "sr-only" : "") + " relative w-full h-full"}
            onfiles={handleDroppedFiles}
            bind:isdraggedover={isDraggingOverDropzone}
            active={fileInputs.length > 1 && !draggingInput}
            >

            <div slot="normal" class="p-2">
            {#each fileInputs as fileInput, i (fileInput)}

                 <!-- Drag target indicater line -->
                {#if draggingInput && draggingInput !== fileInput && draggingInput !== fileInputs[i-1] &&
                    fileInput.input && draggingInputY < fileInput.input.getBoundingClientRect().y + fileInput.input.getBoundingClientRect().height*.5 &&
                    draggingInputY > fileInput.input.getBoundingClientRect().y - fileInput.input.getBoundingClientRect().height*.5 }
                    <div class="absolute w-full border border-blue-500 rounded-full -translate-y-1"></div>
                {/if}

                <!-- Individual file input row -->
                <div class={i === fileInputs.length - 1 ? "sr-only" : ("group relative flex items-center mb-2 select-none p-1 rounded-full " + (draggingInput === fileInput ? "bg-gray-100 opacity-50" : ""))} draggable={draggingInput === fileInput}>

                    <!-- Layer grab point icon -->
                    <div class="inline w-[24px] h-[24px]">
                        {#if fileInputs.length > 2}
                        <button class={"flex group-hover:opacity-100 text-gray-400 " + (draggingInput === fileInput ? "opacity-100 cursor-grabbing" : "opacity-0 cursor-grab")}
                            type="button"
                            on:pointerdown={(evt)=> {
                                draggingInput = fileInput;
                                draggingInputY = evt.y;
                            }}
                            on:pointerup={(evt) => {
                                draggingInput = null;
                            }}
                            >
                            {#if !draggingInput || draggingInput === fileInput}
                            <Icon src="{EllipsisVertical}" class="-mr-4" />
                            <Icon src="{EllipsisVertical}" />
                            {/if}
                        </button>
                        {/if}
                    </div>


                    <!-- Layer name -->
                    <div class="relative">
                        <!-- Error circle -->
                        {#if fileInput.isProblematic}
                        <Icon src="{ExclamationCircle}" class="absolute top-0 left-[3px] w-3 text-red-500" />
                        {/if}

                        <!-- Inset layer title border -->
                        <p class={"absolute left-[7px] -top-[7px] px-1 font-bold text-[8px] border rounded " +
                            (fileInput.isProblematic ? "border-red-400" : "border-gray-100")} >
                            Layer {i + 1}
                        </p>

                        <!-- Layer name input -->
                        <input class={"relative text-xs px-5 py-1 border " +
                            (fileInput.isProblematic ? "border-red-400": "border-gray-100")}
                            bind:value={fileInput.layername}
                            type="text"
                            name="name"
                        />

                        <!-- Inset layer title -->
                        <p class={"absolute left-2 -top-1.5 bg-white px-1 font-bold text-[8px] rounded " +
                            (fileInput.isProblematic ? "text-red-400" : "text-gray-200")}>
                            Layer {i + 1}
                        </p>
                    </div>

                    <!-- Input element -->
                    <label class="text-xs font-bold select-none h-full cursor-pointer" for={"Layer_" + (i + 1)}>
                        <input
                            bind:this={fileInput.input}
                            on:change={() => changeFile(i)}
                            on:click={() => chromeFileCache = fileInput.input?.files?.item(0) || null}
                            class="sr-only absolute h-full"
                            id={"Layer_" + (i + 1)}
                            name={"Layer " + (i+1)}
                            type="file"
                            accept="audio/*"
                            multiple
                        />

                        {#if !fileInput.filepath}
                            <div class="inline border border-gray-200 rounded-md p-1 cursor-pointer select-none"><Icon class="inline-block mr-1" src="{ArrowUpTray}" mini solid size="16" />
                                Upload audio
                            </div>
                        {:else}
                            <div class="inline-flex justify-center items-center">
                                <!-- Connecting line (for style) -->
                                <div class="flex items-center justify-center">
                                    <div class={"border-t border w-4 " +
                                        (fileInput.isProblematic ? "border-red-400" : "border-gray-200")}></div>
                                </div>

                                <div class={"inline-flex rounded border shadow-sm " +
                                    (fileInput.isProblematic ? "border-red-400" : "border-gray-200")}>

                                    {#if !fileInput.isProblematic}
                                    <div class="inline-flex justify-center items-center w-6 aspect-square bg-violet-100">
                                        <Icon class="inline rounded-md p-1 drop-shadow-sm" src="{MusicalNote}" />
                                    </div>
                                    {:else}
                                    <div class="inline-flex justify-center items-center w-6 aspect-square bg-red-100">
                                        <Icon class="inline text-red-400 rounded-md p-1 drop-shadow-sm" solid src="{XCircle}" />
                                    </div>
                                    {/if}

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
                        class={"rounded border bg-red-300 border-red-300 ml-2 opacity-0 " +
                            (draggingInput ? "group-hover:opacity-0" : "group-hover:opacity-100")}
                        type="button"
                        on:click={() => removeInputSlot(i)}
                    >
                        <Icon class="text-white" src="{XMark}" size="16"/>
                    </button>
                    {/if}
                </div>

                 <!-- Drag target indicater line at end -->
                {#if draggingInput && i === fileInputs.length - 2 &&
                    fileInput !== draggingInput && fileInput.input &&
                    draggingInputY > fileInput.input.getBoundingClientRect().y + fileInput.input.getBoundingClientRect().height * .5}
                    <div class="absolute w-full border border-blue-500 rounded-full -translate-y-1"></div>
                {/if}

                {#if i === fileInputs.length-1 && fileInputs.length > 1}
                    <label for={"Layer_" + (i + 1)}
                        class="mt-4 w-full border-t-2 border-gray-50 transition-colors duration-500 rounded-b-md bg-white hover:bg-gray-50 flex justify-center text-gray-400 hover:text-gray-500 cursor-pointer"
                    >
                        <p class="text-lg font-bold">+</p>
                    </label>
                {/if}
            {/each}
            </div>

            <div slot="dragover" class="box-content w-full h-full rounded-md text-gray-300">
                <DropFilesCard />
            </div>
        </Dropzone>

        <!-- Show drop zone when no layers are visible -->
        {#if fileInputs.length === 1}
            <Dropzone onfiles={handleDroppedFiles}>
                <label for="Layer_1" slot="normal" class="flex flex-col items-center px-10 py-16 cursor-pointer">
                    <Icon class="block mb-2" src="{ArrowDownTray}" size="48" />
                    <p class="text-center text-xs"><label for="Layer_1" class="cursor-pointer inline font-bold text-gray-400">Choose audio files</label> or drag them here</p>
                </label>
                <div slot="dragover" class="box-content w-full h-full rounded-md text-gray-300">
                    <DropFilesCard />
            </Dropzone>
        {/if}
    </div>

    <!-- Submit button -->
    {#if fileInputs.length > 1}
    <div class={"w-full flex justify-center mt-3 " + (isDraggingOverDropzone ? "sr-only" : "")}>
        <button
            class={"px-3 py-1 rounded-full border  transition-colors " +
                (submissionProblematic ? "bg-gray-100 border-gray-50 text-gray-50 cursor-not-allowed" : "bg-violet-400 border-violet-500 animate-pulse text-white cursor-pointer")}
            on:click={debounce(handleSubmit, 1000)}
        >
            Next
            <Icon src={ArrowRight} size="16" class="inline ml-[1px] pb-[1px]" />
        </button>
    </div>
    {/if}
</div>
