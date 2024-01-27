<script lang="ts">
    import { AudioConsole } from "audio/AudioConsole";
    import type { AudioEngine } from "audio/AudioEngine";
    import type { MixPreset } from "audio/MixPresetMgr";
    import { TimeDisplay } from "app/util/TimeDisplay";
    import { onMount } from "svelte";
    import { ChevronLeft, Cog6Tooth, Icon, Pause, Play } from "svelte-hero-icons";
    import Playbar from "./Playbar.svelte";
    import MixConsole from "./MixConsole.svelte";
    import SpectrumView from "./SpectrumView.svelte";
    import WaveformMorphDisplay from "./WaveformMorphDisplay.svelte";
    import { WaveMorpher } from "app/util/WaveMorpher";
    import { MultiTrackControl } from "audio/MultiTrackControl";
    import MixList from "./MixList.svelte";
    import VolumeSlider from "./VolumeSlider.svelte";
    import AudioScriptEditor from "./AudioScriptEditor.svelte";
    import type { TextEditorMgr } from "app/util/TextEditorMgr";
    import MarkerControl from "./MarkerControl.svelte";
    import { StorageName } from "app/consts";

    export const context: AudioPlayerExternalControls = {
        load: onLoadAudio,
        unload: onUnloadAudio,
    };

    // Providing the AudioEngine externally ensures it always exists in this
    // component.
    export let audio: AudioEngine;

    export let editMode: boolean = true;

    // Bindable
    export const track: MultiTrackControl = audio.createTrack();

    export let defaultScript = "";

    let tabIndex = 2;
    const tabs = ["Mixer", "Markers", "Script"];

    let wave = new WaveMorpher(2048);

    let audioConsole: AudioConsole = track.console;

    // ===== State ============================================================
    let isPlaying = false;

    // used to detect if user started drag seeking while audio was playing
    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    let presetChoice: MixPreset;

    let volumeSliderShow: boolean = false;

    let textEditor: TextEditorMgr;

    let showEditorPane = true;

    export let showMarkers: boolean = true;
    export let looping: boolean = true;
    export let transitionTime: number = 1;

    $: mixPresets = track.mixPresets;

    $: if (track.isLoaded)
    {
        track.looping = looping;
    }


    // ----- Callbacks --------------------------------------------------------

    onMount(() => {
        track.onupdate.addListener(onPlayerUpdate);
        track.onpause.addListener(onPause);
        track.onseek.addListener(updateSeekUI);

        return () => {
            track.onupdate.removeListener(onPlayerUpdate);
            track.onpause.removeListener(onPause);
            track.onseek.removeListener(updateSeekUI);

            audio.deleteTrack(track);
        }
    });

    // Called when unloading audio track
    function onUnloadAudio()
    {
        track.unload();
        wave.unloadData();
    }

    /**
     * Load track audio
     * @param pData      - binary file data, either 1 fsb buffer, or multiple files in an array
     * @param channels   - audio channels correlating to file data
     * @param scriptText - lua script to load
     */
    function onLoadAudio(pData: ArrayBuffer | ArrayBuffer[],
        channels: AudioChannel[], scriptText: string)
    {
        // Load audio data into track
        if (Array.isArray(pData))
        {
            // Array of buffers contain separate audio files / sounds
            track.loadSounds(pData, {
                script: scriptText,
                channels: channels,
            });
        }
        else
        {
            // One buffer is an fsbank
            track.loadFSBank(pData, {
                script: scriptText,
                channels: channels,
            });
        }

        // Set component state and track options
        isPlaying = false;
        time.max = track.length;
        time.current = 0;

        track.looping = looping;

        wave.loadData(track, audioConsole);

        audioConsole = audioConsole; // notify mix console component of update
    }

    function onPause(paused: boolean)
    {
            isPlaying = !paused;
    }


    // Called 60+ times a second
    function onPlayerUpdate()
    {
        if (!track.isPaused)
        {
            wave.update(time.progress);
        }
        
        track.spectrum.data = track.spectrum.data;
        time.current = track.position;
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
    function onSeekStart(cur: number)
    {
        if (!track.isPaused)
            wasPlayingBeforeSeek = true;
        track.setPause(true);
        wave.update(cur / time.max);
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

    function onScriptReload()
    {
        track.updateScript(textEditor.text);
    }

    function updateSeekUI(val: number)
    {
        time.current = val;
        wave.update(val / time.max);
    }
</script>

<!-- Outer Container -->
<div class="bg-white border border-gray-300 rounded-md shadow-lg">
    <!-- Player Container -->
    <div class="relative select-none min-w-[340px] shadow-md rounded-t-md">
        <!-- Upper area -->
        <div on:pointerleave={() => {volumeSliderShow = false;}}>
            <Playbar
                class="relative w-full z-10 rounded-t-md h-[100px] bg-gray-400"
                active={track.isLoaded}
                time={time}
                markers={track.markers}
                loopend={track.markers.loopEnd?.position || 0}
                looping={looping}
                showMarkers={showMarkers}
                onchange={onSeeked}
                onstartseek={onSeekStart}
                onseeking={updateSeekUI}>
                <div slot="display">
                    <SpectrumView class="z-20 w-full relative opacity-90"
                        data={track.spectrum.data}
                        progress={time.progress}
                    />
                    <WaveformMorphDisplay
                        class="shadow-inner rounded-none absolute
                            pointer-events-none h-[80px] overflow-hidden
                            w-full z-30 opacity-90"
                        wave={wave}
                        progress={track.position / track.length}
                    />
                </div>
            </Playbar>

            <!-- Play controls bar -->
            <div class="relative w-full h-10 flex justify-between items-center
                bg-gray-400 text-gray-50 shadow-md mt-1"
            >

                <!-- Left side of bar -->
                <div class="flex items-center">

                    <!-- Play/Pause Button -->
                    <button
                        class="px-3 rounded-md box-content z-50
                            relative hover:text-white transition-transform
                            duration-300 scale-90 sm:scale-100"
                        on:click={onPressPlay}
                    >
                        {#if isPlaying}
                            <Icon class="drop-shadow-sm z-50" size="20" solid src="{Pause}" />
                        {:else}
                            <Icon class="drop-shadow-sm z-50" size="20" solid src="{Play}" />
                        {/if}
                    </button>

                    <!-- Volume controls -->
                    <VolumeSlider
                        initVolume={ parseFloat(localStorage.getItem(StorageName.MasterVolume) ?? "1") }
                        onchange={(val) => {
                                audio.masterVolume = val;
                                localStorage.setItem(StorageName.MasterVolume, audio.masterVolume.toString());
                            }}
                        bind:show={volumeSliderShow} />

                    <!-- Time -->
                    <div class="text-[10px] sm:text-xs visible font-semibold">
                        <p class="text-gray-100">
                            <span>{time.toString()}</span>
                            <span> / </span>
                            <span>{time.toString(time.max)}</span>
                        </p>
                    </div>
                </div>

                <div class="flex">
                    <MixList
                        bind:presets={mixPresets}
                        bind:choice={presetChoice}
                        mixConsole={audioConsole}
                        transitionTime={transitionTime}
                        editMode={editMode}
                    />

                    <button class="hover:text-white" on:click={() => showEditorPane = !showEditorPane}>
                        <div class="relative flex items-center justify-center w-8 scale-75 sm:scale-100">
                            <Icon class="absolute duration-300 ease-in-out transition-all
                                    {showEditorPane ? "-rotate-180 opacity-0" : "opacity-100 rotate-180"}
                                "
                                src={Cog6Tooth} size="16" solid />
                            <Icon class="absolute duration-300 ease-in-out transition-all
                                    {showEditorPane ? "-rotate-90 opacity-100" : "rotate-0 opacity-0"}
                                "
                                src={ChevronLeft} size="16" solid />
                        </div>

                    </button>
                </div>

            </div>
        </div>

        <!-- Editor Window -->
        <div class="transition-all origin-top
                { (showEditorPane) ?
                    "scale-y-100 opacity-100 h-[324px]" :
                    "scale-y-0 opacity-0 h-0" }
            "
        >
            <!-- Mix Console -->
            <div class="
                    { (tabIndex === 0) ? "" : "sr-only -z-50" }
                "
            >
                <MixConsole audioConsole={audioConsole}
                    active={tabIndex === 0}
                    editMode={editMode}
                />
            </div>

            <!-- Markers -->
            <div class="
                {tabIndex === 1 ? "h-[324px] overflow-y-auto" :
                        "sr-only -z-50"}
                "
            >
                <MarkerControl markers={track.markers} track={track}
                    bind:looping={looping} bind:showMarkers={showMarkers}
                    active={tabIndex === 1}
                    editMode={editMode}
                />
            </div>

            <!-- Script Editor -->
            <div class="{ (tabIndex === 2) ? "h-[324px] overflow-y-auto" :
                    "sr-only -z-50" }
                "
            >
                <AudioScriptEditor
                    bind:editor={textEditor}
                    value={defaultScript}
                    doloadscript={onScriptReload}
                    editMode={editMode}
                />
            </div>

        </div>

    </div>


    <!-- Bottom tab menu  -->
    <div class="transition-opacity
            { showEditorPane ? "opacity-100" : "sr-only opacity-0" }
        "
    >
        <div class="flex text-center cursor-pointer select-none bg-gray-100
                overflow-hidden rounded-b-md min-w-[340px]
            "
        >
            {#each tabs as tab, i ("tab-" + tab)}
                <button class=" bg-[#fefefe] inset-0 border-r text-center w-48
                        border-gray-100 px-8 py-1 transition-colors
                        { i === tabIndex ?
                        "text-gray-400 font-bold bg-[#fefefe] shadow-md z-40" :
                        "text-gray-300 bg-gray-50" }
                    "
                    on:click={() => tabIndex = i}
                >
                    {tab}
                </button>
            {/each}
        </div>
    </div>
</div>

