<script lang="ts">
    // Edit menu
    // 1.  Update Preset (ArrowPath)
    // 2.  Delete Preset (Trash)

    import { ArrowPath, Icon, PencilSquare, Trash, ChatBubbleLeftEllipsis, Check } from "svelte-hero-icons";
    import DropdownMenu from "../widgets/DropdownMenu.svelte";
    import EditMixNameModal from "./modals/EditMixNameModal.svelte";
    import DeleteMixModal from "./modals/DeleteMixModal.svelte";
    import { onMount } from "svelte";
    import { Transition } from "@rgossiaux/svelte-headlessui";

    export let doEditName: ((name: string) => void) | undefined = undefined;
    export let doPatchMix: ((mix: MixPreset) => void) | undefined = undefined;
    export let doDeleteMix: ((mix: MixPreset) => void) | undefined = undefined;

    export let choice: MixPreset | undefined;

    const menuItems = [
        { text: "Update Mix", icon: ArrowPath, color: "hover:text-emerald-300"},
        { text: "Edit Name", icon: ChatBubbleLeftEllipsis, color: "hover:text-gray-400"},
        { text: "Delete Mix", icon: Trash, color: "hover:text-red-300"},
    ];

    let showEditNameModal = false;
    let showDeleteMixModal = false;
    let mixUpdateSuccess = false;
    let mixUpdateTimeout: number | null = null;

    // Reactively close other modals when one is open (just in case...)
    $: if (showEditNameModal)
    {
        showDeleteMixModal = false;
        mixUpdateSuccess = false;
        mixUpdateSuccess = false;
        if (mixUpdateTimeout)
            clearTimeout(mixUpdateTimeout);
    }
    else if (showDeleteMixModal)
    {
        showEditNameModal = false;
        mixUpdateSuccess = false;
        mixUpdateSuccess = false;
        if (mixUpdateTimeout)
            clearTimeout(mixUpdateTimeout);
    }

    function doCallback(index: number)
    {
        switch(index)
        {
        case 0:
            if (doPatchMix && choice)
            {
                mixUpdateSuccess = true;
                if (mixUpdateTimeout !== null)
                    clearTimeout(mixUpdateTimeout);
                mixUpdateTimeout = setTimeout(() => {
                    mixUpdateSuccess = false;
                    mixUpdateTimeout = null;
                }, 2000);
                doPatchMix(choice);
            }
            break;
        case 1:
            if (choice)
                showEditNameModal = true;
            break;
        case 2:
            if (choice)
                showDeleteMixModal = true;
            break;
        default:
            console.error("Invalid callback index provided to MixPresetEditMenu");
            break;
        }
    }

    onMount(() => {
        return () => {
            if (mixUpdateTimeout !== null)
                clearTimeout(mixUpdateTimeout);
        }
    });

</script>

<div class={($$props.class || "") + " pointer-events-auto"}>

    <DropdownMenu
        class="relative text-violet-300 group"
        items={menuItems}
        dropdownClass="bg-violet-50 opacity-[.97] rounded-md shadow-md py-1 absolute right-0 w-[112px]"
    >
        <!-- Edit button -->
        <button slot="button" let:open class={"relative flex justify-center items-center rounded-md w-[22px] h-[22px] group-hover:bg-violet-200 group-hover:text-violet-50 " +
            (open ? "bg-violet-200 text-violet-50" : "")}
        >
            <Transition
                show={mixUpdateSuccess}
                enter="transition-all duration-500"
                enterFrom="-translate-y-full opacity-0"
                enterTo="translate-y-0 opacity-100"
                leave="transition-all duration-500"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="opacity-0"
                class="absolute"
            >
                <Icon class="text-violet-500 drop-shadow-sm" src={Check} size="16"/>
            </Transition>
            <Transition
                show={!mixUpdateSuccess}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                class="absolute"
            >
                <Icon src={PencilSquare} mini size="16"/>
            </Transition>
        </button>

        <button class="block" slot="item" let:item let:i on:click={() => doCallback(i)}>
            <div class={"w-full py-1 px-4 flex justify-start items-center z-50 text-base " + (item.color) }>
                <Icon src={item.icon} class="inline-block mr-2" size="16" />
                <p class="inline-block whitespace-nowrap">{item.text}</p>
            </div>
        </button>

    </DropdownMenu>

</div>

<EditMixNameModal bind:show={showEditNameModal} onsubmit={doEditName} name={choice.name || ""}/>
<DeleteMixModal bind:show={showDeleteMixModal} onsubmit={doDeleteMix} preset={choice} />
