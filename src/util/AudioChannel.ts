import type { AudioEngine } from "app/audio/src/ts/AudioEngine";
import { NumberParameter } from "audio/params/types/NumberParameter";

/** Audio channel settings */
export interface AudioChannelSettings
{
    /** Channel name */
    name: string;
    /** Channel volume level where 0 is off and 1 is 100% */
    volume: number;
    /** Pan for left channel where 100 is hard left, and 0 is hard right */
    panLeft: number;
    /** Pan for right channel where 100 is hard right and 0 is hard left */
    panRight: number;
    /** Reverb level where 0 is off and 1 is 100% */
    reverb: number;
}

export class AudioChannel
{
    name: string;
    readonly volume: NumberParameter;
    readonly panLeft: NumberParameter;
    readonly panRight: NumberParameter;
    readonly reverb: NumberParameter;

    constructor(audio: AudioEngine, name: string, channel: number)
    {
        this.name = name;

        this.volume = new NumberParameter("Volume", channel, 0, 1.25, .01, 1, false,
            (channel > 0) ?
                (i, val) => audio.setChannelVolume(channel - 1, val) :
                (i, val) => audio.setMainVolume(val));

        this.reverb = new NumberParameter("Reverb", channel, 0, 2, .01, 0, false,
            (channel > 0) ?
                (i, val) => audio.setChannelReverbLevel(channel - 1, val) :
                (i, val) => audio.setMainReverbLevel(val));

        this.panLeft = new NumberParameter("L", channel, 100, 0, 1, 100, true,
            (channel > 0) ?
                (i, val) => audio.engine.setChannelPanLeft(channel - 1, val * .01) :
                (i, val) => audio.engine.setMainPanLeft(val * .01));

        this.panRight = new NumberParameter("R", channel, 0, 100, 1, 100, true,
        (channel > 0) ?
            (i, val) => audio.engine.setChannelPanRight(channel - 1, val * .01) :
            (i, val) => audio.engine.setMainPanRight(val * .01));
    }

    /**
     * Convenience method to apply many values at once
     *
     * @param settings - values to set
     * @param seconds  - time to transition to settings values in seconds
     */
    applySettings(settings: Partial<AudioChannelSettings>, seconds: number = 0)
    {
        if (settings.volume !== undefined)
        {
            this.volume.transitionTo(settings.volume, seconds);
        }

        if (settings.reverb !== undefined)
        {
            this.reverb.transitionTo(settings.reverb, seconds);
        }

        if (settings.panLeft !== undefined)
        {
            this.panLeft.transitionTo(settings.panLeft, seconds);
        }

        if (settings.panRight !== undefined)
        {
            this.panRight.transitionTo(settings.panRight, seconds);
        }

        if (settings.name !== undefined)
        {
            this.name = settings.name;
        }

    }

    /**
     * Reset all values to their default values
     *
     * @param seconds - time to make transition in seconds
     */
    reset(seconds: number = 0)
    {
        this.volume.reset(seconds);
        this.reverb.reset(seconds);
        this.panLeft.reset(seconds);
        this.panRight.reset(seconds);
    }
}
