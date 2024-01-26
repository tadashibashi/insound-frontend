<script lang="ts">
    import {
        ArrowSmallLeft, Icon
    } from "svelte-hero-icons";

    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";
    import { SoundLoadError } from "audio/SoundLoadError";
    import LoadAudioPage from "./LoadAudioPage.svelte";
    import AudioOptionsPage from "./AudioOptionsPage.svelte";
    import type { MultiTrackControl } from "audio/MultiTrackControl";

    enum FormState {
        LoadFiles = 0,
        AudioOptions = 1,
    }

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

    // ===== Form state =======================================================

    // bound to LoadAudioPage fileInputs in order to set errors on load
    let fileInputs: InputData[];

    // state tracker, shows different parts of the form when set
    // 0: file loader
    // 1: options + audio previewer
    let formState: FormState = FormState.LoadFiles;

    let track: MultiTrackControl;

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

    async function onLoadAudio(files: File[], channels: AudioChannel[])
    {
        if (files.length === 0)
        {
            errorTitle = "No audio files loaded";
            errorMessages = ["Please upload a valid audio file"];
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

        const errInfo: {index: number, reason: string}[] = [];
        for (let i = 0; i < buffers.length; ++i)
        {
            if (buffers[i] === null) errInfo.push({
                index: i,
                reason: "not a file"
            });
        }


        try {
            if (errInfo.length > 0)
            {
                throw new SoundLoadError(errInfo);
            }
            audioContext.load(buffers as ArrayBuffer[], channels, defaultScript);

            // success, progress the form state
            formState = FormState.AudioOptions;
        }
        catch(err)
        {
            if (err instanceof SoundLoadError)
            {
                errorTitle = "File Loading Error";
                for (let i = 0; i < err.info.length; ++i)
                {
                    const fileIndex = err.info[i].index;
                    errorMessages.push(`${fileInputs[fileIndex].filepath}: ${err.info[i].reason}`);
                    const input = fileInputs[fileIndex];
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
    bind:fileInputs={fileInputs}
    track={track}
/>

<AudioOptionsPage
    show={formState === FormState.AudioOptions}
    defaultScript={defaultScript}
    onsubmit={ (data) => { console.log("submitted data:", data);} }
    bind:audioContext={audioContext}
    bind:track={track}
/>

