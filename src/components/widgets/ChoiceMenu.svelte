<script lang="ts">
    export let choices: string[] = [];
    export let onchoose: (index: number) => void = () => {};

    let currentChoice: number = -1;

    function setChoice(index: number)
    {
        index = Math.max(Math.min(choices.length-1, index), 0);
        currentChoice = index;
        onchoose(index);
    }

</script>

<!-- Menu Container -->
<div class={$$props.class || "" + " absolute select-none"}>
    <div class="w-full h-full cursor-pointer">
        {#each choices as choice, i ("choice-" + choice)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div
            role="listitem"
            on:click={() => setChoice(i)}
            class={(currentChoice === i ? "bg-gray-100 text-500" : "bg-white text-gray-400 hover:bg-[#fdfdfd]") + " w-full"}
        >
            {choice}
        </div>
        {/each}
    </div>
</div>
