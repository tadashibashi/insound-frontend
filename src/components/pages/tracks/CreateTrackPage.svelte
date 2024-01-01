<script lang="ts">
    import {
        ArrowSmallLeft, Icon
    } from "svelte-hero-icons";

    import { Transition } from "@rgossiaux/svelte-headlessui";
    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";
    import { SoundLoadError } from "app/audio/src/ts/AudioEngine";
    import LoadAudioPage from "./LoadAudioPage.svelte";
    import AudioOptionsPage from "./AudioOptionsPage.svelte";

    enum FormState {
        LoadFiles = 0,
        AudioOptions = 1,
    }

    // ===== Form state =======================================================

    // bound to LoadAudioPage fileInputs in order to set errors on load
    let fileInputs: InputData[];

    // state tracker, shows different parts of the form when set
    // 0: file loader
    // 1: options + audio previewer
    let formState: FormState = FormState.LoadFiles;

    // ===== Error messages ===================================================

    let errorTitle = "";
    let errorMessages: string[] = [];
    $: showErrors = errorMessages.length > 0;

    let audioContext: AudioPlayerExternalControls;

    // ===== Event handlers ===================================================

    async function onLoadAudio(files: File[])
    {
        if (files.length === 0) throw Error("No audio files");

        const promises: Promise<ArrayBuffer>[] = [];
        for (let i = 0; i < files.length; ++i)
        {
            promises.push(files[i].arrayBuffer());
        }

        let buffers: ArrayBuffer[];
        try {
            buffers = await Promise.all(promises)
        }
        catch(err)
        {
            errorTitle = "An error occurred while processing files"
            errorMessages.push("Conversion from File to ArrayBuffer failed.");
            return;
        }

        const names = fileInputs.map(input => input.layername);
         // remove last one, since it's a dummy input waiting for user input
        names.pop();

        try {
            audioContext.load(buffers, names, "");
        }
        catch(err)
        {
            if (err instanceof SoundLoadError)
            {
                errorTitle = "Audio engine failed to accept the following";
                const fileNames = err.getErrorMessage(names);
                for (let i = 0; i < fileNames.length; ++i)
                {
                    errorMessages.push(`Layer ${err.soundIndices[i] + 1}: ${fileNames[i]}`);
                    const input = fileInputs[err.soundIndices[i]];
                    if (input)
                    {
                        input.isProblematic = true;
                    }
                }
                fileInputs = fileInputs;
            }
            else if (err instanceof Error)
            {
                errorTitle = "An unexpected error occured while loading the " +
                    "audio files";
                errorMessages.push(err.message);
            }
            errorMessages = errorMessages;
            return false;
        }

        // success, progress the form state
        formState = FormState.AudioOptions;
    }

</script>

<!-- Header -->
<h1 class="ml-10 mt-2 text-3xl select-none">New Track</h1>

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
    <ErrorAlert title={errorTitle} errorList={errorMessages} oncancel={() => showErrors = false}/>
</Transition>

<!-- Back Button -->
{#if formState > 0}
<button class="absolute left-2 flex-none rounded-full hover:bg-gray-100 px-3 py-1 transition-colors duration-300"
    on:click={() => {
        if (formState === FormState.AudioOptions)
        {
            audioContext.unload();
        }

        --formState;
    }}
>
    <Icon class="inline" size="14" src="{ArrowSmallLeft}" /> Back
</button>
{/if}

<LoadAudioPage
    show={formState === FormState.LoadFiles}
    onsubmit={onLoadAudio}
    bind:fileInputs={fileInputs} />

<AudioOptionsPage
    show={formState === FormState.AudioOptions}
    onsubmit={ (data) => { console.log("submitted data:", data);} }
    bind:audioContext={audioContext} />

