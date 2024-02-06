<script lang="ts">
    import type {BoolParameter} from "audio/params/types/BoolParameter";

    export let param: BoolParameter;
</script>

<div>
    <input type="checkbox" checked={!!param.value}
        class=""
        on:change={e => {
            const target = e.currentTarget;
            if (!target) return;

            param.value = target.checked ? 1 : 0;
        }}
    >
</div>
