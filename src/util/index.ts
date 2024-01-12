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
        /** Checks if first character is a space or space-like (e.g. "-_") */
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

                if (/[A-Za-z0-9]/.test(c))
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
}

