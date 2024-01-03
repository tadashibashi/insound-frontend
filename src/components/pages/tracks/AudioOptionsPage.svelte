<script lang="ts">
    import { getContext } from "svelte";
    import TextEditor from "app/components/TextEditor/TextEditor.svelte";
    import type { EditorView } from "codemirror";
    import type { MixPreset } from "app/util/MixPreset";
    import AudioPlayer from "app/components/AudioPlayer/AudioPlayer.svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import { AdjustmentsVertical, Icon, PlusCircle, XMark } from "svelte-hero-icons";
    import Modal from "app/components/Modal.svelte";

    const audio = getContext("audio");

    // ===== Element bindings =================================================
    let textEditorView: EditorView;

    // ===== User callbacks ===================================================
    export let audioContext: AudioPlayerExternalControls;

    export let onsubmit: (data: AudioSubmissionData) => void = () => {};

    // ===== Options ==========================================================
    export let show: boolean = true;
    let mixPresets: MixPreset[] = [];
    let showMarkers: boolean = true;
    let looping: boolean = true;
    let transitionTime: number = 1;

    let showAddMixModal = false;

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
    let mixName: string = "";

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

    function saveMix()
    {
        if (mixName.length === 0) return;

        mixPresets.push(audioContext.getCurrentMix(mixName));
        mixPresets = mixPresets;
        showAddMixModal = false;
    }

</script>

<!-- Modals -->

<!-- Add mix modal -->
<Modal bind:show={showAddMixModal} isCancellable={true} onopen={() => mixName = ""}>
    <div class="w-full h-full fixed flex items-center justify-center">

        <div class="relative bg-white rounded-md w-1/2 min-w-[200px] h-auto pt-4 pb-4">
            <!-- cancel button -->
            <button class="absolute top-1 right-1 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-400 p-1" on:click={() => showAddMixModal = false }>
                <Icon src={XMark} size="24" />
            </button>

            <Icon class="block text-center mx-auto text-gray-400 mb-1" src={AdjustmentsVertical} size="48" />
            <p class="text-center text-lg mb-1">Save Mix Preset</p>
            <label class="w-full block ml-4">
                <p class="inline mr-2 text-gray-400">Name</p>
                <input class="px-2 border border-gray-100" type="text" bind:value={mixName} minlength="1" />
            </label>

            <button
                on:click={saveMix}
                class={"block mx-auto rounded-full mt-4 mb-2 px-4 py-2 " + (mixName.length > 0 ? "bg-violet-400 text-white cursor-pointer" : "bg-gray-100 text-gray-50 cursor-not-allowed")}>
                Add Mix
            </button>
        </div>
    </div>
</Modal>

<!-- Outer container -->
<div class={"absolute w-full mt-4 transition-opacity duration-300 flex justify-center "
    + (show ? "opacity-100" : "opacity-0 pointer-events-none")}>

    <!-- Inner container -->
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

        <!-- Mix Presets -->
        <div class="flex justify-between">
            <!-- title -->
            <div class="flex">
                <h2 class="text-xl mr-4">Mix Presets</h2>
                <button on:click={() => {
                    showAddMixModal = true;
                }}
                >Save Mix <Icon class="inline" src="{PlusCircle}" size="16" /></button>
            </div>

            <!-- transition Time -->
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
