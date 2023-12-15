<script lang="ts">
    import type { ParameterMgr } from "audio/params/ParameterMgr";
    import { Delegate } from "app/util/delegate";
    import { getContext, onMount } from "svelte";
    import { Icon, Pause, Play } from "svelte-hero-icons";
    import { NumberParameter } from "app/audio/src/ts/params/types/NumberParameter";
    import VSlider from "./widgets/VSlider.svelte";
    import KnobWidget from "./widgets/KnobWidget.svelte";
    import Playbar from "./widgets/Playbar.svelte";
    import { TimeDisplay } from "app/util/TimeDisplay";

    export let onload: Delegate<void, [ArrayBuffer, string[], string]>;

    const onloadparams: Delegate<void, [ParameterMgr]> = new Delegate;

    let audioContext = getContext("audio");

    let isPlaying = false;
    let isLoaded = false;
    let numChannels = 0;

    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    $: audio = $audioContext;
    $: {
        if ($audioContext)
           $audioContext.onUpdate(onPlayerUpdate);
    }

    onMount(() => {
        onload.subscribe(onLoadAudio);

        return () => {
            onload.unsubscribe(onLoadAudio);
        };
    });

    let volume = new NumberParameter("Main Volume", 0, 0, 1.25, .01, 1, false,
        (i, val) => audio?.setMainVolume(val));

    let volumes: NumberParameter[] = [];

    let reverb = new NumberParameter("Reverb", 0, 0, 2, .01, 0, false,
        (i, val) => audio?.setMainReverbLevel(val));



    // Callback fired when audio is loaded
    function onLoadAudio(pData: ArrayBuffer, pLayerNames: string[],
        scriptText: string)
    {
        if(!audio)
            throw Error("AudioEngine was not initialized.");

        audio.loadTrack(pData, scriptText);
        audio.setSyncPointCallback((label, seconds) => {
            console.log("SyncPoint: \"" + label + "\": at " + seconds);
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
    }


    // Called 60+ times a second
    function onPlayerUpdate()
    {
        if (!audio) return;

        if (!audio.paused)
            time.current = audio.position;
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
</script>

<!-- Player Container -->
<div class="relative select-none">
    <!-- Play/Pause Button -->
    <button
        class="drop-shadow-sm w-8 border border-gray-100 rounded-full p-2 box-content m-2"
        on:click={onPressPlay}
        >
        {#if isPlaying}
            <Icon class="drop-shadow-sm" src="{Pause}" />
        {:else}
            <Icon class="drop-shadow-sm" src="{Play}" />
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

    <Playbar class="w-full px-2" active={isLoaded}  time={time}
        onchange={(cur) => {
            audio?.seek(cur);
            if (wasPlayingBeforeSeek)
            {
                audio?.setPause(false, .1);
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

    <!-- Volume Sliders -->
    <div class="h-[240px] w-full flex justify-evenly items-center overflow-hidden">
        {#each Array(numChannels) as _, i}
            <VSlider param={volumes[i]} height="120px" />
        {/each}
        <VSlider class="h-full my-auto"
            param={volume} height="120px" />
        <KnobWidget class=""
            param={reverb} />
    </div>

</div>
