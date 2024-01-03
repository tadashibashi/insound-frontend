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

    function dragEnterHandler()
    {
        if (!active) return;

        updateSize();
        setDragOverStatus(true);
    }

    function dragLeaveHandler()
    {
        if (!active) return;

        setDragOverStatus(false);
    }

    function dropHandler(evt: DragEvent)
    {
        evt.preventDefault();

        if (!active) return;

        if (!evt.dataTransfer || !evt.dataTransfer.files.length) return;

        // collect files from the drop event
        const files: File[] = [];
        const fileCount = evt.dataTransfer.files.length;
        for (let i = 0; i < fileCount; ++i)
        {
            files.push(evt.dataTransfer.files.item(i) as File);
        }

        _isDraggedOver = false;

        // pass files to the user callback
        onfiles(files);
    }

    // ----- Helpers ----------------------------------------------------------

    /**
     * Delay-set the dragover status of this Dropoverzone.
     * Setting this variable is delayed to help prevent bugs that may arise
     * from race conditions.
     */
    function setDragOverStatus(value: boolean)
    {
        // cancel existing timeout if any
        if (timeout !== undefined)
        {
            clearTimeout(timeout);
        }

        // delay value set
        timeout = setTimeout(() => {
            _isDraggedOver = value;
            timeout = undefined;
        }, TimeoutTime);
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={$$props.class || "relative w-full h-full rounded-md min-w-[min(75vmin,500px)] border-dashed border-[3px] border-gray-200 text-gray-300 select-none"}
    on:pointerleave={dragLeaveHandler}
>
    <div class={"w-full h-full " + (_isDraggedOver ? "sr-only" : "opacity-100")}
        bind:this={normalLayer}
        on:dragenter={dragEnterHandler}
        on:dragover={dragOverHandler}>
            <slot name="normal" />
    </div>
    {#if _isDraggedOver}
        <div
            style={`width: ${width}px; height: ${height}px;`}
            on:dragleave={dragLeaveHandler}
            on:dragover={dragOverHandler}
            on:drop={dropHandler}
            on:pointerdown={dragLeaveHandler}
        >
            <slot name="dragover" />
        </div>
    {/if}



    <slot />
</div>
