<script lang="ts">
   export let step: number;
   export let value: number;
   export let onchange: (evt: Event) => void;
</script>

<div class="w-full">
    <input
        class="w-full text-xs text-center text-gray-200 font-bold pl-4"
        step={step}
        type="number"
        value={value}
        on:change={onchange}
        />
</div>
