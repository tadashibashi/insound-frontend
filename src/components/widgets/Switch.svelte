<script lang="ts">
    import { Switch } from "@rgossiaux/svelte-headlessui";
    import { onMount } from "svelte";

    export let enabled: boolean = true;

    /**
     * Description of switch's function visible only to screen readers
     */
    export let description: string = "";

    export let id: string | undefined = undefined;

    function clickHandler()
    {
        enabled = !enabled;
    }

    onMount(() => {
        if (id)
        {
            const labels = document.querySelectorAll(`[for='${id}']`);
            labels.forEach(label => {
                label.addEventListener("click", clickHandler);
            });
        }

        return () => {
            if (id)
            {
                const labels = document.querySelectorAll(`[for='${id}']`);
                labels.forEach(label => {
                    label.removeEventListener("click", clickHandler);
                });
            }
        };
    });
</script>

<Switch
    id={id}
    checked={enabled}
    on:click={clickHandler}
    class={`${enabled ? 'bg-violet-500' : 'bg-gray-200'}
      relative inline-flex h-[25px] w-[46px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
    >
    {#if description.length > 0}
    <span class="sr-only">{description}</span>
    {/if}
    <span
      aria-hidden="true"
      class={`${enabled ? 'translate-x-5' : 'translate-x-0'}
        pointer-events-none inline-block h-[21px] w-[21px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
    />
</Switch>
