<script lang="ts">
    import { useConsumeQuery } from "app/hooks/useQuery";
    import { AuthSrv } from "app/util/service/AuthSrv";
    import { onMount } from "svelte";

    type VerificationState = AuthSrv.VerificationState;
    const VerificationState = AuthSrv.VerificationState;

    let verifiedState: VerificationState = VerificationState.None;

    onMount(() => {
        const query = useConsumeQuery();
        const token = query.get("token") || "";

        if (!token) {
            verifiedState = VerificationState.Failed;
            return;
        }

        AuthSrv.activate(token)
            .then(res => verifiedState = res)
            .catch(err => {
                verifiedState = err;
            });
    });
</script>

<div>
    
</div>
