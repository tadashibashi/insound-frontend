<script lang="ts">
    import { Transition } from "@rgossiaux/svelte-headlessui";
    import { Icon, Cog } from "svelte-hero-icons";

    export let show: boolean = true;

</script>

<span class={($$props.class || "inline-block w-4 h-full")}
>
    <!-- Fade and scale in/out -->
    <Transition
        {show}
        as="div"
        enter="transition-opacity transition-transform duration-300"
        enterFrom="opacity-0 scale-0 w-0"
        enterTo="opacity-100 scale-100 w-full"
        leave="transition-opacity transition-transform duration-300"
        leaveFrom="opacity-100 scale-100 w-full"
        leaveTo="opacity-0 scale-0 w-0"
        class="flex justify-center items-center"
    >
        <Icon class="animate-spin inline-block" src="{Cog}" mini />
    </Transition>
</span>

