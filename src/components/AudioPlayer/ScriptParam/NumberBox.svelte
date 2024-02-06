<script lang="ts">
    import type {NumberParameter} from "audio/params/types/NumberParameter.js";

    export let param: NumberParameter;
</script>

<input type="number"
    min={param.min}
    max={param.max}
    step={param.step}
    bind:value={param.value}
>
