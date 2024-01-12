<script lang="ts">
    export let playing: boolean;
</script>

<div class={$$props.class}>
    <button class="aspect-square">
    {#if playing}
        <div class="Play" />
    {:else}
        <div class="Pause" />
    {/if}
    </button>
</div>

<style>
    .Play {

    }
</style>
