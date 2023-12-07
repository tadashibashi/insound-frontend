<script lang="ts">
    import { NumberParameter } from "audio/params/types/NumberParameter";
    import { onMount } from "svelte";

    export let param: NumberParameter;

    let rotation: number = 0;

    let button: HTMLButtonElement;
    let isDragging: boolean = false;

    let AngleMax = 35;
    let AngleMin = 145;
    $: AngleDistance = (AngleMax < AngleMin) ?
            AngleMax + 360 - AngleMin :
            AngleMax - AngleMin;

    function inputValueHandler(evt: Event)
    {
        const target = evt.currentTarget as HTMLInputElement;
        const angle = valueToAngle(param.value);

        param.value = Number(target.value);
        if (param.wasUpdated)
        {
            rotation = angle;
            console.log(param.value);
        }
    }

    function mousedownHandler(evt: MouseEvent)
    {
        isDragging = true;
    }

    function mouseupHandler(evt: MouseEvent)
    {
        isDragging = false;
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

        param.value = getValue(angle);
        if (param.wasUpdated)
        {
            rotation = angle;
            console.log(param.value);
        }
    }

    function posToAngle(clickX: number, clickY: number): number
    {
        const rect = button.getBoundingClientRect();
        const centerX = rect.x + (rect.width / 2);
        const centerY = rect.y + (rect.height / 2);
        const x = clickX - centerX;
        const y = clickY - centerY;

        const angle = Math.atan2(y, x);
        const deg = angle * 180 / Math.PI;
        return (deg + 720) % 360;
    }

    function getValue(angle: number)
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

<div class={$$props.class}>
    <div>
        <p class="text-center text-gray-200">{param.name}</p>
        <div class="relative">
            <!-- Shadows -->
            <div class="shadow-top absolute rounded-full w-full shadow-md aspect-square -z-10"></div>
            <div class="absolute rounded-full w-full shadow-md aspect-square -z-10"></div>
            <!-- Tick Marks -->
            <div>
                <div class="absolute flex items-center justify-end w-full aspect-square"
                    style={`transform: rotate(${AngleMax}deg);`}>
                    <div class="h-[1px] w-1 bg-gray-200 -mr-2"></div>
                </div>
                <div class="absolute flex items-center justify-end w-full aspect-square"
                    style={`transform: rotate(${AngleMin}deg);`}>
                    <div class="h-[1px] w-1 bg-gray-200 -mr-2"></div>
                </div>
            </div>

            <button
                class={"rounded-full w-full border border-gray-50 aspect-square flex items-center justify-end"}
                bind:this={button}
                on:mousedown={mousedownHandler}
                style={`transform: rotate(${rotation}deg);`}
                aria-roledescription=""
                >
                <!-- Arrow Mark -->
                <div class="arrow-right w-2 h-2 mr-1 drop-shadow-sm"></div>
            </button>

        </div>
        <div class="w-full">
            <input class="w-full text-xs text-center text-gray-200 font-bold" value={param.value} on:input={inputValueHandler} />
        </div>
    </div>
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