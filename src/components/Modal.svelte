<script lang="ts">
    import {
        TransitionRoot,
        TransitionChild,
        Dialog
    } from "@rgossiaux/svelte-headlessui";

    export let show: boolean;
    export let isCancellable: boolean = true;

    export let onClose = () => {};

</script>

<TransitionRoot show={show} class="w-full h-full overflow-hidden">
    <Dialog as="div" class="z-10" on:close={onClose}>
        <!-- Background -->
        <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            on:click={() => { if (isCancellable) show = !show; }}
        >
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
        </TransitionChild>

        <!-- Content -->
        <div class="fixed inset-0 z-10 w-screen">
            <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4"
                class="w-full h-full flex justify-items items-center"
            >
                <slot />
            </TransitionChild>
        </div>
    </Dialog>
</TransitionRoot>
