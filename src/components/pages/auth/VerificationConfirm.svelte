<script>
    import { useConsumeQuery } from "app/hooks/useQuery";
    import { AuthAPI } from "app/util/api/AuthAPI";
    import { onMount } from "svelte";

    let verified = false;

    onMount(() => {
        const query = useConsumeQuery();
        const token = query.get("token") || "";

        if (!token) return;

        AuthAPI.verifyEmail(token);

    });



</script>

