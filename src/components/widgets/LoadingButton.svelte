<script lang="ts">
    import SpinningGearIcon from "app/components/icons/SpinningGearIcon.svelte";

    export let isLoading: boolean = false;
    export let message: string = "";
    export let loadingMessage: string = "Loading";

    export let onClick: () => void = () => {};

</script>

<button class="rounded bg-violet-600 px-2 py-1 w-full" on:click={onClick}>
    <div class="flex items-center justify-center">
        <p class="text-center text-gray-100 font-bold">
            {isLoading ? loadingMessage : message}
            {#if isLoading}
            <SpinningGearIcon show={true}/>
            {/if}
        </p>
    </div>
</button>
