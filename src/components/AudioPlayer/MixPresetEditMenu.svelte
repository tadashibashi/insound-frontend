<script lang="ts">
    // Edit menu
    // 1.  Update Preset (ArrowPath)
    // 2.  Delete Preset (Trash)

    import { ArrowPath, Icon, PencilSquare, Trash, type IconSource, ChatBubbleLeftEllipsis } from "svelte-hero-icons";
    import DropdownMenu from "../widgets/DropdownMenu.svelte";
    import Modal from "../Modal.svelte";

    export let doUpdateName: ((name: string) => void) | undefined = undefined;
    export let doPatchMix: (() => void) | undefined = undefined;
    export let doDeleteMix: (() => void) | undefined = undefined;

    const menuItems = ["Update Mix", "Edit Name", "Delete Mix"];
    const icons: (null | IconSource)[] = [ArrowPath, ChatBubbleLeftEllipsis, Trash];
    const iconColors: string[] = ["hover:text-green-300", "hover:text-gray-400", "hover:text-red-300"];

    let showEditNameModal = false;
    let name: string = "";

    function doCallback(index: number)
    {
        switch(index)
        {
        case 0:
            if (doPatchMix)
                doPatchMix();
            break;
        case 1:
            if (doUpdateName)
                doUpdateName(name);
            break;
        case 2:
            if (doDeleteMix)
                doDeleteMix();
            break;
        default:
            console.error("Invalid callback index provided to MixPresetEditMenu");
            break;
        }
    }

</script>

<Modal show={showEditNameModal}>

</Modal>


<div class={($$props.class || "") + " pointer-events-auto"}>

    <DropdownMenu class="relative text-gray-200 group" items={menuItems} dropdownClass="bg-white rounded-md shadow-md py-1 absolute right-0 w-[112px]">

        <button slot="button" let:open class={"flex justify-center items-center rounded-md w-[22px] h-[22px] group-hover:bg-gray-400 " + (open ? "bg-gray-400" : "")}>
            <Icon src={PencilSquare} mini size="16"/>
        </button>

        <button slot="item" let:item let:i on:click={() => doCallback(i)}>
            <div class={"py-1 px-2 flex items-center z-50 text-sm " + (iconColors[i]) }>
                <Icon src={icons[i]} class="inline-block me-1" size="16" />
                <p class="inline-block">{item}</p>
            </div>
        </button>

    </DropdownMenu>

</div>
