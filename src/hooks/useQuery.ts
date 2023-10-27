import { onMount } from "svelte";
import { useLocation } from "svelte-routing";
import { get } from "svelte/store";

export function useQuery() {
    const location = get(useLocation());
    return new URLSearchParams(location.search);
}

/**
 * Non-reactive method –– consumes the initial window param when component
 * is initialized. Useful for initializing layouts, where you want to grab
 * initial params when the user enters that layout.
 *
 * @param      [stripQuery=true]  Whether to strip the query parameters
 * @return     The url search parameters.
 */
export function useConsumeQuery(stripQuery: boolean = true) {
    const query = new URLSearchParams(window.location.search);
    if (stripQuery) {
        onMount(() => {
            window.history.replaceState(null, "", location.pathname);
        });
    }

    return query;
}
