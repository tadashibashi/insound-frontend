<script lang="ts">
    export let active = true;

    let normalLayer: HTMLElement;
    let isDraggedOver: boolean = false;

    /** Callback to handle file that was dropped */
    export let onfiles: (files: File[]) => void = () => {};
    const timeoutTime = 10;

    let timeout: number | undefined = undefined;

    let width: number = 0, height: number = 0;

    $: if (!active)
    {
        if (timeout !== undefined)
            clearTimeout(timeout);
        isDraggedOver = false;
    }

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
            isDraggedOver = true;
            timeout = undefined;
        }, timeoutTime);
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
            isDraggedOver = false;
            timeout = undefined;
        }, timeoutTime);
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

        isDraggedOver = false;

        onfiles(files);
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={$$props.class || "relative w-full h-full rounded-md min-w-[300px] border-dashed border-[3px] border-gray-200 text-gray-300 select-none"}
>
    <div class={"w-full h-full " + (isDraggedOver ? "sr-only" : "opacity-100")}
        bind:this={normalLayer}
        on:dragenter={dragEnterHandler}
        on:dragover={dragOverHandler}>
            <slot name="normal" />
    </div>
    {#if isDraggedOver}
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
