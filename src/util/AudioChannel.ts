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

/**
 * Represents a mix-console with various channel settings.
 */
export class AudioConsole
{
    private audio: AudioEngine | undefined;

    /**
     * Audio channels: 0 is the main channel
     */
    readonly channels: AudioChannel[];

    constructor(audio?: AudioEngine)
    {
        if (audio)
            this.audio = audio;
        this.channels = [];
    }

    provideAudioEngine(audio: AudioEngine)
    {
        this.audio = audio;
    }

    /**
     * Repopulate the console with new channels, applying the following
     * settings to each channel. Channel 0 is the main channel, while the
     * other channels are bussed to it as separate channels.
     *
     * @param settings Settings to set on each channel. Remember that index 0
     *                 is the main channel bus that the others are bussed to.
     */
    load(settings: Partial<AudioChannelSettings>[])
    {
        const audio = this.audio;
        if (!audio)
        {
            throw Error("AudioConsole failed to load: AudioEngine was not " +
                "emplaced into AudioConsole.");
        }

        if (settings.length === 0) return;

        const chans: AudioChannel[] = [];

        // main channel
        const main = new AudioChannel(audio, "Main", 0);
        main.applySettings(settings[0]);

        // other channels
        for (let i = 1; i < settings.length; ++i)
        {
            const setting = settings[i];
            const chan = new AudioChannel(audio, "", i);
            chan.applySettings(settings[i]);
        }

        // done, apply changes
        this.channels.length = 0;
        this.channels.push(main);
        for (const chan of chans)
        {
            this.channels.push(chan);
        }
    }

    /**
     * Applying the following settings to each channel.
     * Channel 0 is the main channel, while the other channels are bussed to it
     * as separate channels.
     *
     * @param settings Settings to set on each channel. Remember that index 0
     *                 is the main channel bus that the others are bussed to.
     */
    applySettings(settings: Partial<AudioChannelSettings>[])
    {
        const length = Math.min(settings.length, this.channels.length);

        for (let i = 0; i < length; ++i)
        {
            this.channels[i].applySettings(settings[i]);
        }
    }

    /**
     * Add a channel to the console.
     *
     * @param name Name to apply to the new channel
     */
    addChannel(name: string)
    {
        if (!this.audio)
        {
            throw Error("AudioConsole failed to load: AudioEngine was not " +
                "emplaced into AudioConsole.");
        }

        this.channels.push(
            new AudioChannel(this.audio, name, this.channels.length + 1));
    }

    /**
     * Add multiple channels to the console
     *
     * @param names Names to apply to each respective newly created channel
     */
    addChannels(names: string[])
    {
        for (const name of names)
        {
            this.addChannel(name);
        }
    }

    /**
     * Clear the channels
     */
    clear()
    {
        this.channels.length = 0;
    }

    /**
     * Reset all channel parameters to their default values
     */
    reset(seconds: number = 0)
    {
        for (const chan of this.channels)
        {
            chan.reset(seconds);
        }
    }
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
