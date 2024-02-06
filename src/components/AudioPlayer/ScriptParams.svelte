<script lang="ts">
    import { ParameterMgr, type Param } from "audio/params/ParameterMgr";
    import { ParamType } from "audio/params/ParamType";
    import { type StringsParameter } from "app/audio/src/ts/params/types/StringsParameter";
    import StringsMenu from "app/components/AudioPlayer/ScriptParam/StringsMenu.svelte";
    import type {NumberParameter} from "audio/params/types/NumberParameter";
    import type {BoolParameter} from "audio/params/types/BoolParameter";
    import Checkbox from "app/components/AudioPlayer/ScriptParam/Checkbox.svelte";
    import NumberBox from "app/components/AudioPlayer/ScriptParam/NumberBox.svelte";

    export let params: ParameterMgr;

    // Casting functions, since Svelte doesn't allow TS in markup
    const asStrings = (p: Param) => p as StringsParameter;
    const asNumber = (p: Param) => p as NumberParameter;
    const asBool = (p: Param) => p as BoolParameter;
</script>

<div>
    {#each params.params as param (param)}
        {#if param.type === ParamType.Strings }
            <StringsMenu param={asStrings(param)}></StringsMenu>
        {:else if param.type === ParamType.Bool }
            <Checkbox param={asBool(param)} />
        {:else if param.type === ParamType.Integer || param.type === ParamType.Float}
            <NumberBox param={asNumber(param)} />
        {/if}
    {/each}
</div>

