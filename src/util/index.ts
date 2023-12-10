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
}

