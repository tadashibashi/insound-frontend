<!--
@file MixConsole.svelte
@description
    Interface to control AudioConsole parameters, with the appearance of an
    audio mixing console desk.
-->
<script lang="ts">
    import { AudioConsole } from "audio/AudioConsole";
    import ChannelStrip from "./ChannelStrip.svelte";
    import { onMount } from "svelte";

    /** Audio console to control */
    export let audioConsole: AudioConsole;

    export let active: boolean = true;
    export let editMode: boolean = true;

    let channelDiv: HTMLDivElement;
    let showMainShadow: boolean = false;
    let showLeftShadow: boolean = false;

    function checkShadows()
    {
        if (!active) return;

        const scrollbarVisible = checkHScrollbarVisible(channelDiv);
        showMainShadow = scrollbarVisible &&
            channelDiv.scrollLeft < channelDiv.scrollWidth -
            channelDiv.clientWidth - 1;
        showLeftShadow = scrollbarVisible && channelDiv.scrollLeft !== 0;
    }

    function checkHScrollbarVisible(elem: HTMLElement)
    {
        return elem.clientWidth < elem.scrollWidth;
    }

    onMount(() => {
        window.addEventListener("resize", checkShadows);

        checkShadows();
        return () => {
            window.removeEventListener("resize", checkShadows);
        };
    });

</script>

<!-- Mix Console -->
<div class="MixConsole">

    <!-- left shadow -->
    <div class={"z-50 absolute w-2 h-full -translate-x-2 " + (showLeftShadow ? "ChanShadowRight" : "")}></div>

    <!-- Channel strips -->
    <div bind:this={channelDiv}
        on:scroll={checkShadows}
        class="overflow-y-hidden overflow-x-auto whitespace-nowrap flex-grow flex">
        {#each audioConsole.channels as chan, i (chan)}
            {#if i > 0}
                <ChannelStrip channel={chan} readonly={!editMode} />

                <!-- Channel divider -->
                <div class="inline border-l border-l-gray-100 my-4"></div>
            {/if}
        {/each}

    </div>

    <!-- Main channel bus -->
    {#if audioConsole.channels.length > 0}
        <div class={"inline-flex w-[124px] pt-3 justify-center " +
            (showMainShadow ? "ChanShadowLeft" : "")}
        >
            <ChannelStrip class="" channel={audioConsole.channels[0]} />
        </div>

    {/if}

</div>

<style>
    .MixConsole {
        @apply h-[324px] w-full flex overflow-hidden relative bg-[#fefefe];
    }

    .ChanShadowLeft {
        box-shadow: -4px 0 8px #0000000f;
    }
    .ChanShadowRight {
        box-shadow: 4px 0 16px #0000000f;
    }
</style>
