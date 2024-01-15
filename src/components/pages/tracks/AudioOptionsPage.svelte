<script lang="ts">
    import { getContext } from "svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";
    import type { EditorView } from "codemirror";
    import type { MixPreset } from "audio/MixPresetMgr";
    import AudioPlayer from "app/components/AudioPlayer/AudioPlayer.svelte";
    import Switch from "app/components/widgets/Switch.svelte";

    const audio = getContext("audio");

    // ===== Element bindings =================================================
    let textEditorView: EditorView;

    // ===== User callbacks ===================================================
    export let audioContext: AudioPlayerExternalControls;

    export let onsubmit: (data: AudioSubmissionData) => void = () => {};

    export let defaultScript: string = "";

    // ===== Options ==========================================================
    export let show: boolean = true;
    let mixPresets: MixPreset[] = [];
    let showMarkers: boolean = true;
    let looping: boolean = true;
    let transitionTime: number = 1;


    function handleSubmit()
    {
        onsubmit({
            looping,
            mixPresets,
            script: textEditorView.state.doc.toString(),
            showMarkers,
            transitionTime,
        });
    }

</script>

<!-- Modals -->



<!-- Outer container -->
<div class={"absolute w-full mt-4 transition-opacity duration-300 flex justify-center "
    + (show ? "opacity-100" : "opacity-0 pointer-events-none")}>

    <!-- Inner container -->
    <div class="sm:w-5/6 w-full p-4">

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

        <!-- Audio player + mix console -->
        {#if $audio}
            <AudioPlayer
                audio={$audio}
                looping={looping}
                mixPresets={mixPresets}
                showMarkers={showMarkers}
                transitionTime={transitionTime}
                bind:context={audioContext}
            />
        {/if}

        <!-- Script Editor -->
        <h2 class="text-xl mb-3 ml-2">Script</h2>
        <TextEditor
            bind:view={textEditorView}
            onSave={()=> console.log("saved.")}
            value={defaultScript}
        />

        <!-- Submit Button -->
        <button type="button" class="block mx-auto mt-4 px-2 py-1 bg-violet-700 text-white rounded-md"
            on:click={handleSubmit}
        >
            Submit
        </button>
    </div>

</div>
