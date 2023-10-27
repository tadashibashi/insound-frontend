<script lang="ts">
    import { Link, useLocation } from "svelte-routing";
    import { getContext } from "svelte";
    const {user, logout} = getContext("user");

    const location = useLocation();

</script>

<nav class="flex gap-x-4 ps-4 pe-8 items-center">
    <div class="h-16 aspect-square">
        <Link to="/">
            <img src="/static/images/insound-icon.svg" alt="Insound logo" class="w-full h-full"/>
        </Link>
    </div>

    <Link to="/tracks">Tracks</Link>

    <Link to="/tracks/create">Create Track</Link>

    <div class="ml-auto">
        {#if $user === null}
            <Link to="/auth/signin?last={$location.pathname}">Sign in</Link>
        {:else}
            <button on:click={logout}>Logout</button>
        {/if}
    </div>

</nav>

