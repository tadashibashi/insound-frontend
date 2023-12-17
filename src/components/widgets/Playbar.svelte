<script lang="ts">
    import type { TimeDisplay } from "app/util/TimeDisplay";
    import type { SyncPoint } from "audio/SyncPointMgr";
    import { onMount } from "svelte";
    import TrackMarker from "./TrackMarker.svelte";

    // ----- Attributes -------------------------------------------------------
    /** Bar height when not engaged with. Grows to  */
    export let height: string = "4px";
    export let deactiveBgColor: string = "#fafafa";
    export let barColor: string = "#888";
    export let buttonColor: string = "#888";
    export let bgColor: string = "#ddd";

    export let markers: SyncPoint[] = [];

    export let currentPoints: SyncPoint[] = [];


    /** Active state: show playhead + allow movement */
    export let active: boolean = false;

    /** Time to represent in the bar */
    export let time: TimeDisplay;
    /** Current loop end in seconds */
    export let loopend: number;

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
        return rect.width === 0 ? 0 : (posX-10) / rect.width; // 8px offset to match pointer
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

    onMount(() => {
        document.addEventListener("pointerup", handlePointerUpGlobal);
        document.addEventListener("pointermove", handlePointerMove);

        return () => {
            document.removeEventListener("pointerup", handlePointerUpGlobal);
            document.removeEventListener("pointermove", handlePointerMove);
        };
    });
</script>

<div class={$$props.class}>
    <!-- Invisible buffer that makes gui hitbox larger -->
    <div class="relative"
        style={`height ${height}; padding-top: 24px; cursor: ${active ? "pointer" : "default"};`}
        on:pointerenter={handlePointerEnterBar}
        on:pointerleave={handlePointerLeaveBar}
        on:pointerdown={handlePointerDownBar}
    >
        <!-- Playhead -->
        <div
            class={"Playhead absolute w-[12px] aspect-square rounded-full z-10 shadow-md shadow-gray-200 " + (active ? "visible": "invisible")}
            style={
                `background: ${buttonColor};
                transform: translateY(-33%) translateX(calc(${progress *
                    (barEl?.getBoundingClientRect().width || 0)}px - 50%));
                opacity: ${isEngaged ? 100 : 0}%;`
            }
        />

        <div class="absolute">
            {#each markers as m (m.text+m.offset+"-overlay")}
                <TrackMarker x={m.offset/time.max*(barEl?.getBoundingClientRect().width || 0)}
                    y={-38}
                    time={m.offset}
                    text={m.text}
                    show={currentPoints.includes(m)}
                    delayHide={3000}
                />
            {/each}
        </div>


        <!-- Bar -->
        <div bind:this={barEl}
            class="ProgressBar absolute block w-full"
            style={
                `background: ${active ? bgColor : deactiveBgColor};
                height: ${height};
                transform: scaleY(${isEngaged ? 200 : 100}%);`
            }>

            <!-- Marker ticks -->
            <div class="w-full absolute z-50"
                style={
                    `height: ${height};`
                }>
                {#each markers as {text, offset} (text+offset)}
                    {#if text === "LoopStart" || text === "LoopEnd"}
                        <div class="absolute w-1 h-full bg-blue-400"
                            style={
                                `transform: translateX(calc(${offset/time.max*(barEl?.getBoundingClientRect().width || 0)}px - 50%));`
                            }/>
                    {:else}
                        <div class="absolute w-1 h-full bg-black"
                            style={
                                `transform: translateX(calc(${offset/time.max*(barEl?.getBoundingClientRect().width || 0)}px - 50%));`
                            }/>
                    {/if}
                {/each}
            </div>



            <!-- Progress -->
            <div class="h-full shadow-sm absolute"
                style={`width: ${progress * 100}%; background: ${barColor};`}
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
    </div>
</div>

<style>
    .ProgressBar {
        transition: transform .25s ease-out, background .25s ease-out;
    }

    .ProgressBarShadow {
        transition: opacity .25s ease-out, transform .25s ease-out;
    }

    .Playhead {
        transition: opacity .15s ease-out;
    }
</style>
