<script lang="ts">
    import {Router, Route, useLocation, useHistory, navigate} from "svelte-routing";
    import NotFoundPage from "app/components/pages/NotFoundPage.svelte";
    import LandingPage from "app/components/pages/LandingPage.svelte";
    import AuthLayout from "app/components/pages/auth/AuthLayout.svelte";
    import { UserContext } from "app/contexts/UserContext";
    import { AudioContext } from "app/contexts/AudioContext";
    import CreateTrackPage from "app/components/pages/tracks/CreateTrackPage.svelte";
    import { updateSearchParams, useQuery } from "app/hooks/useQuery";
    import TestPage from "app/components/pages/test/TestPage.svelte";
    import { onMount } from "svelte";

    UserContext.init();
    AudioContext.init();

    const query = useQuery();

    onMount(() => {
        let redirect = query.get("redirect");
        if (redirect)
        {
            redirect = decodeURI(atob(redirect));

            query.delete("redirect");
            if (redirect.includes('?'))
            {
                redirect += '&' + query.toString();
            }
            else
            {
                redirect += '?' + query.toString();
            }

            navigate(redirect, {replace: true});
        }
    });

</script>

<main class="overflow-hidden">
    <Router>
        <Route path="/" component={LandingPage} />
        <Route path="/auth/*" component={AuthLayout} />
        <Route path="/*" component={NotFoundPage} />
        <Route path="/tracks/create" component={CreateTrackPage} />
        <Route path="/test" component={TestPage} />
    </Router>
</main>
