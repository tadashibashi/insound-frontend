<script lang="ts">
    import VSlider from "./VSlider.svelte";
    import KnobWidget from "./KnobWidget.svelte";
    import { AudioChannel } from "app/util/AudioChannel";
    import WidgetLabel from "./WidgetLabel.svelte";

    export let channel: AudioChannel;
</script>

<div class="w-18 inline-flex">
    <div class="flex flex-col items-center">
        <div class="w-8">
            <KnobWidget param={channel.reverb} labelClass={"text-[10px]"} />
        </div>

        <div class="flex">
            <div class="w-6 mr-1">
                <KnobWidget param={channel.panLeft} showName={false} />
            </div>

            <div class=w-6>
                <KnobWidget param={channel.panRight} showName={false} />
            </div>
        </div>

        <VSlider param={channel.volume} height="100px" showName={false} />
        <div class="overflow-visible">
            <WidgetLabel name={channel.name} size="whitespace-normal " />
        </div>
    </div>
</div>

