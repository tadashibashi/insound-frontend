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
    console.log("location:", window.location.toString());

    onMount(() => {

        // Read redirect in query string, then strip it from it
        let redirect = query.get("redirect");
        if (redirect)
        {
            redirect = decodeURI(atob(redirect));
            console.log("redirect =", redirect);

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
