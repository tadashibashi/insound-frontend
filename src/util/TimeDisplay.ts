/**
 * Convert number of seconds into hh:mm format
 */
function toDigitalTime(seconds: number): string
{
    seconds = Math.floor(seconds);

    const ss = seconds % 60;
    const mm = Math.floor(seconds / 60);

    return `${mm}:${ss.toString().padStart(2, '0')}`;
}

function makeSeconds(seconds: number, minutes: number = 0, hours: number = 0,
    days: number = 0)
{
    return seconds +
        minutes * 60 +
        hours * 3600 +
        days * 86400;
}

export class TimeDisplay
{
    private m_current: number;
    private m_max: number;

    constructor()
    {
        this.m_current = 0;
        this.m_max = 0;
    }

    get current(): number { return this.m_current; }
    set current(value: number) { this.m_current = value; }

    get max(): number { return this.m_max; }
    set max(value: number) { this.m_max = value; }

    setCurrent(seconds: number, minutes: number = 0, hours: number = 0,
        days: number = 0)
    {
        this.m_current = makeSeconds(seconds, minutes, hours , days);
    }

    /**
     * Set the max time with combined seconds, minutes, hours, days
     */
    setMax(seconds: number, minutes: number = 0, hours: number = 0,
        days: number = 0)
    {
        this.m_max = makeSeconds(seconds, minutes, hours, days);
    }

    /**
     * Returns digital display as string with format hh:mm
     */
    toString(val?: number): string
    {
        if (val !== undefined)
            return toDigitalTime(val);
        else
            return toDigitalTime(this.m_current);
    }

    /**
     * Progress of current time to max time as a percentage (0-1)
     */
    get progress(): number
    {
        return this.m_max === 0 ? 0 : this.m_current / this.m_max;
    }

    /**
     * Set the current time as a percentage of the max time.
     * @param value - percentage to set (0-1)
     */
    set progress(value: number)
    {
        this.m_current = value * this.m_max;
    }
}
