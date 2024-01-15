<script lang="ts">
    import Modal from "app/components/Modal.svelte";
    import { AdjustmentsVertical, Icon, XMark } from "svelte-hero-icons";

    export let onsubmit: ((name: string, copyCurrent: boolean) => void) | undefined = undefined;
    export let show = true;

    let name: string = "";

    function handleSubmit(evt: SubmitEvent)
    {
        evt.preventDefault();

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
    <div class="w-full h-full fixed flex items-center justify-center">

        <form class="relative bg-white rounded-md w-1/2 min-w-[200px] h-auto pt-4 pb-4" on:submit={handleSubmit}>
            <!-- cancel button -->
            <button
                class="absolute top-1 right-1 rounded-full hover:bg-gray-100 transition-colors duration-300 text-gray-400 p-1"
                on:click={() => show = false }
            >
                <Icon src={XMark} size="24" />
            </button>

            <!-- Mix icon -->
            <Icon class="block text-center mx-auto text-gray-400" src={AdjustmentsVertical} size="36" />

            <!-- Title -->
            <p class="text-center text text-gray-500 mb-3">New Mix Preset</p>

            <!-- Name text input -->
            <label class="w-full flex justify-center text-sm">
                <p class="inline mr-2 text-gray-400">Name</p>
                <input class="px-2 border border-gray-100 rounded-sm" type="text" bind:value={name} minlength="1" />
            </label>

            <!-- Mix source radio input -->
            <div class="text-sm w-auto translate-x-[calc(50%-68px)]">
                <label class="block">
                    <input type="radio" name="mix-source" checked value="current" />
                    <p class="inline mr-2 text-gray-400">Copy current settings</p>
                </label>

                <label class="block">
                    <input type="radio" name="mix-source" value="default" />
                    <p class="inline mr-2 text-gray-400">New default mix</p>
                </label>
            </div>

            <button
                type="submit"
                class={"block mx-auto rounded-full mt-4 mb-2 px-2 py-1 text-sm " + (name.length > 0 ? "bg-violet-400 text-white cursor-pointer" : "bg-gray-100 text-gray-50 cursor-not-allowed")}>
                Add Mix
            </button>
        </form>
    </div>
</Modal>
