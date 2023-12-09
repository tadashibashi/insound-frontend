<script lang="ts">
    import WidgetLabel from "./WidgetLabel.svelte";
    import NumberInput from "./NumberInput.svelte";
    import { NumberParameter } from "audio/params/types/NumberParameter";
    import { onMount } from "svelte";

    export let param: NumberParameter;


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

    onMount(() => {
        
    });
</script>


<div class={$$props.class}>
    <div class="flex flex-col items-center justify-center h-full w-full">
       <div class="w-full justify-center">
            <WidgetLabel name={param.name} />
            <div class="w-full h-[100px] relative border border-gray-100">

            </div>
            <NumberInput min={param.min} max={param.max} value={param.value}
                step={param.step} onchange={inputChangeHandler} />
        </div>
    </div>


</div>

<style>

</style>
