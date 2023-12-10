<script lang="ts">
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

    // Time to delay triggering shift from show -> hide
    export let delayHide: number = 0;

    // Callback handles input number changes, return if value was applied.
    // If `true`, displayed number updates, otherwise it will not.
    export let onchange: (value: number) => boolean;

    export let id: string | undefined = undefined;

    let focused: boolean = false;

    let hideTimeout: NodeJS.Timeout | null = null;

    let isShowing: boolean = show;

    $: if (show || focused)
    {
        if (hideTimeout)
        {
            clearTimeout(hideTimeout);
        }

        isShowing = true;
    }
    else
    {
        if (hideTimeout)
        {
            clearTimeout(hideTimeout);
        }

        if (delayHide)
        {
            hideTimeout = setTimeout(() => {
                isShowing = false;
                hideTimeout = null;
            }, delayHide);
        }
        else
        {
            isShowing = false;
        }
    }

    /**
     * Handles input changes, and applies user-provided callback if a valid
     * value was received.
     */
    function changeHandler(evt: Event)
    {
        const target = evt.currentTarget as HTMLInputElement | null;
        if (!target) return;
        if (target.value === "") // number box behavior when NaN value
        {
            target.value = value.toString();
            return;
        }

        const val = Number(target.value);
        if (isNaN(val)) // extra NaN check just in case
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

<div class={($$props.class || "") +
    (isShowing ? "visible" : "invisible")
    + " select-none"}>

    <input
        id={id}
        class={"w-full text-center font-light text-gray-200 " +
            (focused ? "focused" : "")}
        min={min}
        max={max}
        step={step}
        type="number"
        value={value}
        on:change={changeHandler}
        on:focus={() => focused = true}
        on:blur={() => focused = false}
        />

</div>

<style>
    input[type="number"] {
        font-size: .6rem;
        margin:  0;
        appearance:  textfield;
        -moz-appearance: textfield;
        padding: 1px 0px;
        border-radius: 4px;
    }
    input[type="number"].focused {
        appearance: auto;
        -moz-appearance: auto;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    input.focused::-webkit-outer-spin-button,
    input.focused::-webkit-inner-spin-button {
        -webkit-appearance: auto;
    }



</style>
