<script lang="ts">
    import { useConsumeQuery } from "app/hooks/useQuery";
    import { AuthSrv } from "app/util/service/AuthSrv";
    import { onMount } from "svelte";

    type VerificationState = AuthSrv.VerificationState;
    const VerificationState = AuthSrv.VerificationState;

    const query = useConsumeQuery();
    let verifiedState: VerificationState = VerificationState.None;
    let errorMessage: string = "";

    $: errorMessage = getErrorMessage(verifiedState);

    function getErrorMessage(verificationState: VerificationState): string
    {
        switch(verificationState)
        {
        case VerificationState.ExpiredToken:
            return "Sorry, this verification link is expired."
        case VerificationState.Timeout:
            return "The server timed out.";
        case VerificationState.Failed:
            return "Invalid verification link.";
        default:
            return "Something wen't wrong during verification.";
        }
    }

    onMount(() => {
        const token = query.get("token") || "";

        console.log("Verification token received:", token);
        if (!token) {
            verifiedState = VerificationState.Failed;
            return;
        }

        AuthSrv.activate(token)
            .then((res: VerificationState) => {
                verifiedState = res;
            })
            .catch((err: VerificationState) => {
                verifiedState = err;
            });
    });

</script>

<div>
    {#if verifiedState !== VerificationState.None}
        {#if verifiedState === VerificationState.Verified}
            <h1>Verification Success</h1>
            <p>Thank you for verifying your account</p>
        {:else if verifiedState === VerificationState.AlreadyVerified}
            <h1>Verification Success</h1>
            <p>You already have verified your account</p>
        {:else}
            <h1>Verification Error</h1>
            <p>{errorMessage}</p>
        {/if}
    {/if}
</div>
