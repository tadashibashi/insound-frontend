<script lang="ts">
    import { AudioChannel } from "audio/AudioChannel";
    import VSlider from "app/components/widgets/VSlider.svelte";
    import KnobWidget from "app/components/widgets/KnobWidget.svelte";
    import WidgetLabel from "app/components/widgets/WidgetLabel.svelte";

    export let channel: AudioChannel;

    export let readonly: boolean = false;
</script>

<div class={$$props.class ?? "w-[124px] inline-flex pt-3 "}>
    <div class="flex flex-col items-center w-full">

        <!-- Reverb Knob -->
        <div class="w-8">
            <KnobWidget param={channel.params.reverb} labelClass={"text-[10px]"}
                readonly={readonly}
            />
        </div>

        <!-- Pan -->
        <div class="flex">
            <div class="w-6 mr-1">
                <KnobWidget param={channel.params.panLeft} showName={false}
                    readonly={readonly}
                />
            </div>

            <div class=w-6>
                <KnobWidget param={channel.params.panRight} showName={false}
                    readonly={readonly}
                />
            </div>
        </div>

        <!-- Volume Slider -->
        <VSlider param={channel.params.volume} height="100px" showName={false}
            readonly={readonly}
        />
        <div class="overflow-visible mx-auto">
            <WidgetLabel name={channel.name} size="whitespace-normal block" />
        </div>
    </div>
</div>

