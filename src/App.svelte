<script lang="ts">
    import {Router, Route} from "svelte-routing";
    import NotFoundPage from "./components/pages/NotFoundPage.svelte";
    import LandingPage from "./components/pages/LandingPage.svelte";
    import AuthLayout from "./components/pages/auth/AuthLayout.svelte";
    import { UserContext } from "./contexts/UserContext";
    import CreateTrackPage from "./components/pages/tracks/CreateTrackPage.svelte";

    UserContext.init();

</script>

<Router>
    <Route path="/" component={LandingPage} />
    <Route path="/auth/*" component={AuthLayout} />
    <Route path="/*" component={NotFoundPage} />
    <Route path="/tracks/create" component={CreateTrackPage} />
<main>


</main>

</Router>
