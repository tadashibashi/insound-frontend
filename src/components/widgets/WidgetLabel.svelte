<script lang="ts">
    export let name: string;
    export let size: string = "";
</script>

<label
    aria-label="parameter label"
    for={$$props["for"]}
    class={$$props["class"] || "WidgetLabel text-center text-gray-200 mb-1 select-none " + size}>
    {name}
</label>

<style>
    label.WidgetLabel {
        text-shadow: -1px -1px 1px #00000009;
    }
</style>
