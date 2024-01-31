<script lang="ts">
    import {Router, Route, navigate} from "svelte-routing";
    import NotFoundPage from "app/components/pages/NotFoundPage.svelte";
    import LandingPage from "app/components/pages/LandingPage.svelte";
    import AuthLayout from "app/components/pages/auth/AuthLayout.svelte";
    import { UserContext } from "app/contexts/UserContext";
    import { AudioContext } from "app/contexts/AudioContext";
    import { useQuery } from "app/hooks/useQuery";
    import CreateTrackPage from "app/components/pages/tracks/CreateTrackPage.svelte";
    import { onMount } from "svelte";

    UserContext.init();
    AudioContext.init();

    const query = useQuery();

    onMount(() => {
        // Read & perform redirect in query string
        let redirect = query.get("redirect");
        if (redirect)
        {
            // get url from the redirect query param
            redirect = decodeURI(atob(redirect));

            query.delete("redirect");

            // append the rest of the query string to the redirected url
            const queryString = query.toString();
            if (queryString.length > 0)
            {
                if (redirect.includes('?'))
                {
                    redirect += '&' + query.toString();
                }
                else
                {
                    redirect += '?' + queryString;
                }
            }

            // go to redirect
            navigate(redirect, {replace: true});
        }
    });

</script>

<main class="overflow-x-hidden max-w-[100%] min-h-screen overflow-y-auto bg-gray-50"
    on:drop={(evt) => evt.preventDefault()}
    on:dragover={(evt) => evt.preventDefault()}
>
    <Router>
        <Route path="/" component={LandingPage} />
        <Route path="/auth/*" component={AuthLayout} />
        <Route path="/*" component={NotFoundPage} />
        <Route path="/tracks/create" component={CreateTrackPage} />
    </Router>
</main>
