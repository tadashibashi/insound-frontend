<script lang="ts">
    import WidgetLabel from "./WidgetLabel.svelte";
    import NumberInput from "./NumberInput.svelte";
    import { NumberParameter } from "audio/params/types/NumberParameter";
    import { onMount } from "svelte";

    export let param: NumberParameter;

    let fader: HTMLButtonElement;
    let trackLine: HTMLDivElement;

    let isDragging: boolean = false;
    let isHovering: boolean = false;

    let positionY: number = 0;

    // Fires when number box's input changes
    function inputChangeHandler(value: number) {
        param.value = value;
        if (param.wasUpdated)
        {
            // do something

            return true;
        }
        else
        {
            return false;
        }
    }

    // Utility to calculate value of a position
    function positionToValue(y: number)
    {
        const rect = trackLine.getBoundingClientRect();
        const faderRect = fader.getBoundingClientRect();
        return (y-rect.top) / (rect.height);
    }

    function valueToPosition(value: number)
    {

    }

    function mouseupHandler(evt: Event)
    {
        if (isDragging)
        {
            // do stuff

            isDragging = false;
        }
    }

    function mousemoveHandler(evt: MouseEvent)
    {
        if (!isDragging) return;

        const rect = trackLine.getBoundingClientRect();
        const faderRect = fader.getBoundingClientRect();

        // alter position and value
        positionY = Math.min(Math.max(evt.y-rect.top, 0),
            rect.height);
    }

    function faderMouseDownHandler(evt: Event)
    {
        isDragging = true;
    }

    function containerMouseEnterHandler(evt: Event)
    {
        isHovering = true;
    }

    function containerMouseLeaveHandler(evt: Event)
    {
        isHovering = false;
    }

    onMount(() => {
        document.addEventListener("mouseup", mouseupHandler);
        document.addEventListener("mousemove", mousemoveHandler);

        // cleanup
        return () => {
            document.removeEventListener("mouseup", mouseupHandler);
            document.removeEventListener("mousemove", mousemoveHandler);
        };
    });
</script>


<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={$$props.class}
    on:mouseenter={containerMouseEnterHandler}
    on:mouseleave={containerMouseLeaveHandler}
>
    <div class="flex flex-col items-center justify-center h-full w-full">
       <div class="w-full justify-center">

            <WidgetLabel name={param.name} />

            <!-- Slider -->
            <div class="w-full h-[100px] relative py-1">
                <!-- Track line -->
                <div class="rounded-full mx-auto w-1 h-full bg-gray-200 border border-l-gray-300 border-t-gray-300 border-r-gray-100 border-b-gray-100" bind:this={trackLine}>
                    <!-- Fader -->
                    <button
                        bind:this={fader}
                        class="block rounded-sm w-8 -mx-4 h-3 -my-2 ring-inset ring-[2px] ring-gray-50 bg-white shadow-md"
                        style={`transform: translateY(${positionY}px);`}
                        on:mousedown={faderMouseDownHandler}
                        >
                    </button>
                </div>
            </div>

            <NumberInput min={param.min} max={param.max} value={param.value}
                step={param.step} onchange={inputChangeHandler} />
        </div>
    </div>


</div>

<style>

</style>
