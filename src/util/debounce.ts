const TIMEOUT_NULL = -1;

/**
 * Creates a "debounced" version of a function where it can only be called every `ms` milliseconds.
 * Any call to the function during the interval will return `undefined`.
 * @param fn
 * @param ms
 */
export function debounce<Args extends any[], Ret>(fn: (...params: Args) => Ret, ms: number) {
    let timeout: number = TIMEOUT_NULL;

    return function(...params: Args): Ret | undefined  {

        if (timeout === TIMEOUT_NULL) {

            const ret = fn(...params);

            //@ts-ignore (sometimes @types/node causes type error)
            timeout = setTimeout(() => {
                timeout = TIMEOUT_NULL;
            }, ms);

            return ret;
        }
    }
}

export default debounce;
