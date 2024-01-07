<script lang="ts">
    import {
        ArrowSmallLeft, Icon
    } from "svelte-hero-icons";

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
    $: if (fileInputs && !fileInputs.some(input => input.isProblematic))
    {
        errorTitle = "";
        errorMessages = [];
    }

    let audioContext: AudioPlayerExternalControls;

    // ===== Event handlers ===================================================

    async function onLoadAudio(files: File[])
    {
        if (files.length === 0)
        {
            errorTitle = "No audio files loaded";
            errorMessages = ["Please upload a valid audio file"]
            return;
        }

        const promises: Promise<ArrayBuffer | null>[] = [];
        for (let i = 0; i < files.length; ++i)
        {
            promises.push(
                new Promise((resolve, reject) => {
                        files[i].arrayBuffer()
                            .then(resolve)
                            .catch(err => resolve(null))
                    })
                );
        }

        let buffers = await Promise.all(promises);

        const errIndices: number[] = [];
        for (let i = 0; i < buffers.length; ++i)
        {
            if (buffers[i] === null) errIndices.push(i);
        }

        const names = fileInputs.map(input => input.layername);
         // remove last one, since it's a dummy input waiting for user input
        names.pop();

        try {
            if (errIndices.length > 0)
            {
                throw new SoundLoadError(errIndices);
            }
            audioContext.load(buffers as ArrayBuffer[], names, "");
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
        }

        // success, progress the form state
        formState = FormState.AudioOptions;
    }

</script>

<!-- Header -->
<h1 class="ml-10 mt-2 text-3xl select-none">New Track</h1>

<!-- Error message box -->
<div class={"flex flex-col items-center justify-center w-full " + (errorTitle || errorMessages.length > 0 ? "" : "sr-only")}>
    <ErrorAlert title={errorTitle} errorList={errorMessages} oncancel={() => { errorTitle = ""; errorMessages = []; } }/>
</div>


<!-- Back Button -->
{#if formState > 0}
<button class="absolute z-10 left-2 flex-none rounded-full hover:bg-gray-100 px-3 py-1 transition-colors duration-300"
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

