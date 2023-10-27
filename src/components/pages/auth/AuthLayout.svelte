<script lang="ts">
    import { Route, Router, navigate } from "svelte-routing";
    import LoginPage from "./LoginPage.svelte";
    import { Icon, XMark } from "svelte-hero-icons";
    import { useConsumeQuery } from "app/hooks/useQuery";
    import { onMount } from "svelte";
    import SignupPage from "./SignupPage.svelte";

    const subRoute = $$props["*"];

    const query = useConsumeQuery();
    let lastLocation = query.get("last") || "/";
    if (lastLocation[0] !== "/") {
        lastLocation = "/" + lastLocation;
    }

    function exit() {
        navigate(lastLocation);
    }

    onMount(() => {
        function onKeydown(ev: KeyboardEvent) {
            if (ev.code === "Escape") {
                exit();
            }
        }

        window.addEventListener("keydown", onKeydown);

        // cleanup
        return () => {
            window.removeEventListener("keydown", onKeydown);
        };
    });

</script>

<main>
    <button class="absolute right-4 top-4" on:click={() => exit()} tabindex="-1">
        <Icon src="{XMark}" class="h-8 w-auto text-gray-400" />
    </button>
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <img class="mx-auto h-20 w-auto" src="/assets/images/insound-icon.svg" alt="Insound Audio">
        <Router>
            <Route path="signin" component={LoginPage}></Route>
            <Route path="signup" component={SignupPage}></Route>
        </Router>
    </div>


</main>
