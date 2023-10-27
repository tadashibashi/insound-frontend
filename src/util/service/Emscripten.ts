
/**
 * Allocate space for and copy buffer into the emscripten module's heap memory.
 * Returns a pointer to that memory that must be freed by the user when no
 * longer necessary
 * @param   em   emscripten module to allocate the buffer to
 * @param   buf  the buffer to copy.
 *
 * @returns the pointer to the allocated memory
 */
function bufferAlloc(em: EmscriptenModule, buf: ArrayBuffer) {
    const ptr = em._malloc(buf.byteLength);

    try {
        em.HEAPU8.set(new Uint8Array(buf), ptr);
    } catch (err) {

        // clean up on error
        em._free(ptr);

        // transparently throw error
        throw err;
    }

    return ptr;
}

/**
 * Free memory at a pointer
 */
function free(em: EmscriptenModule, ptr: number) {
    em._free(ptr);
}

/**
 * Saves a file downloaded from url. Please make sure that CORS policy
 * allows the server access.
 *
 * @param     em      The emscripten module to save the file to
 * @param     url     The url
 * @return    Pointer to the data. Make sure to free it via {@link freeFile}
 */
export async function saveFileAt(em: EmscriptenModule, url: string) {
    const buffer = await fetch(url)
        .then(res => res.arrayBuffer());
    return bufferAlloc(em, buffer);
}

/**
 * Frees a file saved via {@link saveFileAt}
 *
 * @param     em      The emscripten module to free the file from
 * @param     ptr     The pointer to the data returned from {@link saveFileAt}
 */
export function freeFile(em: EmscriptenModule, ptr: number) {
    free(em, ptr);
}
