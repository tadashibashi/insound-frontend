<script lang="ts">
    import {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogOverlay
    } from "@rgossiaux/svelte-headlessui";
    import { onMount } from "svelte";

    export let show: boolean;
    export let isCancellable: boolean = true;

    export let onclose = () => {};
    export let onopen = () => {};

    onMount(() => {

        function handleKeyDown(evt: KeyboardEvent)
        {
            if (show && isCancellable && evt.key === "Escape")
            {
                show = false;
                evt.preventDefault();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

</script>

<TransitionRoot as="div" show={show} class="fixed">
    <Dialog as="div" class="relative z-50" open={show}>
        <!-- Background -->
        <TransitionChild
            as="div"
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            on:introstart={onopen}
            on:outroend={onclose}
            class="z-50"
        >
            <button type="button"
                class="fixed z-50 inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                on:click={() => { if (isCancellable) show = false }}>
            </button>
        </TransitionChild>

        <!-- Content -->
        <DialogOverlay class="fixed inset-0 z-50 w-screen overflow-hidden">
            <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4"
                class="w-full h-full flex justify-items items-center z-50"
            >
                <slot />
            </TransitionChild>
        </DialogOverlay>
    </Dialog>
</TransitionRoot>
