<script>
    import { getContext } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import Form from "../../Form.svelte";
    const { login } = getContext("user");

    let email = "";
    let password = "";
    let password2 = "";

    async function handleSubmit() {
        if (await login(email, password, password2))
            navigate("/");
    }
</script>

<h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>


<Form action={handleSubmit} class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="mb-8">
        <label for="email" class="block text-black-900 mb-2 text-sm">Email address</label>
        <input bind:value={email} type="email" name="email" id="email" required
            class="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"/>
    </div>

    <div class="mb-8">
        <label for="password" class="block text-black-900 mb-2 text-sm">Password</label>
        <input bind:value={password} type="password" name="password" id="password" required minlength="3"
            class="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"/>
    </div>

    <div class="hidden" aria-hidden="true">
        <label for="password2">Please don't verify your password</label>
        <input bind:value={password2} type="password" name="password2" id="password2" autocomplete="off" />
    </div>

    <div class="text-center mx-auto mt-8">
        <input type="submit" value="Sign in" class="cursor-pointer text-sm w-full h-full py-2 text-gray-100 bg-purple-600 rounded-lg px-2"/>
    </div>

    <p class="mt-8 text-sm text-center">Don't have an account?
        <Link to="/auth/signup" class="text-purple-600">Sign up here</Link>
    </p>
</Form>

