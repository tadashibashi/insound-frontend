<script lang="ts">
    import Modal from "app/components/Modal.svelte";
    import { ChatBubbleLeftEllipsis, Icon, XMark } from "svelte-hero-icons";

    export let onsubmit: ((name: string) => void) | undefined = undefined;
    export let show = true;

    export let name: string = "";

    function handleSubmit(evt: SubmitEvent)
    {
        evt.preventDefault();

        if (!name) return;

        if (onsubmit)
        {
            onsubmit(name);
            show = false;
        }
    }
</script>

<Modal bind:show={show} isCancellable={true}>
    <div class="w-full h-full fixed">

        <form
            class="relative bg-white rounded-md sm:w-[360px] w-[300px] px-6 py-6 translate-x-[calc(50vw-50%)] mt-[24vmin] shadow-lg"
            on:submit={handleSubmit}
        >
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
                <Icon class="block mx-auto rounded-full bg-emerald-100 text-emerald-300 p-[6px]" src={ChatBubbleLeftEllipsis} size="40" />

                <!-- Right side -->
                <div>
                    <!-- Title -->
                    <p class="sm:text-left text-center sm:mt-0 mt-1 mb-3 text text-gray-500 text-base font-bold">Edit Preset Name</p>
                    <!-- <p class="text-xs text-left sm:text-left text-center text-gray-300 mb-2">Add a new preset to the mix list</p> -->

                    <!-- Name text input -->
                    <label class="w-full text-sm text-gray-500 flex flex-col">
                        <input class="px-2 py-1 border border-gray-100 rounded-md" type="text" bind:value={name} minlength="1" required />
                    </label>
                </div>
            </div>

            <div class="flex justify-center flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    class={"rounded-full py-1 px-3 text-sm sm:text-base text-gray-200 border border-gray-200 cursor-pointer"}
                    on:click={() => show = false}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class={"rounded-full px-3 py-1 text-sm sm:text-base bg-emerald-400 text-white cursor-pointer"}>
                    Update
                </button>
            </div>
        </form>
    </div>
</Modal>

<style>
    .ModalGridOuter {
        display: grid;
        grid-template-columns: 1fr 6fr;
        column-gap: .6rem;
    }
    @media(max-width: 640px) {
        .ModalGridOuter {
            display: flex;
            flex-direction: column;
            column-gap: .6rem;
            text-align: center;
        }
    }

</style>
