<script>
    import Modal from "../Modal.svelte";
    import Navbar from "../Navbar.svelte";
    let show = true;
</script>

<main>
    <Navbar />
    <h1>Landing Page</h1>
    <button on:click={() => show = true}>Show modal</button>
    <Modal show={show}>
        <div class="w-full h-full fixed flex items-center justify-center">
            <div class="bg-gray-50 h-auto min-h-[200px] rounded-2xl w-1/2">
                <p>Hello</p>
                <button on:click={() => show = false}>Close</button>
            </div>
        </div>
    </Modal>
</main>
