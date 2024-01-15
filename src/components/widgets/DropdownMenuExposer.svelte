<script lang="ts">
    export let open: boolean;
    export let isOpen: boolean = open;

    $: isOpen = open;
</script>
