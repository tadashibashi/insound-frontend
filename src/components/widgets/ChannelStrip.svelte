<script lang="ts">
    import type { AudioEngine } from "app/audio/src/ts/AudioEngine";
    import VSlider from "./VSlider.svelte";
    import { NumberParameter } from "audio/params/types/NumberParameter";
    import KnobWidget from "./KnobWidget.svelte";

    export let audio: AudioEngine;

    /**
     * 1-based, 0 means that it's the main channel
     */
    export let channel: number;

    export let name: string;

    let volume = new NumberParameter(name, channel, 0, 1.25, .01, 1, false,
        (i, val) => {
            if (channel > 0)
                audio.setChannelVolume(channel-1, val);
            else
                audio.setMainVolume(val)
        });

    let reverb = new NumberParameter("rev", 0, 0, 2, .01, 0, false,
        (i, val) => {
            if (channel > 0)
                audio.setChannelReverbLevel(channel-1, val);
            else
                audio.setMainReverbLevel(val);
        });

    let panLeft = new NumberParameter("pan l", 0, 100, 0, 1, 100, true,
        (i, val) => {
            if (channel > 0)
                audio.engine.setChannelPanLeft(channel-1, val * .01);
            else
                audio.engine.setMainPanLeft(val);
        });

    let panRight = new NumberParameter("pan r", 0, 0, 100, 1, 100, true,
        (i, val) => {
            if (channel > 0)
                audio.engine.setChannelPanRight(channel-1, val * .01);
            else
                audio.engine.setMainPanRight(val);
        });

</script>

<div class="flex flex-col">
    <div class="w-8">
        <KnobWidget param={reverb} />
    </div>

    <div class="flex">
        <div class="w-6 mr-1">
            <KnobWidget param={panLeft} showName={false} />
        </div>

        <div class=w-6>
            <KnobWidget param={panRight} showName={false} />
        </div>
    </div>


    <VSlider param={volume} height="100px" />
</div>

