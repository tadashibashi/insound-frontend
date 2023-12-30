import { type AudioChannelSettings } from "app/util/AudioChannel";

export interface MixPreset {
    name: string;
    mix: AudioChannelSettings[];
}
