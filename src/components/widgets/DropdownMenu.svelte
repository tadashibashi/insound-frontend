<script lang="ts">
    import { Menu, MenuButton, MenuItem, MenuItems, Transition
    } from "@rgossiaux/svelte-headlessui";

    // ----- Attributes -------------------------------------------------------
    /**
     * List of item options to show
     */
    export let items: string[];

    export let dropdownClass: string = "bg-white border border-gray-50";

</script>

<Menu class={($$props.class || "") + " z-50"} let:open>
    <MenuButton class="flex items-center" disabled={items.length === 0} on:click={e => e.stopPropagation()}>
        <slot name="button" {open} />
    </MenuButton>

    <Transition
        class="relative"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
    >
        <MenuItems
            class={"fixed cursor-pointer " + dropdownClass}
            on:click={e => e.stopPropagation()}
        >
            {#each items as item, i ("choice-" + i + "-" + item)}
                <MenuItem on:click={e => e.stopPropagation()} ><slot name="item" {open} {item} {i} /></MenuItem>
            {/each}
        </MenuItems>
    </Transition>
</Menu>
