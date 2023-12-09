<script lang="ts">
    // Minimum input value
    export let min: number | undefined = undefined;

    // Maximum input value
    export let max: number | undefined = undefined;

    // Stride interval between each number
    export let step: number | undefined = undefined;

    // Current value of the parameter
    export let value: number;

    // Callback handles input number changes, return if value was applied.
    // If `true`, displayed number updates, otherwise it will not.
    export let onchange: (value: number) => boolean;

    /**
     * Handles input changes, and applies user-provided callback if a valid
     * value was received.
     */
    function changeHandler(evt: Event)
    {
        const target = evt.currentTarget as HTMLInputElement | null;
        if (!target) return;

        const val = Number(target.value);
        if (isNaN(val))
        {
            target.value = value.toString();
            return;
        }

        if (!onchange(val))
        {
            // Revert back to last value if value was not applied
            target.value = value.toString();
        }
    }
</script>

<div class="w-full">
    <input
        class="w-full text-xs text-center text-gray-200 font-bold pl-4"
        min={min}
        max={max}
        step={step}
        type="number"
        value={value}
        on:change={changeHandler}
        />
</div>
