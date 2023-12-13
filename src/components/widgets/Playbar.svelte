<script lang="ts">
    import type { TimeDisplay } from "app/util/TimeDisplay";
    import { onMount } from "svelte";

    // ----- Attributes -------------------------------------------------------
    export const height: string = "4px";
    export const barColor: string = "#888";
    export const buttonColor: string = "#888";
    export const bgColor: string = "#ddd";

    // Active state: show playhead + allow movement
    export let active: boolean = false;

    // Time display info object
    export let time: TimeDisplay;

    // Called when input value changes
    export let onchange: (value: number) => void = () => {};
    // Called when user clicks bar to start seeking
    export let onstartseek: (value: number) => void = () => {};

    export let onseek: (value: number) => void = () => {};


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
        if (!isNaN(prog))
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
                const seconds = progress * time.max;
                onseek(seconds);
                onchange(seconds);
            }
        }
    }

    function handlePointerMove(evt: PointerEvent)
    {
        if (isDragging)
        {
            const prog = Math.min(Math.max(positionToValue(evt.x), 0), 1);
            if (!isNaN(prog))
                progress = prog;

            if (active)
                onseek(prog * time.max);
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
                opacity: ${(isHovering || isDragging) && active ? 100 : 0}%;`
            }
        />

        <!-- Bar -->
        <div bind:this={barEl}
            class="ProgressBar absolute block w-full"
            style={
                `background: ${bgColor};
                height: ${height};
                transform: scaleY(${(isHovering || isDragging) && active ?
                    200 : 100}%);`
            }>

            <!-- Progress -->
            <div class="h-full"
                style={`width: ${progress * 100}%; background: ${barColor};`}
            />
        </div>
        <!-- Shadow -->
        <div class="ProgressBarShadow absolute block w-full shadow-sm"
            style={
                `opacity: ${(isHovering || isDragging) && active ?
                    100 : 0}%
                background: ${bgColor};
                height: ${height};
                transform: scaleY(${(isHovering || isDragging) && active ?
                    200 : 100}%);`}
        />
    </div>
</div>

<style>
    .ProgressBar {
        transition: transform .25s ease-out;
    }

    .ProgressBarShadow {
        transition: opacity .15s ease-out;
    }

    .Playhead {
        transition: opacity .15s ease-out;
    }
</style>
