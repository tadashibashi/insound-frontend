<script lang="ts">
    import {Router, Route, useLocation, useHistory, navigate} from "svelte-routing";
    import NotFoundPage from "app/components/pages/NotFoundPage.svelte";
    import LandingPage from "app/components/pages/LandingPage.svelte";
    import AuthLayout from "app/components/pages/auth/AuthLayout.svelte";
    import { UserContext } from "app/contexts/UserContext";
    import { AudioContext } from "app/contexts/AudioContext";
    import CreateTrackPage from "app/components/pages/tracks/CreateTrackPage.svelte";
    import { useConsumeQuery } from "app/hooks/useQuery";
    import TestPage from "app/components/pages/test/TestPage.svelte";

    UserContext.init();
    AudioContext.init();

    let query = useConsumeQuery();
    let redirect = query.get("redirect");
    if (redirect) {
        redirect = decodeURI(atob(redirect));
        console.log("redirecting to:", redirect);
        navigate(redirect, {replace: true});
    }
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
