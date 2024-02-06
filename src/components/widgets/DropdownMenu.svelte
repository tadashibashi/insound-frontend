<script lang="ts">
    import { Menu, MenuButton, MenuItem, MenuItems, Transition
    } from "@rgossiaux/svelte-headlessui";
    import DropdownMenuExposer from "./DropdownMenuExposer.svelte";

    type T = $$Generic<{}>;

    // ----- Attributes -------------------------------------------------------
    /**
     * List of item options to show
     */
    export let items: T[];

    export let isOpen: boolean = false;

    /**
     * Class to place on the menu element
     * (It is appended to "fixed cursor-pointer")
     */
    export let dropdownClass: string = "bg-white border border-gray-50";

    /** Whether to prevent dropdown menu button from showing menu */
    export let disabled: boolean = false;

    export let onchoice: ((item: T, index: number) => void) | undefined = undefined;
</script>

<Menu class={($$props.class || "") + " z-50"} let:open >
    <DropdownMenuExposer open={open} bind:isOpen={isOpen} />
    <MenuButton on:click={e => e.stopPropagation()} class="flex items-center" disabled={disabled || items.length === 0}>
        <slot name="button" {open} />
    </MenuButton>

    <Transition
        class="relative z-50"
        enter="transition-all ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition-all ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
    >
        <MenuItems
            class={"fixed cursor-pointer " + dropdownClass}
            on:click={e => e.stopPropagation()}
        >
            {#each items as item, i (item)}
                <MenuItem on:click={evt => { if (onchoice) onchoice(item, i); }}>
                    <slot name="item" {open} {item} {i} />
                </MenuItem>
            {/each}
        </MenuItems>
    </Transition>
</Menu>
