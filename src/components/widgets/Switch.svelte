<script lang="ts">
    import { Switch } from "@rgossiaux/svelte-headlessui";

    export let enabled: boolean = true;

    /**
     * Description of switch's function visible only to screen readers
     */
    export let description: string = "";

</script>

<div class="py-16">
  <Switch
    checked={enabled}
    on:click={() => enabled = !enabled}
    class={`${enabled ? 'bg-violet-900' : 'bg-gray-200'}
      relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
  >
    {#if description.length > 0}
    <span class="sr-only">{description}</span>
    {/if}
    <span
      aria-hidden="true"
      class={`${enabled ? 'translate-x-9' : 'translate-x-0'}
        pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
    />
  </Switch>
</div>
