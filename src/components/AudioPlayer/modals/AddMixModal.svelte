<script lang="ts">
    import Modal from "app/components/Modal.svelte";
    import { AdjustmentsVertical, Icon, XMark } from "svelte-hero-icons";

    export let onsubmit: ((name: string, copyCurrent: boolean) => void) | undefined = undefined;
    export let show = true;

    let name: string = "";

    function handleSubmit(evt: SubmitEvent)
    {
        evt.preventDefault();

        if (!name) return;

        const checked = document.querySelector("input[name='mix-source']:checked") as HTMLInputElement;
        if (!checked)
            throw Error("Could not find mix-source checked element");

        if (onsubmit)
        {
            onsubmit(name, (checked.value === "current"));
            show = false;
        }
    }
</script>


<Modal bind:show={show} isCancellable={true} onopen={() => name = ""}>
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

            <div class="ModalGridOuter mb-3">
                <!-- Mix icon -->
                <Icon class="block mx-auto rounded-full bg-violet-100 text-violet-300 p-[6px]" src={AdjustmentsVertical} size="40" />

                <!-- Right side -->
                <div>
                    <!-- Title -->
                    <p class="sm:text-left text-center sm:mt-0 mt-1 mb-3 text text-gray-500 text-base font-bold">Create Mix Preset</p>
                    <!-- <p class="text-xs text-left sm:text-left text-center text-gray-300 mb-2">Add a new preset to the mix list</p> -->

                    <!-- Name text input -->
                    <label class="w-full text-sm text-gray-500 flex flex-col">
                        <p class="mb-1 text-sm">Name</p>
                        <input class="px-2 py-1 border border-gray-100 rounded-md" type="text" bind:value={name} minlength="1" required />
                    </label>

                    <!-- Mix source radio input -->
                    <label for="mix-source" class="block mt-3 selection-none">
                        <p class="text-gray-500 text-sm">Source</p>
                        <p class="text-gray-300 text-xs">From where should the settings be created?</p>
                    </label>
                    <div class="text-sm w-auto my-1 inline-flex flex-col items-start mx-auto">
                        <label class="block">
                            <input type="radio" name="mix-source" checked value="current" />
                            <p class="inline ml-1 text-gray-400">Current mix settings</p>
                        </label>

                        <label class="block">
                            <input type="radio" name="mix-source" value="default" />
                            <p class="inline ml-1 text-gray-400">New default mix</p>
                        </label>
                    </div>
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
                    class={"rounded-full px-3 py-1 text-sm sm:text-base bg-violet-400 text-white cursor-pointer"}>
                    Create
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
