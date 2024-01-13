<script lang="ts">
    import { AudioConsole } from "audio/AudioConsole";
    import type { AudioEngine } from "audio/AudioEngine";
    import type { MixPreset } from "audio/MixPresetMgr";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import { TimeDisplay } from "app/util/TimeDisplay";

    import { onMount } from "svelte";

    import { Icon, Pause, Play } from "svelte-hero-icons";

    import Playbar from "./Playbar.svelte";
    import MixConsole from "./MixConsole.svelte";
    import SpectrumView from "./SpectrumView.svelte";
    import WaveformMorphDisplay from "./WaveformMorphDisplay.svelte";
    import { WaveMorpher } from "app/util/WaveMorpher";
    import { MultiTrackControl } from "audio/MultiTrackControl";
    import MixList from "./MixList.svelte";
    import VolumeSlider from "./VolumeSlider.svelte";

    export const context: AudioPlayerExternalControls = {
        load: onLoadAudio,
        unload: onUnloadAudio,
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

    let presetChoice: MixPreset;

    export let showMarkers: boolean = true;
    export let looping: boolean = true;
    export let transitionTime: number = 1;

    export let mixPresets: MixPreset[] = [];

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

        console.log("There are " + track.channelCount + " channels");
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


</script>

<!-- Player Container -->
<div class="relative select-none min-w-[340px]">

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
    <div class="relative w-full h-10 flex justify-between items-center bg-gray-400 text-gray-200 shadow-md mt-1">

        <!-- Left side of bar -->
        <div class="flex items-center">

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

            <!-- Volume controls -->
            <!-- TODO: use local storage to save and grab this value -->
            <VolumeSlider initVolume={1} onchange={(val) => audio.masterVolume = val} />

            <!-- Time -->
            <div class="text-[10px] sm:text-xs font-bold">
                <p class="text-gray-200">
                    <span>{time.toString()}</span>
                    <span> / </span>
                    <span>{time.toString(time.max)}</span>
                </p>
            </div>
        </div>

        <!-- Right side of bar -->
        <MixList
            bind:presets={mixPresets}
            bind:choice={presetChoice}
            mixConsole={audioConsole}
            transitionTime={transitionTime}
        />
    </div>

    <MixConsole audioConsole={audioConsole} />
</div>

