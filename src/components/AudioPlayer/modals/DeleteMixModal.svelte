<script lang="ts">
    import Modal from "app/components/Modal.svelte";
    import { ExclamationTriangle, Icon, XMark } from "svelte-hero-icons";

    export let onsubmit: ((preset: MixPreset) => void) | undefined = undefined;
    export let show = true;
    export let preset: MixPreset | undefined = undefined;

    function handleSubmit(evt: SubmitEvent)
    {
        evt.preventDefault();

        if (onsubmit && preset)
        {
            onsubmit(preset);
            show = false;
        }
    }
</script>


<Modal bind:show={show} isCancellable={true}>
    <div class="w-full inset-0 fixed">

        <form class="relative bg-white rounded-md w-1/2 min-w-[300px] max-w-[600px] translate-x-[calc(50vw-50%)] mt-[24vmin] p-6" on:submit={handleSubmit}>
            <!-- cancel button -->
            <button
                type="button"
                class="absolute top-1 right-1 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-400 p-1"
                on:click={() => show = false }
            >
                <Icon src={XMark} size="24" />
            </button>

            <div class="ModalGridOuter mb-4">
                <!-- Mix icon -->
                <Icon class="block text-center mx-auto rounded-full grid-cols-1 bg-red-100 p-[6px] text-red-400" src={ExclamationTriangle} size="40" />
                <div>
                    <!-- Title -->
                    <p class="text-left font-bold text-base text-gray-500 mb-3">Delete Mix Preset</p>

                    <div class="text-gray-400 text-sm">
                        Are you sure you want to delete
                        {#if preset}
                            <span class="font-bold text-gray-500 italic">{preset.name}</span>?
                        {:else}
                            the current preset?
                        {/if}

                        <p>This is a permanent action that cannot be undone.</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button
                    type="button"
                    class={"rounded-full px-3 py-1 text-base text-gray-200 border border-gray-200 cursor-pointer mr-3"}
                    on:click={() => show = false}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class={"rounded-full px-3 py-1 text-base bg-red-400 text-white cursor-pointer"}>
                    Delete
                </button>
            </div>

        </form>
    </div>
</Modal>

<style>
    .ModalGridOuter {
        display: grid;
        grid-template-columns: 1fr 6fr;
        column-gap: .8rem;
    }
</style>
