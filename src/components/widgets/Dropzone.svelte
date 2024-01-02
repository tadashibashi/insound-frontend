<script lang="ts">
    /** Transition time to wait before drag state changes. Prevent bugs. */
    const TimeoutTime = 10;

    // ===== Public ===========================================================
    /** Whether dropzone can be dragged over with files */
    export let active = true;

    /** Whether current dropzone is being hover/dragged over with files */
    export let isdraggedover: boolean = false;

    /** Callback to handle file that was dropped */
    export let onfiles: (files: File[]) => void = () => {};

    // ===== Private ==========================================================

    let _isDraggedOver: boolean = false;
    $: isdraggedover = _isDraggedOver;

    let normalLayer: HTMLElement;
    let timeout: number | undefined = undefined;

    let width: number = 0, height: number = 0;

    $: if (!active)
    {
        if (timeout !== undefined)
            clearTimeout(timeout);
        _isDraggedOver = false;
    }

    // ===== Callbacks ========================================================

    function dragOverHandler(evt: DragEvent)
    {
        evt.preventDefault();
    }

    function updateSize()
    {
        const rect = normalLayer.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
    }

    function dragEnterHandler(evt: DragEvent)
    {
        evt.preventDefault();
        updateSize();

        if (timeout !== undefined)
        {
            clearTimeout(timeout);
        }

        if (!active) return;

        timeout = setTimeout(() => {
            _isDraggedOver = true;
            timeout = undefined;
        }, TimeoutTime);
    }

    function dragLeaveHandler(evt: DragEvent)
    {
        evt.preventDefault();

        if (timeout !== undefined)
        {
            clearTimeout(timeout);
        }

        if (!active) return;

        timeout = setTimeout(() => {
            _isDraggedOver = false;
            timeout = undefined;
        }, TimeoutTime);
    }

    function dropHandler(evt: DragEvent)
    {
        evt.preventDefault();

        if (!active) return;

        if (!evt.dataTransfer || !evt.dataTransfer.files.length) return;

        const files: File[] = [];

        const fileCount = evt.dataTransfer.files.length;
        for (let i = 0; i < fileCount; ++i)
        {
            files.push(evt.dataTransfer.files.item(i) as File);
        }

        _isDraggedOver = false;

        onfiles(files);
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={$$props.class || "relative w-full h-full rounded-md min-w-[min(75vmin,500px)] border-dashed border-[3px] border-gray-200 text-gray-300 select-none"}
>
    <div class={"w-full h-full " + (_isDraggedOver ? "sr-only" : "opacity-100")}
        bind:this={normalLayer}
        on:dragenter={dragEnterHandler}
        on:dragover={dragOverHandler}>
            <slot name="normal" />
    </div>
    {#if _isDraggedOver}
        <div class=""
            style={`width: ${width}px; height: ${height}px;`}
            on:dragleave={dragLeaveHandler}
            on:dragover={dragOverHandler}
            on:drop={dropHandler}
        >
            <slot name="dragover" />
        </div>
    {/if}



    <slot />
</div>
