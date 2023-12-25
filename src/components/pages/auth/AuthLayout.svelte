<script lang="ts">
    import { Route, Router, navigate } from "svelte-routing";
    import LoginPage from "./LoginPage.svelte";
    import { Icon, XMark } from "svelte-hero-icons";
    import { useQuery, updateSearchParams } from "app/hooks/useQuery";
    import { onMount } from "svelte";
    import SignupPage from "./SignupPage.svelte";
    import VerificationConfirm from "./VerificationConfirm.svelte";
    import VerificationSentPage from "./VerificationSentPage.svelte";
    import { Transition } from "@rgossiaux/svelte-headlessui";

    const subRoute = $$props["*"];
    const query = useQuery();

    let lastLocation: string = "";

    function exit()
    {
        if (!lastLocation)
            return;
        navigate(lastLocation);
    }

    onMount(() => {

        console.log(query.toString());
        lastLocation = query.get("last") || "/";
        if (lastLocation[0] !== "/") {
            lastLocation = "/" + lastLocation;
        }

        query.delete("last");

        updateSearchParams(query);

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
<Transition
    show={true}
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
>
<main>
    <button class="absolute right-4 top-4" on:click={() => exit()} tabindex="-1">
        <Icon src="{XMark}" class="h-8 w-auto text-gray-400" />
    </button>
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <img class="mx-auto h-20 w-auto" src="/static/images/logo.svg" alt="Insound Audio">
        <Router>
            <Route path="signin" component={LoginPage}></Route>
            <Route path="signup" component={SignupPage}></Route>
            <Route path="verify" component={VerificationConfirm}></Route>
            <Route path="email-sent" component={VerificationSentPage}></Route>
        </Router>
    </div>


</main>
</Transition>
