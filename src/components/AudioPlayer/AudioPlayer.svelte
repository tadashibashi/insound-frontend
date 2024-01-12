<script lang="ts">
    import type { AudioChannelSettings } from "audio/AudioChannel";
    import { AudioConsole } from "audio/AudioConsole";
    import type { AudioEngine } from "audio/AudioEngine";
    import type { MixPreset } from "audio/MixPresetMgr";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import { TimeDisplay } from "app/util/TimeDisplay";

    import { onMount } from "svelte";

    import { AdjustmentsVertical, Icon, Pause, Play, PlusCircle, XMark } from "svelte-hero-icons";

    import Playbar from "./Playbar.svelte";
    import MixConsole from "./MixConsole.svelte";
    import SpectrumView from "./SpectrumView.svelte";
    import WaveformMorphDisplay from "./WaveformMorphDisplay.svelte";
    import { WaveMorpher } from "app/util/WaveMorpher";
    import { MultiTrackControl } from "audio/MultiTrackControl";
    import Modal from "../Modal.svelte";
    import MixList from "./MixList.svelte";
    import VolumeSlider from "./VolumeSlider.svelte";

    export const context: AudioPlayerExternalControls = {
        load: onLoadAudio,
        unload: onUnloadAudio,
        getCurrentMix: getCurrentMix,
    };

    // Providing the AudioEngine externally ensures it always exists in this
    // component.
    export let audio: AudioEngine;

    export let track: MultiTrackControl = audio.createTrack();

    let wave = new WaveMorpher(2048);

    let audioConsole: AudioConsole = new AudioConsole(track);

    // ===== State ============================================================
    let isPlaying = false;
    let isAudioLoaded = false;

    let points: (SyncPoint & {isActive: boolean})[] = [];

    // used to detect if user started drag seeking while audio was playing
    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    let loopend: number = 0;

    let showAddMixModal = false;
    let mixName = "";

    export let showMarkers: boolean = true;
    export let looping: boolean = true;
    export let transitionTime: number = 1;

    export let mixPresets: MixPreset[] = [];

    // todo: implement param page later
    // export let params: Param[] = [];


    $: if (track.isLoaded)
    {
        track.looping = looping;
    }


    // ----- Callbacks --------------------------------------------------------

    onMount(() => {
        track.onupdate.addListener(onPlayerUpdate);
        track.onpause.addListener((paused) => {
            isPlaying = !paused;
        });

        return () => {
            audio.deleteTrack(track);
        }
    });

    // Called when unloading audio track
    function onUnloadAudio()
    {
        track.unload();
        audioConsole.clear();
    }

    // Callback fired when audio is loaded
    function onLoadAudio(pData: ArrayBuffer | ArrayBuffer[],
        pLayerNames: string[], scriptText: string)
    {
        if (Array.isArray(pData))
        {
            track.loadSounds(pData, {
                script: scriptText
            });
        }
        else
        {
            track.loadFSBank(pData, {
                script: scriptText
            });
        }

        track.track.onSyncPoint((label, seconds, index) => {
            points[index].isActive = true;
        });

        isAudioLoaded = true;
        isPlaying = false;
        time.max = track.length;

        time.current = 0;

        points = track.syncpoints.points.map(point => { return{...point, isActive: false} });

        loopend = track.track.getLoopPoint().loopend;
        track.looping = looping;

        wave.unloadData();
        audioConsole.clear();
        audioConsole.addChannels(["Main", ...pLayerNames]);
        audioConsole = audioConsole;

        wave.loadData(track, audioConsole);
    }


    // Called 60+ times a second
    function onPlayerUpdate()
    {
        if (!track.isPaused)
        {
            time.current = track.position;
        }
        track.spectrum.data = track.spectrum.data;
    }

    /**
     * Called when seek is applied by the user
     * (click release after dragging playhead)
     *
     * @param cur - current seconds that is seeked to
     */
    function onSeeked(cur: number)
    {
        track.position = Math.max(Math.min(cur, track.length-.001), 0);

        // Start playing audio again if it was seek interrupted
        if (wasPlayingBeforeSeek)
        {
            track.setPause(false, .1);
            isPlaying = true;
            wasPlayingBeforeSeek = false;
        }
    }

    // Called when seeking begins, user begins dragging playhead
    function onSeekStart()
    {
        if (!track.isPaused)
            wasPlayingBeforeSeek = true;
        track.setPause(true);
        isPlaying = false;
    }

    // Called when player clicks play/pause button
    function onPressPlay()
    {
        if (!track.isLoaded) return;
        const newPause = !track.isPaused;

        if (!newPause)
            track.setPause(newPause, 0);
        else
            track.setPause(newPause, .1);
        isPlaying = !newPause;
    }

    // ----- Helpers ----------------------------------------------------------

    // Helper to apply a mix setting to the audio console
    function applyMix(mix: AudioChannelSettings[], transitionTime: number = 0)
    {
        if (!track.isLoaded) return;

        audioConsole.applySettings(mix, transitionTime);
    }

    // Helper to get current mix from the audio console
    function getCurrentMix(name?: string)
    {
        return {name: name || "", mix: audioConsole.getCurrentSettings()};
    }

    function saveMix()
    {
        if (mixName.length === 0) return;

        mixPresets.push(getCurrentMix(mixName));
        mixPresets = mixPresets;
        showAddMixModal = false;
    }
