<!--
@file MixConsole.svelte
@description
    Interface to control underlying AudioEngine with the appearance of an
    audio mixing console desk.
-->
<script lang="ts">
    import { AudioConsole } from "app/util/AudioConsole";
    import ChannelStrip from "./ChannelStrip.svelte";

    /** Audio console to control */
    export let audioConsole: AudioConsole;

</script>

<!-- Mix Console -->
<!-- outer container -->
<div class="border border-b-2 border-gray-50 rounded-md my-6 shadow-lg">
    <!-- inner container -->
    <div class="h-[324px] w-full flex pt-2 pl-2">

        <!-- Channel strips -->
        <div class="overflow-y-hidden overflow-x-auto whitespace-nowrap flex-grow flex">
            {#each audioConsole.channels as chan, i (chan)}
                {#if i > 0}
                    <ChannelStrip channel={chan} />

                    <!-- Channel divider -->
                    <div class="inline h-[300px] w-[1px] border-l border-l-gray-100"></div>
                {/if}
            {/each}

        </div>

        <!-- Main channel bus -->
        {#if audioConsole.channels.length > 0}
            <ChannelStrip channel={audioConsole.channels[0]} />
        {/if}

    </div>

</div>
