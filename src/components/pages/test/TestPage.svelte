<script lang="ts">
    import Form from "app/components/Form.svelte";
    import { getContext } from "svelte";
    import { Result } from "app/util/api/Result";
    import { Icon, Minus, Pause, Play, Plus } from "svelte-hero-icons";

    let numInputs = 1;
    let isPlaying = false;
    const audio = getContext("audio");

    let currentTime = 0;
    let maxTime = 0;
    let playInterval: NodeJS.Timeout | null = null;
    let playhead: HTMLDivElement;
    let numChannels = 0;

    function timeDisplay(seconds: number) {
        seconds = Math.floor(seconds);

        const ss = seconds % 60;
        const mm = Math.floor(seconds / 60);

        return mm.toString() + ":" + ss.toString().padStart(2, "0");
    }

    function onLoadAudio(payload: Result<unknown, unknown>) {
        if (!payload.ok)
            throw Error("Request error.");
        if (!(payload.result instanceof ArrayBuffer))
            throw Error("Wrong data type received from request.");
        if (!$audio)
            throw Error("Audio engine has not been initialized.");

        $audio.loadTrack(payload.result);

        currentTime = 0;
        maxTime = $audio.length || 0;
        isPlaying = false;
        numChannels = $audio.trackCount;
    }

    function onSeek(ev: MouseEvent) {
        if (!$audio) return;
        if (!playhead) return;

        const rect = playhead.parentElement?.getBoundingClientRect();
        if (!rect) return;

        const newTime = (ev.x - rect.x) / rect.width * maxTime;

        $audio.seek(newTime);
        currentTime = newTime;
        playhead.style.transform = `translate(${currentTime/maxTime*rect.width}px, -25%)`;
    }

    function onPlayInterval() {
        const width = playhead.parentElement?.getBoundingClientRect().width || 0;
        currentTime = $audio?.position || 0;
        if (playhead)
            playhead.style.transform = `translate(${currentTime/maxTime*width}px, -25%)`;
    }

    function onSliderInput(evt: Event)
    {
        if (!$audio) {
            console.error("AudioEngine was not initialized.");
            return;
        }
        const target = evt.currentTarget as HTMLInputElement;
        const chan = Number(target.dataset["chan"]);
        if (isNaN(chan)) {
            console.error("Volume slider dataset.chan was not a number.");
            return;
        }

        $audio.setChannelVolume(numChannels - 1 - chan, target.valueAsNumber);
    }

    function onPressPlay() {
        if (!$audio || !$audio.isTrackLoaded()) return;

        const newPaused = !$audio.paused;
        $audio.setPause(newPaused);
        isPlaying = !newPaused;

        if (isPlaying)
        {
            if (playInterval !== null)
                clearInterval(playInterval);
            playInterval = setInterval(onPlayInterval, 50);
        }
        else
        {
            if (playInterval !== null)
            {
                clearInterval(playInterval);
                playInterval = null;
            }

        }
    }

    function onMainSliderInput(evt: Event) {
        const target = evt.currentTarget as HTMLInputElement;

        if (!$audio) return;

        $audio.setMainVolume(target.valueAsNumber);
    }
</script>

<Form
    class="max-w-[512px] mx-auto border border-gray-100 mt-4 rounded-md shadow-sm"
    action="/api/test/make-fsb"
    method="POST" onThen={onLoadAudio}
    >
    <div class="relative w-full h-12">
        <p class="absolute top-1 left-3 text-2xl">Load Audio</p>
        <div class="absolute top-1 right-1">
            <button
                class="w-8 border border-gray-100 rounded-md bg-gray-200 hover:bg-gray-100"
                type="button"
                on:click={() => numInputs = Math.min(8, numInputs + 1)}>
                    <Icon src="{Plus}" />
            </button>

            <button
                class="w-8 border border-gray-100 rounded-md bg-gray-200 hover:bg-gray-100"
                type="button"
                on:click={() => numInputs = Math.max(1, numInputs - 1)}>
                    <Icon src="{Minus}" />
            </button>
        </div>
    </div>


    <div class="w-full">
    {#each Array(numInputs) as _, i ("input_" + i)}
        <div>
            <label class="text-xs font-bold block pl-4" for={"Layer_" + (i + 1)}>Layer {i + 1}</label>
            <input
                class="block pl-4 mt-1 mb-2"
                id={"Layer_" + (i + 1)}
                name={"Layer " + (i+1)}
                type="file"
                required />
        </div>
    {/each}
    </div>


    <button
        class="border border-gray-200 rounded-md py-1 px-2 my-4 mx-auto block bg-violet-400 text-white"
        type="submit">
        Load Files
    </button>
</Form>

<!-- Player -->
<div class="relative max-w-[512px] mx-auto mt-12 border border-gray-100 shadow-md">
    <button class="drop-shadow-sm w-8 border border-gray-100 rounded-full p-2 box-content m-2" on:click={onPressPlay}>
    {#if isPlaying}
        <Icon src="{Pause}" />
    {:else}
        <Icon src="{Play}" />
    {/if}
    </button>

    <!-- Time -->
    <div class="absolute top-[48px] right-1">
        <p class="text-gray-400"><span>{timeDisplay(currentTime)}</span> / <span>{timeDisplay(maxTime)}</span></p>
    </div>

    <!-- Playhead -->
    <button class="relative w-full h-1 bg-gray-300 mt-1" on:click={onSeek}>
        <div bind:this={playhead} class="w-1 h-2 rounded bg-gray-500 -translate-y-1/4"></div>
    </button>

    <!-- Volume sliders -->
    <div class="h-[200px] w-full flex justify-evenly items-center">
    {#each Array(numChannels) as _, i}
        <div class="h-full pt-4 flex flex-col min-w-0">
            <input id={"vol-slider-" + i} style="appearance: slider-vertical;" type="range" value="1" min="0" max="2" step=".001" data-chan="{i}" on:input={onSliderInput}/>
            <label class="text-center" for={"vol-slider-"+i}>Layer {i + 1}</label>
        </div>
    {/each}
        <div class="h-full pt-4 flex flex-col min-w-0">
            <input id="vol-slider-master" style="appearance: slider-vertical;" type="range" value="1" min="0" max="2" step=".001" on:input={onMainSliderInput}>
            <label class="text-center" for="vol-slider-master">Main</label>
        </div>
    </div>
</div>



