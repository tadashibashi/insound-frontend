<script lang="ts">
    import DropdownMenu from "../widgets/DropdownMenu.svelte";
    import type { MixPreset } from "audio/MixPresetMgr";
    import MixPresetEditMenu from "./MixPresetEditMenu.svelte";
    import { AdjustmentsVertical, Icon, Plus, ChevronRight, ChevronLeft } from "svelte-hero-icons";
    import AddMixModal from "./modals/AddMixModal.svelte";
    import type { AudioConsole } from "app/audio/src/ts/AudioConsole";
    import type { AudioChannelSettings } from "app/audio/src/ts/AudioChannel";

    // ===== Attributes =======================================================

    // ----- Required ---------------------------------------------------------
    export let mixConsole: AudioConsole;
    export let presets: MixPreset[];

    // ----- Event emitters (optional) ----------------------------------------
    export let onchoice: ((preset: MixPreset, index: number) => void)
        | undefined = undefined;
    export let ondrop: ((from: number, to: number) => void)
        | undefined = undefined;
    export let onaddmix: ((preset: MixPreset) => void)
        | undefined = undefined;
    export let onpatchmix: ((oldMix: AudioChannelSettings[],
        newMix: AudioChannelSettings[]) => void) | undefined = undefined;
    export let ondelete: ((preset: MixPreset) => void)
        | undefined = undefined;

    // ----- Editing options --------------------------------------------------
    export let canedit: boolean = true;
    export let candrag: boolean = true;

    export let transitionTime = 1;

    // ----- Bindable ---------------------------------------------------------
    export let choice: MixPreset | undefined = presets.at(0);

    let mainButtonEl: HTMLButtonElement;

    // ===== State ============================================================
    let itemEls: HTMLButtonElement[] = [];
    let draggingIndex = -1;
    let dragBeforeTarget = -1;
    let lastY = -1;

    let showAddMixModal = false;

    let editMenuIsOpen: boolean = false;
    let mainMenuIsOpen: boolean = false;

    // ===== Event handlers ===================================================

    function handleDragEnd(evt: DragEvent)
    {
        const target = evt.currentTarget;
        const to = dragBeforeTarget;

        dragBeforeTarget = -1;
        draggingIndex = -1;

        if (!target) return;

        const from = itemEls.findIndex(el => el === target);
        if (from === -1 || to === -1 || from === to) return;

        dragAndDrop(from, to);
        if (ondrop)
            ondrop(from, to);
    }

    function handleDeleteMix()
    {
        if (choice === undefined) return;

        let index = presets.findIndex(p => p === choice);
        if (index === -1) return;

        // Perform deletion
        const temp = [...presets];
        const deleted = temp[index];
        temp.splice(index, 1);

        // Update index
        index = Math.min(index, temp.length-1);
        choice = temp[index];

        // Commit change
        presets = temp;

        if (ondelete)
            ondelete(deleted);
    }

    function handleAddMix(name: string, copyCurrent: boolean)
    {
        addMix(name, copyCurrent);
    }

    function handlePatchMix()
    {
        if (!choice) return;

        const oldMix = choice.mix;
        choice.mix = mixConsole.getCurrentSettings();

        if (onpatchmix)
            onpatchmix(oldMix, choice.mix);
    }

    function handleEditName(name: string)
    {
        if (!choice) return;

        choice.name = name;
        presets = presets; // trigger ui update
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


    // ----- Helpers ----------------------------------------------------------

    // Helper to apply a mix setting to the audio console
    function applyMix(mix: AudioChannelSettings[], transitionTime: number = 0)
    {

        mixConsole.applySettings(mix, transitionTime);
    }

    // Helper to get current mix from the audio console
    function getCurrentMix(name?: string)
    {
        return {name: name || "", mix: mixConsole.getCurrentSettings()};
    }

    function getDefaultMix(name?: string)
    {
        return {name: name || "", mix: mixConsole.getDefaultSettings()};
    }

    function addMix(mixName: string, useCurrent: boolean)
    {
        if (mixName.length === 0) return;

        if (useCurrent)
        {
            presets.push(getCurrentMix(mixName));
        }
        else
        {
            // default mix
            presets.push(getDefaultMix(mixName));
            applyMix(presets[presets.length-1].mix, transitionTime);
        }

        presets = presets;
        choice = presets[presets.length-1];

        if (onaddmix)
            onaddmix(choice);
    }

    /** Perform preset drag drop result */
    function dragAndDrop(from: number, to: number)
    {
        const temp = [...presets];
        const preset = temp[from];
        temp.splice(from, 1);
        temp.splice(to, 0, preset);
        presets = temp;
    }
</script>

<div class="flex items-center">
    <DropdownMenu class="pointer-events-auto"
        dropdownClass="bg-gray-100 rounded-sm min-w-[120px] shadow-md absolute right-0 opacity-[.97]"
        items={presets}
    >
        <!-- Button -->
        <button type="button" bind:this={mainButtonEl} slot="button" let:open class={"ButtonTextShadow pointer-events-auto shadow-inner flex justify-between items-center rounded-sm ps-[5px] py-[1px] min-w-[120px] h-6 " +
            (presets.length ? "bg-gray-100" : "bg-gray-300")}
        >
            <Icon size="20" class="inline-block me-1 text-gray-200" src={AdjustmentsVertical} />
            {#if presets.length > 0 && choice}
                <p class="px-1 overflow-hidden text-ellipsis max-w-[96px] text-gray-500 text-lg sm:text-xl sm:max-w-[160px]">{choice.name}</p>

                {#if canedit}
                <MixPresetEditMenu class="p-1"
                    doDeleteMix={handleDeleteMix}
                    doEditName={handleEditName}
                    doPatchMix={handlePatchMix}
                    choice={choice}
                    bind:isOpen={editMenuIsOpen}
                    onclick={() => { if (open && mainButtonEl) mainButtonEl.click(); }}
                />
                {/if}
            {/if}
        </button>

        <!-- Individual Item -->
        <button slot="item" let:item let:i bind:this={itemEls[i]}
            class={"cursor-pointer text-xs text-left block w-full h-full px-2 text-gray-400 py-[1px] border-b-4 border-t-4 " +
                (draggingIndex === i ? "bg-gray-400 hover:text-gray-50 opacity-75 hover:cursor-grabbing" : "hover:bg-gray-300 hover:text-white") + " " +
                (dragBeforeTarget === i && draggingIndex !== i ? (draggingIndex < i ? "border-b-gray-400 border-t-transparent" : "border-t-gray-400 border-b-transparent") : (dragBeforeTarget > i && i === presets.length - 1 && draggingIndex !== i ? "border-b-gray-400 border-t-transparent" : "border-b-transparent border-t-transparent"))
            }
            on:click={(evt) => {
                if (onchoice)
                    onchoice(item, i);
                choice = item;
                applyMix(item.mix, transitionTime);
            }}
            on:drag={handleDragging}
            on:dragstart={(evt) => {
                draggingIndex = i;
            }}
            on:dragend={handleDragEnd}
            draggable={candrag && canedit}
        >
            {#if choice === item}
                <Icon src={ChevronRight} size="12" mini class="inline-block"/> {item.name} <Icon src={ChevronLeft} size="12" mini class="inline-block"/>
            {:else}
                {item.name}
            {/if}


        </button>
    </DropdownMenu>

    <!-- Add mix button -->
    {#if canedit}
    <button class="flex transition-colors duration-300 justify-center items-center mx-2 w-[20px] h-[20px] pointer-events-auto rounded-full drop-shadow-md text-gray-100 hover:text-white hover:bg-[rgb(148,155,160)]" on:click={() => {if (!editMenuIsOpen && !mainMenuIsOpen) showAddMixModal = true}}>
        <Icon src={Plus} mini class="m-[3px]" />
    </button>
    {/if}

    <AddMixModal bind:show={showAddMixModal} onsubmit={handleAddMix} />
</div>

<style>
    .ButtonTextShadow {
        text-shadow: 2px 2px 2px #00000010;
        font-family: Monogram, monospace;
    }
</style>
