<script lang="ts">
    import { ChevronUpDown, Icon } from "svelte-hero-icons";
    import DropdownMenu from "../widgets/DropdownMenu.svelte";
    import type { MixPreset } from "audio/MixPresetMgr";
    import { onMount } from "svelte";
    import SlotDragPoint from "../icons/SlotDragPoint.svelte";

    export let presets: MixPreset[];
    export let onchoice: ((preset: MixPreset, index: number) => void) | undefined = undefined;
    export let ondrop: ((from: number, to: number) => void) | undefined = undefined;
    export let allowDrag: boolean = true;

    let choiceIndex = 0;
    let itemEls: HTMLButtonElement[] = [];

    let draggingIndex = -1;
    let dragBeforeTarget = -1;
    let lastY = -1;

    function handleDragEnd(evt: DragEvent)
    {
        const target = evt.currentTarget;
        const to = dragBeforeTarget;

        dragBeforeTarget = -1;
        draggingIndex = -1;

        if (!target) return;

        const from = itemEls.findIndex(el => el === target);
        if (from === -1 || to === -1 || from === to) return;

        if (ondrop)
            ondrop(from, to);

    }

    function handleDragging(evt: DragEvent)
    {
        if (evt.y === lastY) return;

        const count = presets.length;
        let toIndexFound = false;
        for (let i = 0; i < count; ++i)
        {
            const el = itemEls[i];
            const elRect = el.getBoundingClientRect();
            if (evt.y < elRect.top + elRect.height * .5 )
            {
                dragBeforeTarget = i > draggingIndex ? Math.max(i - 1, 0) : i ;
                toIndexFound = true
                break;
            }
        }

        if (!toIndexFound)
        {
            dragBeforeTarget = count;
        }

        lastY = evt.y;
    }
</script>
<DropdownMenu class="pointer-events-auto" dropdownClass="bg-gray-400 border border-gray-300 rounded-sm min-w-[120px] shadow-md" items={presets.map(p => p.name)}>

    <!-- Button -->
    <div slot="button" class="flex justify-between items-center rounded-sm border border-gray-300 bg-gray-400 px-2 py-[1px] min-w-[120px]">
        <p>{presets[choiceIndex].name}</p>
        <Icon class="inline-block" src={ChevronUpDown} size="16" />
    </div>

    <!-- Individual Item -->
    <button slot="item" let:item let:i bind:this={itemEls[i]}
        class={"cursor-pointer text-left block w-full h-full px-2 py-[1px] border-b-4 border-t-4 " +
            (draggingIndex === i ? "bg-gray-500 text-gray-200 opacity-75" : "hover:bg-violet-300") + " " +
            (dragBeforeTarget === i && draggingIndex !== i ? (draggingIndex <= i ? "border-b-violet-700" : "border-t-violet-700") : "border-b-transparent border-t-transparent") + " " +
            (dragBeforeTarget > i && i === presets.length - 1 && draggingIndex !== i ? "border-b-violet-700" : "border-b-transparent border-t-transparent")

        }
        on:click={() => {
            if (onchoice)
                onchoice(presets[i], i);
            choiceIndex = i;
        }}
        on:drag={handleDragging}
        on:dragstart={(evt) => {
            draggingIndex = i;
        }}
        on:dragend={handleDragEnd}
        draggable={allowDrag}
    >
        {item}
    </button>
</DropdownMenu>
