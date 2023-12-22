<script lang="ts">
    import WidgetLabel from "./WidgetLabel.svelte";
    import NumberInput from "./NumberInput.svelte";

    import { NumberParameter } from "audio/params/types/NumberParameter";
    import { onMount } from "svelte";
    import { util } from "app/util";

    // ----- Attributes -------------------------------------------------------

    /**
     * Parameter that this slider controls and represents
     */
    export let param: NumberParameter;

    /**
     * Height of the slider portion
     */
    export let height: string = "100px";


    // ----- State ------------------------------------------------------------

    let trackLine: HTMLDivElement;

    let isDragging: boolean = false;
    let isHovering: boolean = false;
    let showNumberInput: boolean = false;

    let positionY: number = 0;

    let defaultPositionY: number = 0;

    const id: string = "param-" + param.name + '-' + util.genRandHex(6);


    // ----- Helper functions -------------------------------------------------

    // Utility to calculate value of a position
    function positionToValue(y: number)
    {
        const rect = trackLine.getBoundingClientRect();
        let percentage = 1 - y / rect.height;
        if (percentage > 1) percentage = 1;
        if (percentage < 0) percentage = 0;

        return (param.max - param.min) * percentage + param.min;
    }


    // ----- Event handlers ---------------------------------------------------

    // Convert value to vertical slider position
    function valueToPosition(value: number)
    {
        if (!trackLine) return 0;
        const rect = trackLine.getBoundingClientRect();
        let percentage = 1 - (value - param.min) / (param.max - param.min);
        if (percentage > 1) percentage = 1;
        if (percentage < 0) percentage = 0;

        return percentage * rect.height;
    }

    // Fires when number box's input changes
    function inputChangeHandler(value: number)
    {
        param.value = value;
        if (param.wasUpdated)
        {
            // do something
            positionY = valueToPosition(param.value);
            return true;
        }
        else
        {
            return false;
        }
    }

    function mouseupHandler(evt: Event)
    {
        if (isDragging)
        {
            isDragging = false;
            if (!isHovering && showNumberInput)
                showNumberInput = false;
        }
    }

    function mousemoveHandler(evt: MouseEvent)
    {
        if (!isDragging) return;

        const rect = trackLine.getBoundingClientRect();

        // alter position and value
        positionY = Math.min(Math.max(evt.y-rect.top, 0),
            rect.height);
        param.value = positionToValue(positionY);
    }

    function faderMouseDownHandler(evt: Event)
    {
        isDragging = true;
    }

    function containerMouseEnterHandler(evt: Event)
    {
        isHovering = true;
        showNumberInput = true;
    }

    function containerMouseLeaveHandler(evt: Event)
    {
        isHovering = false;
        if (!isDragging)
            showNumberInput = false;
    }

    function containerDblClickHandler(evt: MouseEvent)
    {
        if (evt.metaKey)
        {
            param.value = param.defaultValue;
            positionY = valueToPosition(param.value);
        }
    }

    function handleSetCallback(index: number, value: number)
    {
        positionY = valueToPosition(value);
        param = param;
    }

    onMount(() => {
        document.addEventListener("mouseup", mouseupHandler);
        document.addEventListener("mousemove", mousemoveHandler);

        positionY = valueToPosition(param.value);
        defaultPositionY = valueToPosition(param.defaultValue);

        param.addSetCallback(handleSetCallback);
        // cleanup
        return () => {
            document.removeEventListener("mouseup", mouseupHandler);
            document.removeEventListener("mousemove", mousemoveHandler);

            param.removeSetCallback(handleSetCallback);
        };
    });
</script>


<div class={$$props.class}
    role="group" aria-roledescription="houses a ui slider"
    on:mouseenter={containerMouseEnterHandler}
    on:mouseleave={containerMouseLeaveHandler}
    on:dblclick={containerDblClickHandler}
>
    <div class="flex flex-col items-center justify-center h-full w-24 select-none">
       <div class="w-full justify-center">
            <div class="overflow-visible">
                <WidgetLabel name={param.name} for={id} />
            </div>


            <!-- Slider -->
            <div aria-roledescription="slider" class="w-full relative py-1 mb-1"
                style={`height: ${height};`}>
                <!-- Track line -->
                <div class="relative rounded-full mx-auto w-1 h-full bg-gray-200 border border-l-gray-300 border-t-gray-300 border-r-gray-100 border-b-gray-100"
                    bind:this={trackLine}
                >
                    <!-- Fader -->
                    <button
                        role="slider"
                        aria-valuenow={param.value}

                        class="absolute fader block rounded-sm w-8 -mx-4 h-3 -my-2 shadow-lg shadow-gray-400"
                        style={`transform: translateY(${positionY}px);`}

                        on:mousedown={faderMouseDownHandler} />
                    <div
                        class="absolute arrow-left ml-1 pointer-events-none -z-10"
                        style={`transform: translateY(${defaultPositionY}px);`}/>
                </div>
            </div>
            <div class="overflow-visible">
               <NumberInput id={id} min={param.min} max={param.max} value={param.value}
                step={param.step} onchange={inputChangeHandler}
                show={showNumberInput} delayHide={500}/>
            </div>

        </div>
    </div>
</div>

<style>
    .fader {
        background: linear-gradient(90deg, #ffffffff, #f8f9faff);
        border-top:  2px solid rgb(255, 255, 255);
        border-bottom: 3px solid rgb(230, 230, 230);
    }
    .arrow-left {
        width: 0;
        height: 0;
        border-top: 2px solid transparent;
        border-bottom: 2px solid transparent;

        border-right: 6px solid #eee;
    }
</style>
