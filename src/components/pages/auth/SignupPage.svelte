<script lang="ts">
    import {Link, navigate} from "svelte-routing";
    import Form from "app/components/Form.svelte";
    import { AuthSrv } from "app/util/service/AuthSrv";
    import SpinningGearIcon from "app/components/icons/SpinningGearIcon.svelte";

    let email = "";
    let password = "";
    let password2 = "";

    let isLoading = false;

    async function handleSubmit(formData: FormData) {
        isLoading = true;
        if (password !== password2)
        {
            // handle error display here
            isLoading = false;
            return;
        }

        try {
            const res = await AuthSrv.signupEmail(formData);

            if (res.ok) {
                // Eventually redirect to a "validation email was sent" page
                isLoading = false;
                navigate("/auth/email-sent");
            } else {

                // Handle error display here
                console.log(res.error);
                isLoading = false;
            }
        } catch (e) {
            // Deal with unknown exception here, display some generic message
            console.log(e);
            isLoading = false;
            throw e;
        }
    }
</script>

<h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create a new account</h2>


<Form action={handleSubmit} class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="mb-8">
        <label for="email" class="block text-black-900 mb-2 text-sm">Email address</label>
        <input bind:value={email} type="email" name="email" id="email" required
            class="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"/>
    </div>
    <div class="mb-8">
        <label for="password" class="block text-black-900 mb-2 text-sm">Password</label>
        <input bind:value={password} type="password" name="password2" id="password" required minlength="3"
            class="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"/>
    </div>
    <div class="mb-8">
        <label for="password2" class="block text-black-900 mb-2 text-sm">Confirm Password</label>
        <input bind:value={password2} type="password" name="password" id="password2" required minlength="3"
            class="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"/>
    </div>

    <div class="hidden" aria-hidden="true">
        <label for="username2">Please don't enter your username</label>
        <input id="username2" type="text" name="username2" />
    </div>

    <div class="text-center mx-auto mt-8">
        <button type="submit" value="Sign up" class="cursor-pointer text-sm w-full h-full py-2 text-gray-100 bg-purple-600 rounded-lg px-2">
            Sign up {#if isLoading}<SpinningGearIcon />{/if}
        </button>
    </div>
    <p class="mt-8 text-sm text-center">Already have an account?
        <Link to="/auth/signin" class="text-purple-600">Sign in here</Link>
    </p>
</Form>


