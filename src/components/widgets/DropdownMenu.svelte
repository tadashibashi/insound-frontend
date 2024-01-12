<script lang="ts">
    import { Menu, MenuButton, MenuItem, MenuItems, Transition
    } from "@rgossiaux/svelte-headlessui";

    // ----- Attributes -------------------------------------------------------
    /**
     * List of item options to show
     */
    export let items: string [] = [];

    export let dropdownClass: string = "bg-white border border-gray-50";

    // ----- State ------------------------------------------------------------

    let isOpen: boolean = false;
    let isHovering: boolean = false;
    let isDown: boolean = false;

    let show: boolean = true;

    /** Current selection index within the `items` array. */
    let selection: number = 0;

    // ----- Helpers ----------------------------------------------------------

    // ----- Event handlers ---------------------------------------------------
    function handleClickBtn(evt: Event)
    {

    }
</script>

<Menu class={$$props.class ?? "" + " z-50"}>
    <MenuButton>
        <slot name="button" />
    </MenuButton>

    <MenuItems class={"fixed cursor-pointer " + dropdownClass}>
        {#each items as item, i ("choice-" + item)}
            <MenuItem ><slot name="item" {item} {i} /></MenuItem>
        {/each}
    </MenuItems>
    <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
    >
       
    </Transition>
</Menu>
