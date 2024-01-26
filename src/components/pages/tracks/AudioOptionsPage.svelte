<script lang="ts">
    import { getContext } from "svelte";
    import AudioPlayer from "app/components/AudioPlayer/AudioPlayer.svelte";
    import type { TextEditorMgr } from "app/util/TextEditorMgr";
    import type { MultiTrackControl } from "audio/MultiTrackControl";

    const audio = getContext("audio");

    // ===== Element bindings =================================================
    let textEditor: TextEditorMgr;

    // ===== User callbacks ===================================================
    export let audioContext: AudioPlayerExternalControls;
    export let track: MultiTrackControl;

    export let onsubmit: (data: AudioSubmissionData) => void = () => {};

    export let defaultScript: string = "";

    // ===== Options ==========================================================
    export let show: boolean = true;
    let showMarkers: boolean = true;
    let looping: boolean = true;
    let transitionTime: number = 1;


    function handleSubmit()
    {
        onsubmit({
            looping,
            mixPresets: track.mixPresets,
            script: textEditor.text,
            showMarkers,
            transitionTime,
        });
    }

</script>

<!-- Outer container -->
<div class={"absolute w-full mt-4 transition-opacity duration-300 flex justify-center bg-transparent "
    + (show ? "opacity-100" : "opacity-0 pointer-events-none")}>

    <!-- Inner container -->
    <div class="sm:w-5/6 w-full h-full p-4">

        <!-- Audio player + mix console -->
        {#if $audio}
            <AudioPlayer
                audio={$audio}
                bind:looping={looping}
                bind:showMarkers={showMarkers}
                transitionTime={transitionTime}
                defaultScript={defaultScript}
                bind:context={audioContext}
                bind:track={track}
            />
        {/if}

        <!-- Submit Button -->
        <button type="button" class="block mx-auto mt-4 px-2 py-1 bg-violet-700 text-white rounded-md"
            on:click={handleSubmit}
        >
            Submit
        </button>
    </div>
</div>
