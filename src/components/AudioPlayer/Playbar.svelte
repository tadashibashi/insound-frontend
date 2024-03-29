<script lang="ts">
    import type { TimeDisplay } from "app/util/TimeDisplay";
    import { onMount } from "svelte";
    import TrackMarker from "./TrackMarker.svelte";
    import type { AudioMarker, AudioMarkerMgr } from "audio/AudioMarkerMgr";
    import type { MultiTrackControl } from "audio/MultiTrackControl";

    // ----- Attributes -------------------------------------------------------
    /** Bar height when not engaged with. Grows to  */
    export let height: string = "4px";
    export let deactiveBgColor: string = "#fafafa";
    export let barColor: string = "#777";
    export let buttonColor: string = "#777";
    export let bgColor: string = "#ddd";

    export let showMarkers: boolean = true;
    export let markers: AudioMarkerMgr;
    export let track: MultiTrackControl;

    /** Active state: show playhead + allow movement */
    export let active: boolean = false;

    /** Time to represent in the bar */
    export let time: TimeDisplay;
    /** Current loop end in seconds */
    $: loopend = track.loopPoint.end;
    $: loopstart = track.loopPoint.start;

    export let looping: boolean = true;

    /** Called when input value changes and should be applied to target */
    export let onchange: (value: number) => void = () => {};

    /** Called when user clicks bar to start seeking */
    export let onstartseek: (value: number) => void = () => {};
    /** Called when user drags pointer after clicking the bar */
    export let onseeking: (value: number) => void = () => {};


    // ----- Bindings ---------------------------------------------------------

    let barEl: HTMLElement;

    // ----- State ------------------------------------------------------------
    let isDragging: boolean = false;
    let isHovering: boolean = false;

    let progress: number = 0;

    let markerDisplayList: boolean[] = [];

    let pointerX: number = 0;
    let timeAtPointer = 0;
    $: {
        if (barEl && isEngaged)
        {
            const rect = barEl.getBoundingClientRect();
            timeAtPointer = Math.max(Math.min((pointerX - rect.x) / rect.width * time.max, time.max), 0);
        }
    }

    $: if (!isDragging)
    {
        progress = time.progress;
    }

    $: isEngaged = (isHovering || isDragging) && active;

    // ----- Helpers ----------------------------------------------------------

    // Get percentage for relative x-position
    function positionToValue(posX: number): number
    {
        const rect = barEl.getBoundingClientRect();
        return rect.width === 0 ? 0 : (posX-rect.left) / rect.width; // 8px offset to match pointer
    }

    // ----- Event Handlers ---------------------------------------------------

    function handlePointerEnterBar()
    {
        if (!active) return;

        isHovering = true;
    }

    function handlePointerLeaveBar()
    {
        isHovering = false;
    }

    function handlePointerDownBar(evt: PointerEvent)
    {
        if (!active) return;

        isDragging = true;

        const prog = Math.min(Math.max(positionToValue(evt.x), 0), 1);
        if (isNaN(prog)) return;

        const seconds = prog * time.max;
        if (seconds > loopend) return;

        progress = prog;
        onstartseek(prog * time.max);
    }

    function handlePointerUpGlobal(evt: PointerEvent)
    {
        if (isDragging)
        {
            // delay undrag to prevent jitter from switc back to using
            // time as playhead/bar position. (See reactive statement above
            // that checks if !isDragging to set progress via track time)
            setTimeout(() => {
                isDragging = false;
            }, 20);

            if (active)
            {
                let seconds = Math.min(Math.max(progress * time.max, 0),
                    loopend);

                onseeking(seconds);
                onchange(seconds);
            }
        }
    }

    function handlePointerMove(evt: PointerEvent)
    {
        if (isEngaged)
        {
            const rect = barEl.getBoundingClientRect();
            pointerX = Math.min(Math.max(rect.x, evt.x), rect.right);
        }

        if (isDragging)
        {
            const progMax = Math.min(1, loopend / time.max);

            const prog = Math.min(Math.max(positionToValue(evt.x), 0), progMax);
            if (isNaN(prog)) return;

            progress = prog;

            if (active)
                onseeking(prog * time.max);
        }
    }

    function handleMarker(marker: AudioMarker)
    {
        const index = markers.findIndexOf(marker);
        if (index !== -1)
        {
            markerDisplayList[index] = true;
        }
    }

    onMount(() => {
        document.addEventListener("pointerup", handlePointerUpGlobal);
        document.addEventListener("pointermove", handlePointerMove);

        markers.onmarker.addListener(handleMarker);

        return () => {
            document.removeEventListener("pointerup", handlePointerUpGlobal);
            document.removeEventListener("pointermove", handlePointerMove);

            markers.onmarker.removeListener(handleMarker);
        };
    });

    function secondsToFineTime(seconds: number): string
    {
        const min = Math.floor(seconds / 60);
        const sec = (Math.floor(seconds) % 60).toString().padStart(2, "0");

        return `${min}:${sec}`;
    }
