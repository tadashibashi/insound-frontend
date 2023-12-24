<script lang="ts">
    import type { ParameterMgr } from "audio/params/ParameterMgr";
    import { Delegate } from "app/util/delegate";
    import { getContext, onMount } from "svelte";
    import { Icon, Pause, PauseCircle, Play, PlayCircle } from "svelte-hero-icons";
    import { NumberParameter } from "app/audio/src/ts/params/types/NumberParameter";
    import VSlider from "./widgets/VSlider.svelte";
    import KnobWidget from "./widgets/KnobWidget.svelte";
    import Playbar from "./widgets/Playbar.svelte";
    import { TimeDisplay } from "app/util/TimeDisplay";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import ChoiceMenu from "./widgets/ChoiceMenu.svelte";
    import type { MixPreset } from "app/audio/src/ts/MixPresetMgr";

    export let onload: Delegate<void, [ArrayBuffer[] | ArrayBuffer, string[], string]>;

    const onloadparams: Delegate<void, [ParameterMgr]> = new Delegate;

    let audioContext = getContext("audio");

    let isPlaying = false;
    let isLoaded = false;
    let numChannels = 0;

    let points: (SyncPoint & {isActive: boolean})[] = [];

    let wasPlayingBeforeSeek = false;

    let time: TimeDisplay = new TimeDisplay;

    let showSyncPoints: boolean = true;
    let isLooping: boolean = true;

    let mixPresets: MixPreset[] = [];

    let transitionTime: number = 1;

    let mixNameValue: string = "";

    $: audio = $audioContext;
    $: if ($audioContext) {
       $audioContext.onUpdate(onPlayerUpdate);
    }

    $: if (isLooping) {
        if ($audioContext && $audioContext.isTrackLoaded()) {
            $audioContext.setLooping(isLooping);
        }
    }  else {
        if ($audioContext && $audioContext.isTrackLoaded()) {
            $audioContext.setLooping(isLooping);
        }
    }


    let loopend: number = 0;

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
    function onLoadAudio(pData: ArrayBuffer | ArrayBuffer[], pLayerNames: string[],
        scriptText: string)
    {
        if(!audio)
            throw Error("AudioEngine was not initialized.");

        audio.presets.clear(); // todo: populate presets from database

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
            if (label === "LoopEnd" && !isLooping) {
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

        audio.presets.presets.unshift({name: "Default Mix", volumes: volumes.map(volume => volume.defaultValue)});

        numChannels = audio.channelCount;
        isLoaded = true;
        isPlaying = false;

        time.max = audio.length;

        time.current = 0;

        points = audio.points.points.map(point => { return{...point, isActive: false} });

        loopend = audio.engine.getLoopSeconds().loopend;
        mixPresets = audio.presets.presets;
        audio.setLooping(isLooping);
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

    function setDefaultMix(transitionTime: number)
    {
        const defaultMix = volumes.map(vol => vol.defaultValue);
        setMix(defaultMix, transitionTime);
    }

    function handleAddMixClick()
    {
        if (mixNameValue === "" || volumes.length === 0) return;

        mixPresets.push({
            name: mixNameValue,
            volumes: volumes.map(volume => volume.value),
        });

        mixNameValue = "";
        mixPresets = mixPresets;
    }
</script>

<!-- Player Container -->
<div class="relative select-none">

    <!-- options -->
    <table>
        <tbody>
            <tr>
                <td class="p-1">
                    <label for="show-markers-input" class="block text-xs font-bold">
                        Show Markers
                    </label>
                </td>
                <td>
                    <input id="show-markers-input" type="checkbox" bind:checked={showSyncPoints} />
                </td>
            </tr>

            <tr>
                <td class="p-1">
                    <label for="is-looping-input" class="block text-xs font-bold">
                        Looping
                    </label>
                </td>
                <td>
                    <input id="is-looping-input" type="checkbox" bind:checked={isLooping} />
                </td>
            </tr>

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
        </tbody>
    </table>


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
        loopend={loopend} looping={isLooping} showMarkers={showSyncPoints}
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

    <div class="mt-4 ml-4">
        <input  bind:value={mixNameValue} placeholder="Mix Name" />
        <button class="block" on:click={handleAddMixClick}>Add Mix</button>
    </div>
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
