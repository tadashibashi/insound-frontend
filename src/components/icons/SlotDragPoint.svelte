<script lang="ts">
    import { EllipsisVertical, Icon } from "svelte-hero-icons";

    export let show = true;
    export let onmousedown: ((evt: MouseEvent) => void) | undefined = undefined;
    export let onpointerup: ((evt: PointerEvent) => void) | undefined = undefined;

    let grabbing = true;

    function handleMouseDown(evt: MouseEvent)
    {
        grabbing = true;
        if (onmousedown)
            onmousedown(evt);
    }

    function handlePointerUp(evt: PointerEvent)
    {
        grabbing = false;
        if (onpointerup)
            onpointerup(evt);
    }
</script>

<div class={($$props.class || "")}>
    <button class={"flex items-center group-hover:opacity-100 text-gray-400 " +
        (show && grabbing ? "active:cursor-grabbing" : "cursor-grab") + " " +
        show ? "opacity-100" : "opacity-0"}
        type="button"
        on:mousedown={handleMouseDown}
        on:pointerup={handlePointerUp}
        >
        {#if show}
        <Icon src="{EllipsisVertical}" class="-mr-4" />
        <Icon src="{EllipsisVertical}" />
        {/if}
    </button>
</div>
