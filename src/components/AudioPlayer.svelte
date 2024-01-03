<script lang="ts">
    import type { AudioChannelSettings } from "app/util/AudioChannel";
    import { AudioConsole } from "app/util/AudioConsole";
    import type { AudioEngine } from "audio/AudioEngine";
    import type { MixPreset } from "app/util/MixPreset";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import { TimeDisplay } from "app/util/TimeDisplay";

    import { onMount } from "svelte";

    import ChannelStrip from "./widgets/ChannelStrip.svelte";
    import ChoiceMenu from "./widgets/ChoiceMenu.svelte";
    import Playbar from "./widgets/Playbar.svelte";
    import { Icon, Pause, Play } from "svelte-hero-icons";

    export const context: AudioPlayerExternalControls = {
        load: onLoadAudio,
        unload: onUnloadAudio,
        getCurrentMix: getCurrentMix,
    };

    // Providing the AudioEngine externally ensures it always exists in this
    // component.
    export let audio: AudioEngine;

    // Bindable AudioConsole for external control. You can provide your own.
    export let audioConsole = new AudioConsole(audio);

    // ===== State ============================================================
    let isPlaying = false;
    let isAudioLoaded = false;

    let points: (SyncPoint & {isActive: boolean})[] = [];

    // used to detect if user started drag seeking while audio was playing
    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    let loopend: number = 0;

    export let showMarkers: boolean = true;
    export let looping: boolean = true;
    export let transitionTime: number = 1;

    export let mixPresets: MixPreset[] = [];

    // todo: implement param page later
    // export let params: Param[] = [];


    $: if (looping && audio.isTrackLoaded())
    {
        audio.setLooping(looping);
    }


    // ----- Callbacks --------------------------------------------------------

    onMount(() => {
       audio.onUpdate(onPlayerUpdate);
    });

    // Called when unloading audio track
    function onUnloadAudio()
    {
        audio.unloadTrack();
        audioConsole.clear();
    }

    // Callback fired when audio is loaded
    function onLoadAudio(pData: ArrayBuffer | ArrayBuffer[],
        pLayerNames: string[], scriptText: string)
    {
        if (Array.isArray(pData))
        {
            audio.loadSounds(pData, {
                script: scriptText
            });
        }
        else
        {
            audio.loadTrack(pData, {
                script: scriptText
            });
        }

        audio.setSyncPointCallback((label, seconds, index) => {
            if (label === "LoopEnd" && !looping) {
                audio.setPause(true, 0);
                audio.suspend();
                isPlaying = false;
            }

            points[index].isActive = true;
        });

        audio.setEndCallback(() => {
            console.log("End reached!");
        });

        isAudioLoaded = true;
        isPlaying = false;
        time.max = audio.length;

        time.current = 0;

        points = audio.points.points.map(point => { return{...point, isActive: false} });

        loopend = audio.engine.getLoopSeconds().loopend;
        audio.setLooping(looping);

        audioConsole.clear();
        audioConsole.addChannels(["Main", ...pLayerNames]);
        audioConsole = audioConsole;
    }


    // Called 60+ times a second
    function onPlayerUpdate()
    {
        if (!audio.paused)
        {
            time.current = audio.position;
        }
    }

    /**
     * Called when seek is applied by the user
     * (click release after dragging playhead)
     *
     * @param cur - current seconds that is seeked to
     */
    function onSeeked(cur: number)
    {
        audio.seek(Math.max(Math.min(cur, audio.length-.001), 0));

        // Start playing audio again if it was seek interrupted
        if (wasPlayingBeforeSeek)
        {
            audio.setPause(false, .1);
            isPlaying = true;
            wasPlayingBeforeSeek = false;
        }
    }

    // Called when seeking begins, user begins dragging playhead
    function onSeekStart()
    {
        if (!audio.paused)
            wasPlayingBeforeSeek = true;
        audio.setPause(true);
        isPlaying = false;
    }

    // Called when player clicks play/pause button
    function onPressPlay()
    {
        if (!audio.isTrackLoaded()) return;
        const newPause = !audio.paused;

        if (!newPause)
            audio.setPause(newPause, 0);
        else
            audio.setPause(newPause, .1);
        isPlaying = !newPause;
    }

    // ----- Helpers ----------------------------------------------------------

    // Helper to apply a mix setting to the audio console
    function applyMix(mix: AudioChannelSettings[], transitionTime: number = 0)
    {
        if (!audio.isTrackLoaded()) return;

        audioConsole.applySettings(mix, transitionTime);
    }

    // Helper to get current mix from the audio console
    function getCurrentMix(name?: string)
    {
        return {name: name || "", mix: audioConsole.getCurrentSettings()};
    }
</script>

<!-- Player Container -->
<div class="relative select-none">
    <!-- Play/Pause Button -->
    <button
        class="drop-shadow-sm w-16 border border-gray-100 rounded-full box-content m-2"
        on:click={onPressPlay}
        >
        {#if isPlaying}
            <Icon class="text-gray-500" src="{Pause}" />
        {:else}
            <Icon class="text-gray-500" src="{Play}" />
        {/if}
    </button>

    <Playbar
        class="w-full px-2"
        active={isAudioLoaded}
        time={time}
        markers={points}
        loopend={loopend}
        looping={looping}
        showMarkers={showMarkers}
        onchange={onSeeked}
        onstartseek={onSeekStart}
        onseeking={val => time.current = val} />

    <!-- Time -->
    <div class="absolute top-[48px] right-1">
        <p class="text-gray-400">
            <span>{time.toString()}</span>
            <span> / </span>
            <span>{time.toString(time.max)}</span>
        </p>
    </div>

    <!-- Mix preset options -->
    <ChoiceMenu class="" choices={mixPresets.map(preset => preset.name)}
        onchoose={value => applyMix(mixPresets[value].mix, transitionTime)} />

    <!-- Channel Strips -->
    <div class="border border-b-2 border-gray-50 rounded-md my-6 shadow-lg">
        <div class="h-[324px] w-full flex pt-2 pl-2">
                <div class="overflow-y-hidden overflow-x-auto whitespace-nowrap flex-grow flex">

                    {#each audioConsole.channels as chan, i (chan)}
                        {#if i > 0}
                            <ChannelStrip channel={chan} />

                            <!-- Channel divider -->
                            <div class="inline h-[300px] w-[1px] border-l border-l-gray-100" />
                        {/if}
                    {/each}

                </div>

            {#if audioConsole.channels.length > 0}
                <ChannelStrip channel={audioConsole.channels[0]} />
            {/if}

        </div>

    </div>


</div>
