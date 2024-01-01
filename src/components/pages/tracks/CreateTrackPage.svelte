<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { Result } from "app/util/api/Result";
    import {
        ArrowDownTray, ArrowRight, ArrowSmallLeft, ArrowUpTray, EllipsisVertical, ExclamationCircle, Icon,
        MusicalNote, PlusCircle, XCircle, XMark
    } from "svelte-hero-icons";
    import { Delegate } from "app/util/delegate";
    import AudioPlayer from "app/components/AudioPlayer.svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";

    import { Transition } from "@rgossiaux/svelte-headlessui";
    import type { MixPreset } from "app/util/MixPreset";
    import ErrorAlert from "app/components/widgets/ErrorAlert.svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import Modal from "app/components/Modal.svelte";
    import { getContext } from "svelte";
    import { SoundLoadError } from "app/audio/src/ts/AudioEngine";
    import LoadAudioPage from "./LoadAudioPage.svelte";

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

    let audio = getContext("audio");

    const onload = new Delegate<void, [ArrayBuffer | ArrayBuffer[], string[],
        string]>;
    const onunload = new Delegate<void, []>;
    const onRequestText = new Delegate<string, []>;
    const retrieveMix = new Delegate<MixPreset, []>;

    let errorTitle = "";
    let errorMessages: string[] = [];
    $: showErrors = errorMessages.length > 0;

    async function onLoadAudio(files: File[])
    {
        if (!files.length)
            throw Error("No audio files");

        const promises: Promise<ArrayBuffer>[] = [];
        for (let i = 0; i < files.length; ++i)
        {
            promises.push(files[i].arrayBuffer());
        }

        try {
            const result = await Promise.all(promises)
            loadAudio(new Result(result));
        }
        catch(err)
        {
            loadAudio(new Result([], err));
        }
    }

    function loadAudio(payload: Result<ArrayBuffer[], unknown>)
    {

        if (!payload.ok)
        {
            errorMessages.push(payload.error?.toString() ||
                "Application error: problem occurred while processing audio files.");
            return false;
        }

        const buffers = payload.result;

        let text = "";
        const names = fileInputs.map(input => input.layername);
        names.pop(); // remove last one, since it's a dummy input waiting for user input
        if (onRequestText.handleCount)
        {
            text = onRequestText.invoke();
        }

        try {
            onload.invoke(buffers, names, text);
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
                errorTitle = "An unexpected problem occured while loading the audio files";
                errorMessages.push(err.message);
            }
            errorMessages = errorMessages;
            return false;
        }

        // success, progress the form state
        formState = FormState.AudioOptions;
        return true;
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

<LoadAudioPage bind:fileInputs={fileInputs} onsubmit={onLoadAudio} show={formState === FormState.LoadFiles} />

<!-- FormState.AudioOptions -->
<div class={"absolute w-full mt-4 transition-opacity duration-300 flex justify-center "
    + (formState === 1 ? "opacity-100" : "opacity-0 pointer-events-none")}>



    <!-- Back Button -->
    <button class="absolute left-2 flex-none rounded-full hover:bg-gray-100 px-3 py-1 transition-colors duration-300"
        on:click={() => {
            onunload.tryInvoke();
            formState = FormState.LoadFiles;
        }}
    >
        <Icon class="inline" size="14" src="{ArrowSmallLeft}" /> Back
    </button>

    <!-- AudioOptions main container -->
    <div class="w-3/4">

        <!-- Options -->
        <table>
            <tbody>
                <tr>
                     <!-- Show Markers -->
                    <td class="p-1">
                        <label for="show-markers-input" class="block text-xs font-bold select-none">
                            Show Markers
                        </label>
                    </td>
                    <td>
                        <Switch id="show-markers-input" bind:enabled={showMarkers} description="Option whether to show audio markers to end viewer." />
                    </td>

                    <!-- Looping -->
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
        {#if $audio}
        <AudioPlayer
            audio={$audio}
            onload={onload} onunload={onunload}
            mixPresets={mixPresets}
            showMarkers={showMarkers}
            looping={looping}
            transitionTime={transitionTime}
            retrieveMix={retrieveMix}
        />
        {/if}

        <!-- Mix Presets -->
        <div class="flex justify-between">
            <!-- Title -->
            <div class="flex">
                <h2 class="text-xl mr-4">Mix Presets</h2>
                <button on:click={() => {
                    showAddMixModal = true;
                }}
                >Save Mix <Icon class="inline" src="{PlusCircle}" size="16" /></button>
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

