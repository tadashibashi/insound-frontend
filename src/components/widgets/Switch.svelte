<script lang="ts">
    import { Switch } from "@rgossiaux/svelte-headlessui";
    import { onMount } from "svelte";

    export let enabled: boolean = true;

    /**
     * Description of switch's function visible only to screen readers
     */
    export let description: string = "";

    export let id: string | undefined = undefined;

    export let width = "46px";
    export let height = "25px";
    export let xpad = "5%";

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
    class={`${enabled ? 'bg-violet-300' : 'bg-gray-200'} relative shadow-inner inline-flex items-center shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
    style={`height: ${height}; width: ${width};`}
    >

    {#if description.length > 0}
    <span class="sr-only">{description}</span>
    {/if}
    <span
        aria-hidden="true"
        class={`pointer-events-none h-full relative aspect-square inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        style={`
            transform: translateX( ${ enabled ? `calc(${width} - calc(${height} + ${xpad}))` : xpad} );
        `}

    />
</Switch>
