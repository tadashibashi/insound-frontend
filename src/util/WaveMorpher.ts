import type { AudioEngine } from "audio/AudioEngine";
import type { AudioConsole } from "audio/AudioConsole";
import type { MultiTrackControl } from "app/audio/src/ts/MultiTrackControl";

/**
 * Convert audio vector into a Uint8Array used by the WaveMorpher class
 * @param  data   Vector of floating point values between -1 and 1
 * @param  width number of "strands" of audio waveform data to display
 */
async function audioDataToMorpherData(data: Float32Array, width: number)
{
    const res = new Float32Array(width * 2);
    const size = data.length;
    const onePortion = size / width;
    for (let i = 0, resI = 0; i < size; resI += 2)
    {
        const nextI = Math.floor(i + onePortion);
        i = Math.min(i, size-1);

        if (nextI - i <= 0) throw Error("Cannot find average of zero items");

        // calculate average from i-nextI
        let avgTotal = 0;
        for (let j = i; j < nextI; ++j)
        {
            avgTotal += Math.abs(data[j]);
        }

        const total = Math.max(Math.min(avgTotal / onePortion, 1), 0);
        res[resI] = -total;
        res[resI + 1] = total;
        i = nextI;
    }

    return res;
}

export class WaveMorpher
{
    // window width, number of lines of data
    private mWidth: number
    private mData: Float32Array[];
    private mTransformed: Float32Array;
    private mConsole: AudioConsole | null;
    private mTimeout: number | null;
    private mIsDirty: boolean;

    onChangeCallback: (() => void) | null;
    onLoadCallback: (() => void) | null;

    constructor(width: number)
    {
        if (width <= 0) width = 1;

        this.mWidth = width;
        this.mData = [];
        this.mTransformed = new Float32Array(width);
        this.mConsole = null;
        this.mTimeout = null;
        this.mIsDirty = false;
        this.onChangeCallback = null;
        this.onLoadCallback = null;

        this.handleVolumeChange = this.handleVolumeChange.bind(this);
    }

    private handleVolumeChange(index: number, value: number)
    {
        if (!this.mConsole || this.mTimeout !== null) return;

        // Timeout to prevent too rapid calls to this function
        this.mTimeout = setTimeout(() => {
            this.mTimeout = null;
        }, 1);

        // this.mTransformed.fill(0);

        //  // Add channel volumes
        // const length = this.mData.length;
        // for (let i = 0; i < length; ++i)
        // {
        //     const chan = this.mConsole.channels[i+1];
        //     const curVolume = chan.volume.value;
        //     const curData = this.mData[i];

        //     for (let j = 0; j < curData.length; ++j)
        //     {
        //         this.mTransformed[j] += curData[j] * curVolume;
        //     }
        // }

        // // final scale bus volume
        // const mainBusVolume = this.mConsole.channels[0].volume.value;
        // for (let i = 0; i < length; ++i)
        // {
        //     this.mTransformed[i] *= mainBusVolume;
        // }

        this.mIsDirty = true;
        if (this.onChangeCallback)
            this.onChangeCallback();
    }

    /**
     * Populate data array with current data. Check `wasUpdated` to see if
     * data has updated since last call to `getData` for efficiency.
     *
     * @param data
     */
    getData(data: Float32Array) {
        if (!this.mConsole) return;

        data.set(this.mTransformed);

        this.mIsDirty = false;
    }

    getCurrentVolumes(): number[]
    {
        if (!this.mConsole) return [];

        return this.mConsole.channels.map(chan => chan.volume.value);
    }

    get waveData() { return this.mData; }

    /** Check if data was updated since the last retrieval of `data` */
    get wasUpdated() { return this.mIsDirty; }

    get width() { return this.mWidth; }

    /**
     * Load sound data from the track
     * @param {AudioEngine} track engine to get the data from
     */
    async loadData(track: MultiTrackControl, audioConsole: AudioConsole)
    {
        const channelCount = track.channelCount;
        const width = this.mWidth;

        const promises: Promise<Float32Array>[] = [];
        for (let i = 0; i < channelCount; ++i)
        {
            promises.push(new Promise(async (resolve, reject) => {
                let data: Float32Array | null = null;

                await new Promise<void>((res2, rej2) => {
                    let timeTaken = 0;
                    let interval = setInterval(() => {
                        try {
                            data = track.getSampleData(i);
                            clearInterval(interval);
                            res2();
                        }
                        catch(err)
                        {
                            console.log(err);
                        }

                        timeTaken += 200;
                        if (timeTaken >= 10000)
                        {
                            clearInterval(interval);
                            rej2();
                        }

                    }, 200);
                });

                if (!data)
                {
                    reject();
                    return;
                }

                try {
                    audioDataToMorpherData(data, width)
                        .then(resolve);
                }
                catch(err)
                {
                    reject(err);
                }
            }));

        }

        audioConsole.channels.forEach(chan => chan.volume.addSetCallback(this.handleVolumeChange));

        this.mConsole = audioConsole;
        this.mTransformed = new Float32Array(width);
        this.mIsDirty = true;
        this.mData = await Promise.all(promises);

        if (this.onLoadCallback)
            this.onLoadCallback();
    }

    unloadData()
    {
        if (!this.mConsole) return;

        // unsubscribe from volume setters
        this.mConsole.channels.forEach(chan => chan.volume.removeSetCallback(this.handleVolumeChange));
        this.mConsole = null;
        this.mIsDirty = true;

        // reset data buffers
        this.mData = [];
        this.mTransformed.fill(0);
    }
}
