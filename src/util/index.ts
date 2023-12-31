const HexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
    'c', 'd', 'e', 'f'];

export namespace util
{
    export function genRandHex(length: number) {

        let str: string = "";
        for (let i = 0; i < length; ++i)
        {
            str += HexDigits[Math.floor(Math.random() * HexDigits.length)];
        }

        return str;
    }

    /**
     * Translate a filename, such as "file-name.txt" into a title-case name
     * "File Name".
     *
     * @param  {string} filename - the file name to transform
     */
    export function fileNameToLabelName(filename: string): string
    {

        function isSpace(c: string)
        {
            if (c.length === 0) return false;

            switch(c.charAt(0))
            {
            case '-': case '_':
                return true;
            }

            return /\s/.test(c);
        }

        // chop off file extension
        filename = filename.replace(/\.[^/.]+$/, "");

        let res = "";
        let lastSpace = true;

        // Use title case, transform _- to spaces, filter out all <>\
        for (let i = 0; i < filename.length; ++i)
        {
            const c = filename[i];
            if (lastSpace)
            {
                if (isSpace(c))
                    continue;

                if (/[A-Za-z]/.test(c))
                {
                    lastSpace = false;
                    res += c.toUpperCase();
                }
                else
                {
                    res += c;
                }
            }
            else
            {
                if (isSpace(c))
                {
                    lastSpace = true;
                    res += ' ';
                }
                else
                {
                    res += c;
                }
            }
        }

        return res;
    }

    /**
     * An enumeration of action indices that is used in the `transformArray`
     * functions. This function uses the reducer pattern such as in Redux.
     */
    export enum TransformArrayAction
    {
        /** Splice an object from an array and insert it at another index */
        SpliceAndInsert,
        /** Erase an object from an array, removing at specified index */
        Erase,
        /** Insert an object into an array at a specified index */
        Insert,
        /** Remove all elements */
        Clear
    }

    /**
     * Performs a mutating operation on an array
     *
     * @param arr    the array to perform the operation on
     * @param action the action type to perform
     * @param arg    the data associated with the action
     */
    export function transformArray<T>(arr: T[], action: TransformArrayAction.SpliceAndInsert, arg: {from: number, to: number}): void;
    export function transformArray<T>(arr: T[], action: TransformArrayAction.Erase, arg: number): void;
    export function transformArray<T>(arr: T[], action: TransformArrayAction.Insert, arg: {index: number, item: T}): void;
    export function transformArray<T>(arr: T[], action: TransformArrayAction.Clear): void;
    export function transformArray<T>(arr: T[], action: TransformArrayAction, arg?: any): void
    {
        switch(action)
        {
        case TransformArrayAction.SpliceAndInsert:
            {
                if (typeof arg.from !== "number" || typeof arg.to !== "number"
                    || arg.from < 0 || arg.from >= arr.length
                    || arg.to < 0 || arg.to >= arg.length
                    || arg.from === arg.to)
                    return;

                const item = arr[arg.from];
                arr.splice(arg.from, 1);
                arr.splice(arg.to, 0, item);
            break;
            }
        case TransformArrayAction.Erase:
            {
                if (typeof arg !== "number" || arg < 0 || arg >= arr.length)
                    return;

                arr.splice(arg, 1);
            break;
            }

        case TransformArrayAction.Insert:
            {
                if (typeof arg.index !== "number" || arg.index < 0 ||
                    arg.index >= arr.length)
                    return;

                 // trusts `arg.item`` is of type T
                arr.splice(arg.index, 0, arg.item as T);
            }

        case TransformArrayAction.Clear:
            {
               arr.length = 0;
            break;
            }

        }


    }
}

