<script lang="ts">
    import { Delegate } from "app/util/delegate";
    import { getContext, onMount } from "svelte";
    import { Icon, Pause, Play } from "svelte-hero-icons";
    import { NumberParameter } from "app/audio/src/ts/params/types/NumberParameter";
    import VSlider from "./widgets/VSlider.svelte";
    import KnobWidget from "./widgets/KnobWidget.svelte";
    import Playbar from "./widgets/Playbar.svelte";
    import { TimeDisplay } from "app/util/TimeDisplay";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import ChoiceMenu from "./widgets/ChoiceMenu.svelte";
    import type { MixPreset } from "audio/MixPresetMgr";
    import type { Param } from "audio/params/ParameterMgr";

    export let onload: Delegate<void, [ArrayBuffer[] | ArrayBuffer, string[], string]>;

    let audioContext = getContext("audio");

    let isPlaying = false;
    let isLoaded = false;
    let numChannels = 0;

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

    export let retrieveMix: Delegate<number[], []> | undefined = undefined;

    $: audio = $audioContext;
    $: if ($audioContext) {
       $audioContext.onUpdate(onPlayerUpdate);
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
        retrieveMix?.subscribe(getCurrentMix);

        return () => {
            onload.unsubscribe(onLoadAudio);
            retrieveMix?.unsubscribe(getCurrentMix);
        };
    });

    let volume = new NumberParameter("Main Volume", 0, 0, 1.25, .01, 1, false,
        (i, val) => audio?.setMainVolume(val));

    let volumes: NumberParameter[] = [];

    let reverb = new NumberParameter("Reverb", 0, 0, 2, .01, 0, false,
        (i, val) => audio?.setMainReverbLevel(val));



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

        const chVolumes: NumberParameter[] = [];
        for (let i = 0; i < pLayerNames.length; ++i)
        {
            chVolumes.push(new NumberParameter(pLayerNames[i], i, 0, 1.25, .01,
                1, false, (index, value) => {
                    audio?.setChannelVolume(index, value);
                }));
        }

        // clear any potential volume transitions
        for (let i = 0; i < volumes.length; ++i)
        {
            volumes[i].clear();
        }

        volumes = chVolumes;

        numChannels = audio.channelCount;
        isLoaded = true;
        isPlaying = false;

        time.max = audio.length;

        time.current = 0;

        points = audio.points.points.map(point => { return{...point, isActive: false} });

        loopend = audio.engine.getLoopSeconds().loopend;
        audio.setLooping(looping);
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


    function onVolumeInput(evt: Event)
    {
        if (!audio) return;

        const target = evt.currentTarget as HTMLInputElement | null;
        if (!target) return;

        const channel = parseInt(target.dataset["chan"] || "");
        if (isNaN(channel))
            throw Error("Invalid chan data value on volume slider");

        const volume = target.valueAsNumber;

        if (channel === numChannels) {
            // Main volume
            audio.setMainVolume(volume);
        } else {
            // Regular channel
            audio.setChannelVolume(channel, volume);
        }
    }

    function setMix(mix: number[], transitionTime: number)
    {
        if (!audio || !audio.isTrackLoaded()) return;

        const chanCount = Math.min(audio.channelCount, mix.length);

        for (let i = 0; i < chanCount; ++i)
        {
            volumes[i].transitionTo(mix[i], transitionTime);
        }
    }

    function getCurrentMix()
    {
        return volumes.map(vol => vol.value);
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

    <!-- Time -->
    <div class="absolute top-[48px] right-1">
        <p class="text-gray-400">
            <span>{time.toString()}</span>
            <span> / </span>
            <span>{time.toString(time.max)}</span>
        </p>
    </div>

    <Playbar class="w-full px-2" active={isLoaded} time={time} markers={points}
        loopend={loopend} looping={looping} showMarkers={showMarkers}
        onchange={(cur) => {
            if (!audio) return;

            audio.seek(Math.max(Math.min(cur, audio.length-.001), 0));

            if (wasPlayingBeforeSeek)
            {
                audio.setPause(false, .1);
                isPlaying = true;
                wasPlayingBeforeSeek = false;
            }
        }}
        onstartseek={() => {
            if (!audio) return;
            if (!audio.paused)
                wasPlayingBeforeSeek = true;
            audio.setPause(true);
            isPlaying = false;
        }}
        onseeking={(val) => time.current = val} />


    <!-- Mix preset options -->
    <ChoiceMenu class="" choices={mixPresets.map(preset => preset.name)} onchoose={value => setMix(mixPresets[value].volumes, transitionTime)}/>

    <!-- Volume Sliders -->
    <div class="h-[240px] w-full flex justify-evenly items-center overflow-hidden">
        {#each Array(numChannels) as _, i (volumes[i])}
            <VSlider param={volumes[i]} height="120px" />
        {/each}
        <VSlider class="h-full my-auto"
            param={volume} height="120px" />
        <KnobWidget class=""
            param={reverb} />
    </div>

</div>
