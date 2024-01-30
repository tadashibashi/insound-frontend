/**
 * Reactively get the current query.
 * Make sure that this gets called in the component's script body and not
 * inside a callback or another function.
 */
export function useQuery()
{
    const location = window.location;
    return (location) ? new URLSearchParams(location.search) :
        new URLSearchParams();
}

export function updateSearchParams(params: URLSearchParams)
{
    if (params.size === 0)
    {
        clearSearchParams();
    }
    else
    {
        window.history.replaceState(null, "", location.pathname + "?" +
            params.toString());
    }
}

export function clearSearchParams()
{
    window.history.replaceState(null, "", location.pathname);
}

/**
 * Non-reactive method –– consumes the initial window param when component
 * is initialized. Useful for initializing layouts, where you want to grab
 * initial params when the user enters that layout.
 *
 * @param      [stripQuery=true]  Whether to strip the query parameters
 * @return     The url search parameters.
 */
export function useConsumeQuery(stripQuery: boolean = true)
{
    const query = new URLSearchParams(window.location.search);
    if (stripQuery)
    {
        clearSearchParams();
    }

    return query;
}
