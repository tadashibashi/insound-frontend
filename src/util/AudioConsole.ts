import type { AudioEngine } from "app/audio/src/ts/AudioEngine";
import { AudioChannel, type AudioChannelSettings } from "./AudioChannel";

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
