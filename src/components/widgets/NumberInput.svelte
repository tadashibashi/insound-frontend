<script lang="ts">
    import { onMount } from "svelte";

    // Minimum input value
    export let min: number | undefined = undefined;

    // Maximum input value
    export let max: number | undefined = undefined;

    // Stride interval between each number
    export let step: number | undefined = undefined;

    // Current value of the parameter
    export let value: number;

    // Show/hide
    export let show: boolean = true;

    let focused: boolean = false;
    let hovered: boolean = false;

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

<div class={($$props.class || "") + (show || focused ? "visible" : "invisible")
    + " select-none"}>
    <input
        class={"w-full text-center text-gray-200 " +
            (hovered || focused ? "hovered" : "") +
            (focused ? (" font-bold") : " font-light")}
        min={min}
        max={max}
        step={step}
        type="number"
        value={value}
        on:change={changeHandler}
        on:focus={() => focused = true}
        on:blur={() => focused = false}
        on:mouseenter={() => hovered = true}
        on:mouseleave={() => hovered = false}
        />
</div>

<style>
    input[type="number"] {
        font-size: .6rem;
        margin:  0;
        appearance:  textfield;
        -moz-appearance: textfield;
    }
    input[type="number"].hovered {
        appearance: auto;
        -moz-appearance: auto;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    input.hovered::-webkit-outer-spin-button,
    input.hovered::-webkit-inner-spin-button {
        -webkit-appearance: auto;
    }



</style>
