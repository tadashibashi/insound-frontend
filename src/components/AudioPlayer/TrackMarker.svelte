<script lang="ts">

    export let text: string = "";
    export let time: number = 0;
    export let delayHide: number = 2000;
    export let show: boolean = false;
    export let clickable: boolean = false;
    export let onclick: (evt: PointerEvent) => void = () => {};
    export let x: number = 0;
    export let y: number = 0;

    export let bgColor: string = "#1f2937";

    let bubbleDiv: HTMLDivElement;

    let bubbleXOffset = 0;

    // ----- State ------------------------------------------------------------

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let isShowing: boolean = false;

    let isHovering: boolean = false;

    $:
    if (show)
    {
        if (hideTimeout !== null)
        {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        isShowing = true;
        show = false;
        hideTimeout = setTimeout(() => {
            isShowing = false;
        }, delayHide);

        constrainPositionInWindow();
    }

    // ----- Helpers ----------------------------------------------------------

    /**
     * Convert number of seconds into mm:ss.ms format
     */
    function toDigitalTime(seconds: number): string
    {
        const ms = Math.floor(Math.floor(seconds * 1000) % 1000 * .1);

        seconds = Math.floor(seconds);
        const ss = seconds % 60;
        const mm = Math.floor(seconds / 60);

        return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    function constrainPositionInWindow()
    {
        if (!bubbleDiv) return;

        const rect = bubbleDiv.getBoundingClientRect();

        const diff = document.body.clientWidth - rect.right;

        if (diff < 0)
        {
            bubbleXOffset = diff;
        }
    }

    // ----- Event handlers ---------------------------------------------------
    function handlePointerEnterBubble()
    {
        isHovering = true;
    }

    function handlePointerLeaveBubble()
    {
        isHovering = false;
    }

    function handlePointerDown(evt: PointerEvent)
    {
        // this is a hovering overlay, don't want the click to pass thru
        evt.stopPropagation();

        if (clickable)
            onclick(evt);
    }

</script>

<div class={"TrackMarker absolute select-none z-30 " +
        (isShowing || isHovering ? "opacity-100" : "opacity-0 pointer-events-none") + " " +
        (clickable ? "cursor-pointer" : "cursor-default")}
    on:pointerdown={handlePointerDown}
    style={`transform: translate(${x}px, ${y}px);`}
>
    <!-- Bubble portion -->
    <div class="w-full h-full text-gray-200 py-[2px] px-3 shadow-sm z-0 overflow-hidden whitespace-nowrap"
        on:pointerenter={handlePointerEnterBubble}
        on:pointerleave={handlePointerLeaveBubble}
        bind:this={bubbleDiv}
        style={
            `background: ${bgColor};
            transform: translateX(${bubbleXOffset}px);`
        }
    >
    {text}
    </div>

    <!-- Stem portion -->
    <div class="relative">
        <div class="absolute z-20"
            style={
                `width: 0; height: 0;
                border-top: 12px solid ${bgColor};
                border-right: 8px solid transparent;`
            }
        />
<!--         <div class="absolute w-full bg-gray-300 z-10"
            style={
                `transform: translateX(${bubbleXOffset}px);`
                }>
            <p class="TextShadow text-white ml-3 shadow-md">
                <span>{toDigitalTime(time)}</span>

            </p>
        </div> -->

    </div>

</div>


<style>
    .TrackMarker {
        transition: opacity .5s ease-out;
        font-size: 12px;
        min-width: 80px;
    }
    .TextShadow {
        text-shadow: 0 3px 2px #00000011;
        font-size: 10px;

    }
</style>
