<script lang="ts">
    export let name: string;
</script>

<label
    aria-label="parameter label"
    for={$$props["for"]}
    class={$$props["class"] || "WidgetLabel block text-center text-xs text-gray-200 mb-1 select-none"}>
    {name}
</label>

<style>
    label.WidgetLabel {
        text-shadow: 2px 2px 1px #00000008;
    }
</style>
