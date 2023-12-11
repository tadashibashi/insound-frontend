<script lang="ts">
    import WidgetLabel from "./WidgetLabel.svelte";
    import NumberInput from "./NumberInput.svelte";
    import { NumberParameter } from "audio/params/types/NumberParameter";

    import { onMount } from "svelte";
    import { util } from "app/util";

    export let param: NumberParameter;

    let rotation: number = 0;

    let button: HTMLButtonElement;
    let isDragging: boolean = false;
    let isHovering: boolean = false;

    let showNumberInput = false;

    let AngleMax = 35;
    let AngleMin = 145;
    $: AngleDistance = (AngleMax < AngleMin) ?
            AngleMax + 360 - AngleMin :
            AngleMax - AngleMin;

    const id: string = "param-" + param.name + '-' + util.genRandHex(6);


    function inputChangeHandler(value: number)
    {
        param.value = value;
        if (param.wasUpdated)
        {
            rotation = valueToAngle(param.value);
            return true;
        }
        else
        {
            return false;
        }
    }

    function mouseEnterHandler()
    {
        isHovering = true;
        showNumberInput = true;
    }

    function mouseLeaveHandler()
    {
        isHovering = false;
        if (!isDragging)
            showNumberInput = false;
    }

    function dblclickHandler(evt: MouseEvent)
    {
        if (evt.metaKey)
        {
            param.value = param.defaultValue;
            if (param.wasUpdated)
                rotation = valueToAngle(param.value);
        }
    }

    function mousedownHandler(evt: MouseEvent)
    {
        isDragging = true;
    }

    function mouseupHandler(evt: MouseEvent)
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

        let angle = posToAngle(evt.x, evt.y);
        if (angle > AngleMax && angle < AngleMin)
        {
            if (Math.abs(angle - AngleMin) < Math.abs(angle - AngleMax))
                angle = AngleMin;
            else
                angle = AngleMax;
        }

        param.value = angleToValue(angle);
        if (param.wasUpdated)
        {
            rotation = angle;
        }
    }

    function posToAngle(clickX: number, clickY: number): number
    {
        const rect = button.getBoundingClientRect();
        const centerX = rect.x + (rect.width / 2);
        const centerY = rect.y + (rect.height / 2);

        const angle = Math.atan2(clickY - centerY, clickX - centerX);
        const deg = angle * 180 / Math.PI;
        return (deg + 720) % 360; // bring degrees into positive range
    }

    function angleToValue(angle: number)
    {
        if (angle < AngleMin)
            angle += 360;
        const percentage = (angle - AngleMin) / AngleDistance;

        const paramDistance = param.max - param.min;
        return percentage * paramDistance + param.min;
    }

    function valueToAngle(value: number)
    {
        const percentage = (value - param.min) / (param.max - param.min);

        return percentage * AngleDistance + AngleMin;

    }

    onMount(() => {
        document.addEventListener("mousemove", mousemoveHandler);
        document.addEventListener("mouseup", mouseupHandler);

        rotation = valueToAngle(param.value);

        return () => {
            document.removeEventListener("mousemove", mousemoveHandler);
            document.removeEventListener("mouseup", mouseupHandler);
        };
    });
</script>

<div class={$$props.class || "" + "select-none"}
    role="group"
    on:mouseenter={mouseEnterHandler}
    on:mouseleave={mouseLeaveHandler}
    on:dblclick={dblclickHandler}
>
    <WidgetLabel for={id} name={param.name} />

    <!-- Dial -->
    <div class="relative">
        <!-- Shadows -->
        <div class="shadow-top absolute rounded-full w-full shadow-md aspect-square"></div>
        <div class="absolute rounded-full w-full shadow aspect-square"></div>
        <div class="absolute rounded-full w-full shadow-lg aspect-square"></div>

        <!-- Tick Marks -->
        <div>
            <div
                class="absolute flex items-center justify-end w-full aspect-square"
                style={`transform: rotate(${AngleMax}deg);`}>
                <div class="h-[1px] w-1 bg-gray-200 -mr-2"></div>
            </div>
            <div class="absolute flex items-center justify-end w-full aspect-square"
                style={`transform: rotate(${AngleMin}deg);`}>
                <div class="h-[1px] w-1 bg-gray-200 -mr-2"></div>
            </div>
            <!-- default value mark -->
            <div class="absolute flex items-center justify-end w-full aspect-square"
                style={`transform: rotate(${valueToAngle(param.defaultValue)}deg);`}>
                <div class="arrow-right -mr-2" style="transform: scale(.8)"></div>
            </div>
        </div>

        <!-- Main knob -->
        <button
            class={"rounded-full w-full border border-gray-200 bg-[#fcfcfc] aspect-square flex items-center justify-end ring-inset ring-2 ring-gray-100 z-10"}
            bind:this={button}
            on:mousedown={mousedownHandler}
            style={`transform: rotate(${rotation}deg);`}
            >
            <!-- Arrow mark -->
            <div class="arrow-right w-2 h-2 mr-1 drop-shadow-sm"></div>
        </button>

    </div>

    <!-- Input text box -->
    <NumberInput id={id} value={param.value} min={param.min} max={param.max}
        step={param.step}
        onchange={inputChangeHandler} show={showNumberInput} delayHide={500} />
</div>


<style>
    .shadow-top {
        box-shadow: 0px -2px 4px 4px rgb(25 25 25 / .008);
    }
    .arrow-right {
        width: 0;
        height: 0;
        border-top: 3px solid transparent;
        border-bottom: 3px solid transparent;

        border-left: 6px solid #eee;
    }



</style>
