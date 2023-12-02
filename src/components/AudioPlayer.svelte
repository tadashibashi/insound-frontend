<script lang="ts">
    import type { Delegate } from "app/util/delegate";
    import { getContext, onMount } from "svelte";
    import { Icon, Pause, Play } from "svelte-hero-icons";

    export let onload: Delegate<void, [ArrayBuffer, string[], string]>;

    let audioContext = getContext("audio");
    let currentTime = 0;
    let maxTime = 0;
    let playhead: HTMLElement;
    let bar: HTMLElement;
    let isPlaying = false;
    let isLoaded = false;
    let numChannels = 0;
    let layerNames: string[] = [];

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


    /**
     * Convert number of seconds into hh:mm format
     */
    function toDigitalTime(timeInSeconds: number): string
    {
        timeInSeconds = Math.floor(timeInSeconds);

        const ss = timeInSeconds % 60;
        const mm = Math.floor(timeInSeconds / 60);

        return `${mm}:${ss.toString().padStart(2, '0')}`;
    }


    // Move playhead to the proper position within a bar
    function updatePlayheadPosition(playhead: HTMLElement, bar: HTMLElement,
        currentTime: number, maxTime: number): void
    {
        if (!playhead || !bar) return;

        const width = bar.getBoundingClientRect().width;
        playhead.style.transform =
            `translate(${currentTime/maxTime*width}px, -25%)`;
    }


    // Callback fired when audio is loaded
    function onLoadAudio(pData: ArrayBuffer, pLayerNames: string[],
        scriptText: string)
    {
        if(!audio)
            throw Error("AudioEngine was not initialized.");

        audio.loadTrack(pData);
        audio.setSyncPointCallback((label, seconds) => {
            console.log("SyncPoint: \"" + label + "\": at " + seconds);
        });
        audio.setEndCallback(() => {
            console.log("End reached!");
        });
        audio.loadScript(scriptText);

        currentTime = 0;
        maxTime = audio.length;
        numChannels = audio.trackCount;
        isLoaded = true;
        isPlaying = false;
        layerNames = pLayerNames;

        updatePlayheadPosition(playhead, bar, currentTime,
            maxTime);
    }


    function onSeek(evt: MouseEvent): void
    {
        if (!audio) throw Error("AudioEngine was not initialized.");

        const newTime = calculateSeek(evt.x, bar, maxTime);

        audio.seek(newTime);
        currentTime = newTime;
        updatePlayheadPosition(playhead, bar, currentTime, maxTime);

        function calculateSeek(mouseX: number, bar: HTMLElement,
            maxTime: number): number
        {
            const rect = bar.getBoundingClientRect();
            return (mouseX - rect.x) / rect.width * maxTime;
        }
    }


    // Called 60+ times a second
    function onPlayerUpdate()
    {
        if (!audio) return;
        currentTime = audio.position;

        updatePlayheadPosition(playhead, bar, currentTime, maxTime);
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

        // if (newPause)
        //     audio.suspend();
        // else
        //     audio.resume();
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
<div class="relative">
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
            <span>{toDigitalTime(currentTime)}</span>
            <span> / </span>
            <span>{toDigitalTime(maxTime)}</span>
        </p>
    </div>

    <!-- Play Bar -->
    <button
        class="relative w-full h-1 bg-gray-300 mt-1"
        bind:this={bar}
        on:click={onSeek}
        >

        <!-- Playhead -->
        <div
            class="w-1 h-2 rounded bg-gray-500 -translate-y-1/4"
            style={isLoaded ? "" : "visibility:hidden;"}
            bind:this={playhead}></div>

    </button>

    <!-- Volume Sliders -->
    <div class="h-[200px] w-full flex justify-evenly items-center">
        {#each Array(numChannels + 1) as _, i}
            <div class="h-full pt-4 flex flex-col min-w-0">
                <input
                    id={"vol-slider-" + i}
                    style="appearance: slider-vertical;"
                    type="range"
                    value="1" min="0" max="2" step=".001"
                    data-chan="{i}"
                    on:input={onVolumeInput}
                    />
                <label class="text-center" for={"vol-slider-"+i}>
                    { layerNames.length > i ? layerNames[i] : "Layer " + (i + 1) }
                </label>
            </div>
        {/each}
    </div>

</div>