</script>

<div class={$$props.class}>

    <div class="relative z-0"
        style={`height ${height}; cursor: ${active ? "pointer" : "default"};`}
        on:pointerenter={handlePointerEnterBar}
        on:pointerleave={handlePointerLeaveBar}
        on:pointerdown={handlePointerDownBar}
    >
        <slot name="display" />

        <!-- Tall progress -->
        <div class="relative h-[80px] w-full z-0 bg-gray-300 overflow-hidden">
            <div class={"absolute h-full border-r-2 border-r-gray-300 rounded-r-sm transition-opacity bg-black " +
                (isEngaged ? "opacity-[.1]" : "opacity-[.05]")}
                style={`width: calc(${progress * 100}% + 1px);`}
            >
                <!-- play cursor edge shadow -->
                <div class="absolute right-0 w-[2px] h-full bg-[#ffffff30;]" />
            </div>
        </div>

        <!-- Hovering Markers -->
        <div class="absolute z-30">
            {#each markers.array as m, i (m.name+"-"+i+"-overlay")}
                {#if !(m.name === "LoopStart" || m.name === "LoopEnd")}
                <TrackMarker x={m.position/time.max * (barEl?.getBoundingClientRect().width || 0)}
                    y={-38}
                    text={m.name}
                    show={ (showMarkers) ?
                        (markerDisplayList[i] ? (markerDisplayList[i] = false, true) : false) :
                        false }
                    delayHide={showMarkers ? 3000 : 0}
                />
                {/if}
            {/each}
        </div>

        <!-- Hover time display -->
        <div class={"absolute pointer-events-none z-10 bg-transparent " + (isEngaged ? "" : "sr-only")}
            style={
                `transform: translateX(calc(${pointerX - (barEl?.getBoundingClientRect().x || 0)}px - 50%));`
            }
        >
            <!-- text bubble -->
            <div class="TextShadow -translate-y-[78px] text-white text-xs">
                {secondsToFineTime(timeAtPointer)}
            </div>
        </div>

        <!-- Bar -->
        <div bind:this={barEl}
            class="ProgressBar absolute block w-full z-40 overflow-hidden"
            style={
                `background: ${active ? bgColor : deactiveBgColor};
                height: ${height};
                transform: scaleY(${isEngaged ? 200 : 100}%);`
            }>

            {#if showMarkers}
            <!-- Marker ticks -->
            <div class="w-full absolute z-20"
                style={
                    `height: ${height};`
                }>
                {#each markers.array as {name, position}, i (name+position+"-"+i)}
                    <div class="absolute w-1 h-full bg-black"
                        style={
                            `transform: translateX(-50%);
                            left: ${position/time.max * 100}%;
                            `
                        }/>
                {/each}

                {#if looping}
                    <div class="absolute w-1 h-full bg-amber-200"
                        style={
                            `transform: translateX(-50%);
                            left: ${loopstart/time.max*100}%;
                            `
                        }/>
                    <div class="absolute w-1 h-full bg-amber-200"
                        style={
                            `transform: translateX(-50%);
                            left: ${loopend/time.max*100}%;
                            `
                        }/>
                {/if}

            </div>
            {/if}

            <!-- Progress -->
            <div class="h-full shadow-sm absolute z-10"
                style={`width: calc(${progress * 100}% + 1px); background: ${barColor};`}
            />

            <!-- Blocker if loopend is less than length -->
            {#if loopend < time.max }
                <div class="flex flex-row justify-end w-full h-full absolute z-40 cursor-default"
                >
                    <div class="h-full"
                        style={
                            `width: ${(time.max - loopend) / time.max * 100}%;
                            background: ${deactiveBgColor};`
                        }/>
                </div>

            {/if}
        </div>
        <!-- Shadow -->
        <div class="ProgressBarShadow absolute block w-full shadow-sm"
            style={
                `opacity: ${isEngaged ? 100 : 0}%
                background: ${bgColor};
                height: ${height};
                transform: scaleY(${isEngaged ? 200 : 100}%);`}
        />

        <!-- Playhead -->
        <div
            class={"relative translate-y-[calc(100%-2px)] Playhead w-[12px] aspect-square rounded-full z-40 shadow-md shadow-gray-500 " + (active ? "visible": "invisible")}
            style={
                `background: ${buttonColor};
                transform: translateY(-33%) translateX(calc(${progress *
                    (barEl?.getBoundingClientRect().width || 0)}px - 50%));
                opacity: ${isEngaged ? 100 : 0}%;`
            }
        >
        </div>
    </div>


</div>

<style>
    .ProgressBar {
        transition: transform .15s ease-out, background .15s ease-out;
    }

    .ProgressBarShadow {
        transition: opacity .15s ease-out, transform .15s ease-out;
    }

    .Playhead {
        transition: opacity .15s ease-out;
    }
    .TextShadow {
        text-shadow: 0 1px 2px #00000070;
    }
</style>
