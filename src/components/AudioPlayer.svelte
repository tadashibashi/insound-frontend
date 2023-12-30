<script lang="ts">
    import { Delegate } from "app/util/delegate";
    import { getContext, onMount } from "svelte";
    import { Icon, Pause, Play } from "svelte-hero-icons";
    import { NumberParameter } from "app/audio/src/ts/params/types/NumberParameter";
    import Playbar from "./widgets/Playbar.svelte";
    import { TimeDisplay } from "app/util/TimeDisplay";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import ChoiceMenu from "./widgets/ChoiceMenu.svelte";
    import type { MixPreset } from "app/util/MixPreset";
    import type { Param } from "audio/params/ParameterMgr";
    import ChannelStrip from "./widgets/ChannelStrip.svelte";
    import { AudioConsole } from "app/util/AudioConsole";
    import type { AudioChannelSettings } from "app/util/AudioChannel";

    export let onload: Delegate<void, [ArrayBuffer[] | ArrayBuffer, string[], string]>;
    export let onunload: Delegate<void, []>;

    // Bindable AudioConsole for external setting control or to provide your own
    export let audioConsole = new AudioConsole();

    let audioContext = getContext("audio");

    // ===== State ============================================================
    let isPlaying = false;
    let isAudioLoaded = false;


    let points: (SyncPoint & {isActive: boolean})[] = [];

    // used to detect if user started drag seeking while audio was playing
    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    export let showMarkers: boolean = true;
    export let looping: boolean = true;
    export let transitionTime: number = 1;

    export let mixPresets: MixPreset[] = [];

    // todo: implement param page later
    export let params: Param[] = [];

    export let retrieveMix: Delegate<MixPreset, []> | undefined = undefined;

    $: audio = $audioContext;
    $: if ($audioContext) {
       $audioContext.onUpdate(onPlayerUpdate);
       audioConsole.provideAudioEngine($audioContext);
    }

    $: if (looping) {
        if ($audioContext && $audioContext.isTrackLoaded()) {
            $audioContext.setLooping(looping);
        }
    }  else {
        if ($audioContext && $audioContext.isTrackLoaded()) {
            $audioContext.setLooping(looping);
        }
    }


    let loopend: number = 0;

    onMount(() => {
        onload.subscribe(onLoadAudio);
        onunload.subscribe(onUnloadAudio);
        retrieveMix?.subscribe(getCurrentMix);

        return () => {
            onload.unsubscribe(onLoadAudio);
            onunload.unsubscribe(onUnloadAudio);
            retrieveMix?.unsubscribe(getCurrentMix);
        };
    });

    let volumes: NumberParameter[] = [];

    function onUnloadAudio()
    {
        if (!audio) return;

        audio.unloadTrack();
        audioConsole.clear();
    }

    // Callback fired when audio is loaded
    function onLoadAudio(pData: ArrayBuffer | ArrayBuffer[], pLayerNames: string[],
        scriptText: string)
    {
        if(!audio)
            throw Error("AudioEngine was not initialized.");

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
                audio?.setPause(true);
                isPlaying = false;
            }

            points[index].isActive = true;
        });
        audio.setEndCallback(() => {
            console.log("End reached!");
        });

        // clear any potential volume transitions
        for (let i = 0; i < volumes.length; ++i)
        {
            volumes[i].clear();
        }

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
        if (!audio) return;

        if (!audio.paused)
        {
            time.current = audio.position;
        }
    }

    function onPressPlay()
    {
        if (!audio || !audio.isTrackLoaded()) return;
        const newPause = !audio.paused;

        if (!newPause)
            audio.setPause(newPause, 0);
        else
            audio.setPause(newPause, .1);
        isPlaying = !newPause;
    }

    function applyMix(mix: AudioChannelSettings[], transitionTime: number = 0)
    {
        if (!audio || !audio.isTrackLoaded()) return;

        audioConsole.applySettings(mix, transitionTime);
    }

    function getCurrentMix()
    {
        return {name: "", mix: audioConsole.getCurrentSettings()};
    }

    /**
     * Called when seek is applied by the user
     * (click release after dragging playhead)
     *
     * @param cur - current seconds that is seeked to
     */
    function onSeeked(cur: number)
    {
        if (!audio) return;

        audio.seek(Math.max(Math.min(cur, audio.length-.001), 0));

        // Start playing audio again if it was seek interrupted
        if (wasPlayingBeforeSeek)
        {
            audio.setPause(false, .1);
            isPlaying = true;
            wasPlayingBeforeSeek = false;
        }
    }

    function onSeekStart()
    {
        if (!audio) return;
        if (!audio.paused)
            wasPlayingBeforeSeek = true;
        audio.setPause(true);
        isPlaying = false;
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
        onchoose={value => applyMix(mixPresets[value].mix, transitionTime)}/>

    <!-- Channel Strips -->
    <div class="border border-b-2 border-gray-50 rounded-md my-6 shadow-lg">
        <div class="h-[324px] w-full flex pt-2 pl-2">
                <div class="overflow-y-hidden overflow-x-auto whitespace-nowrap flex-grow flex">

                    {#each audioConsole.channels as chan, i (chan)}
                        {#if i > 0}
                            <ChannelStrip channel={chan} />

                            {#if i !== audioConsole.channels.length - 1}
                            <div class="inline h-[300px] w-[1px] border-l border-l-gray-100" />
                            {/if}
                        {/if}
                    {/each}

                </div>

            {#if audioConsole.channels.length > 0}
                <ChannelStrip channel={audioConsole.channels[0]} />
            {/if}

        </div>

    </div>


</div>
