<script lang="ts">

    export let name: string = "";
    export let delayHide: number = 2000;
    export let show: boolean = false;

    // ----- State ------------------------------------------------------------

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let isShowing: boolean = false;

    let isHovering: boolean = false;

    $:
    if (!show)
    {
        if (isShowing)
        {
            if (hideTimeout !== null)
                clearTimeout(hideTimeout);

            hideTimeout = setTimeout(() => {
                isShowing = false;
            }, 2000);
        }
    }
    else
    {
        if (hideTimeout !== null)
        {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        isShowing = true;
    }

    function handlePointerEnterBubble()
    {
        isHovering = true;
    }

    function handlePointerLeaveBubble()
    {
        isHovering = false;
    }

</script>

<div class={"TrackMarker absolute " + (isShowing ? "opacity-100" : "opacity-0")}>
    <!-- Bubble portion -->
    <div class="rounded-2xl"
        on:pointerenter={handlePointerEnterBubble}
        on:pointerleave={handlePointerLeaveBubble}
    />

    <!-- Stem portion -->
    <div>

    </div>
</div>


<style>
    .TrackMarker {
        transition: opacity 3s ease-out;
    }
</style>