</script>

<!-- Player Container -->
<div class="relative select-none">

    <Playbar
        class="relative w-full z-10 shadow-md rounded-t-md h-[100px] bg-gray-400"
        active={isAudioLoaded}
        time={time}
        markers={points}
        loopend={loopend}
        looping={looping}
        showMarkers={showMarkers}
        onchange={onSeeked}
        onstartseek={onSeekStart}
        onseeking={val => time.current = val}>
        <div slot="display">
            <SpectrumView class="z-20 w-full relative opacity-90" data={track.spectrum.data} progress={time.progress}/>
            <WaveformMorphDisplay wave={wave} class="rounded-none absolute pointer-events-none h-[80px] overflow-hidden w-full z-30 opacity-75" />
        </div>
    </Playbar>


    <!-- Play controls bar -->
    <div class="relative w-full h-10 flex items-center bg-gray-400 text-gray-200 shadow-md mt-1">
        <!-- Play/Pause Button -->
        <button
            class="px-3 h-6 w-6 rounded-md box-content z-50 relative text-gray-200 hover:text-gray-100 transition-transform duration-300"
            on:click={onPressPlay}
            >
            {#if isPlaying}
                <Icon class="drop-shadow-sm z-50" solid src="{Pause}" />
            {:else}
                <Icon class="drop-shadow-sm z-50" solid src="{Play}" />
            {/if}
        </button>

        <!-- TODO: use local storage to save and grab this value -->
        <VolumeSlider initVolume={1} onchange={(val) => audio.masterVolume = val} />

        <!-- Time -->
        <div class="text-xs font-bold">
            <p class="text-gray-200">
                <span>{time.toString()}</span>
                <span> / </span>
                <span>{time.toString(time.max)}</span>
            </p>
        </div>

        <div class="flex justify-center items-center z-50 text-white absolute w-full pointer-events-none">
            {#if mixPresets.length > 0}
            <Icon size="20" class="inline-block me-1" src={AdjustmentsVertical} />
            <MixList presets={mixPresets}
                onchoice={(preset, index) => console.log(preset.name, index)}
                ondrop={(from, to) => {
                    console.log(from, to);
                    const temp = [...mixPresets];
                    const preset = temp[from];
                    temp.splice(from, 1);
                    temp.splice(to, 0, preset);
                    mixPresets = temp;
                }}
            />
            {/if}
        </div>

        <div class="flex justify-end items-center z-50 text-white absolute w-full pointer-events-none">
            <button class="pointer-events-auto" on:click={() => showAddMixModal = true}>
                <Icon src={PlusCircle} size="16" />
            </button>
        </div>


    </div>


    <MixConsole audioConsole={audioConsole} />
    <!-- Mix preset options -->
<!--     <ChoiceMenu class="" choices={mixPresets.map(preset => preset.name)}
        onchoose={value => applyMix(mixPresets[value].mix, transitionTime)} /> -->

</div>

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
