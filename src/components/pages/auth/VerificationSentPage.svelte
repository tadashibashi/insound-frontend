<script>
    import { ArrowDown, Icon, XMark } from "svelte-hero-icons";

    let showHelp = 0;

    const messages = [
        "Please make sure to check your spam message box (or other possible filters)",
        "Please wait up to 5 minutes for the email to arrive",
        "Try re-logging into your Insound account to re-send the email",
        "If you registered the wrong email address, please create a new Insound account",
        "If you are still having issues, please email us at <a href='mailto:mail@insound.io' class='underline'>mail@insound.io</a>"
    ];

    function incrementHelpIndex()
    {
        if (showHelp < messages.length)
            showHelp += 1;
    }
</script>

<div>
    <h1 class="text-3xl text-center mb-4">Email Verification Sent</h1>
    <p class="text-center mb-1">Thank you for registering your account!</p>
    <p class="text-center mb-8">Please check your email for instructions on completing account setup.</p>

    <button
        class={"mx-auto block text-center text-gray-500 text-xs transition-colors duration-300 min-w-[50vmin] p-2 rounded " +
            (showHelp > 0 ? "bg-gray-50 border-gray-100 border" : "")}
        on:click={incrementHelpIndex}
    >
        {#if showHelp > 0}
            <button class="w-4 float-right rounded hover:border hover:border-gray:400 hover:bg-gray-200"
                on:click={(e) => {e.stopPropagation(); showHelp = 0;}}
            >
                <Icon class="" src="{XMark}"/>
            </button>

        {/if}
        <button class={"block text-center mx-auto cursor-pointer mb-2 " + (showHelp > 0 ? "font-bold" : "")}>
            Trouble receiving the email?
        </button>

        <div class="flex justify-center items-center">
            <ul class={"px-3 list-decimal inline text-left transition-all " + (showHelp ? "opacity-100" : "opacity-0")}>
                {#if showHelp > 0}
                    {#each Array(showHelp) as _, i ("help-message-"+i)}
                    <li class="cursor-pointer">{@html messages[i]}</li>
                    {/each}
                {/if}
            </ul>

        </div>

        {#if showHelp > 0 && showHelp < messages.length}
        <div class="flex justify-center">
            <Icon class="block w-3 mt-2" src="{ArrowDown}"/>
        </div>

        {/if}
    </button>

</div>
