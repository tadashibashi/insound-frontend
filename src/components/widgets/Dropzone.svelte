<script lang="ts">
    let isDraggedOver: boolean = false;

    /** Callback to handle file that was dropped */
    export let onfiles: (files: File[]) => void = () => {};

    function dragOverHandler(evt: DragEvent)
    {
        evt.preventDefault();
    }

    function dragEnterHandler(evt: DragEvent)
    {
        isDraggedOver = true;
    }

    function dragLeaveHandler(evt: DragEvent)
    {
        isDraggedOver = false;
    }

    function dropHandler(evt: DragEvent)
    {
        evt.preventDefault();

        if (!evt.dataTransfer || !evt.dataTransfer.files.length) return;

        const files: File[] = [];
        for (let i = 0; i < evt.dataTransfer.files.length; ++i)
        {
            files.push(evt.dataTransfer.files.item(i) as File);
        }

        onfiles(files);

        isDraggedOver = false;
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={"relative w-full rounded-md min-w-[300px] border-dashed border-2 border-gray-200 text-gray-300 select-none" || $$props.class}
    on:dragenter={dragEnterHandler}
    on:dragover={dragOverHandler}
    on:drop={dropHandler}
>
    {#if isDraggedOver}
        <div class="w-full h-full"
            on:dragleave={dragLeaveHandler}
            on:dragover={dragOverHandler}
        >
            <slot name="dragover" />
        </div>
    {:else}
        <div class="w-full h-full">
            <slot name="normal" />
        </div>

    {/if}

    <slot />
</div>
