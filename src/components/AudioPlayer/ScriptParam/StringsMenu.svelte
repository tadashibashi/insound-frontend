<script lang="ts">
    import DropdownMenu from "app/components/widgets/DropdownMenu.svelte";
    import type {StringsParameter} from "audio/params/types/StringsParameter";

    export let param: StringsParameter;
    console.log(param);

    function handleChoice(c: string, index: number)
    {
        param.value = index;
    }
</script>

<DropdownMenu items={param.values} onchoice={handleChoice}
    dropdownClass="z-50 bg-gray-50 rounded-b-md min-w-[80px]"
>
    <div slot="button" class="border rounded-md bg-gray-200 min-w-[80px] text-sm text-gray-500">
        {param.values[param.value] || ""}
    </div>

    <div slot="item" let:item class="p-1 text-gray-500 z-50 font-code">
        {item}
    </div>
</DropdownMenu>