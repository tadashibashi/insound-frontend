<script>
    import Navbar from "../Navbar.svelte";

    $: location = $$props["*"];
</script>

<main>
    <Navbar />
    <h1>404 Not Found</h1>
    <p>Sorry, we could not find a page at /{location}</p>
</main>
