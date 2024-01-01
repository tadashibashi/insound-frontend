<script lang="ts">
    import {
        TransitionRoot,
        TransitionChild,
        Dialog
    } from "@rgossiaux/svelte-headlessui";
    import { onMount } from "svelte";

    export let show: boolean;
    export let isCancellable: boolean = true;

    export let onClose = () => {};

    onMount(() => {

        function handleKeyDown(evt: KeyboardEvent)
        {
            if (show && isCancellable && evt.key === "Escape")
            {
                show = false;
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

</script>

<TransitionRoot as="div" show={show} class="w-full h-full overflow-hidden fixed" style="z-index: 100;">
    <Dialog as="div" class="z-50" on:close={onClose}>
        <!-- Background -->
        <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"

        >
            <button class="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity"
                on:click={() => { if (isCancellable) show = false }}/>
        </TransitionChild>

        <!-- Content -->
        <div class="fixed inset-0 z-50 w-screen">
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
        </div>
    </Dialog>
</TransitionRoot>
