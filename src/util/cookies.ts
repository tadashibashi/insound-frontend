
export namespace Cookie {

    /**
     * Get a cookie's value, or `null` if it doesn't exist.
     * @param  {string} name - name of the cookie
     * @return value of the cookie as a `string`, or `null`` if it doesn't
     * exist.
     */
    export function get(name: string): string | null {
        const cookies = decodeURI(document.cookie).split(";");

        // Visit each cookie kvp
        for (let i = 0; i < cookies.length; ++i) {
            const cur = cookies[i].trim();

            // Check if name matches, and return value if so
            if (cur.startsWith(name)) {
                return cur.substring(name.length + 1);
            }
        }

        return null;
    }
}
