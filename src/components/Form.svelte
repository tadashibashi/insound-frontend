<!--
    Encapsulates an HTML form element. Prevents default behavior on submit.
    Children should be added inside of it, and you must include your own submit
    button or input element.
 -->
<script lang="ts">
    import { request } from "app/util/api/request";
    import debounce from "../util/debounce";
    import type { HttpMethod } from "app/util/api/request";
    import { Result } from "app/util/api/Result";

    // ===== Attributes =======================================================

    /**
     * Required.
     *
     * A string server endpoint or callback receiving the collected FormData
     * on submit –– callbacks must send its own requests and side-effects, etc.
     */
    export let action: string | ((formData: FormData) => Promise<Result<unknown, unknown>>) | ((formData: FormData) => Promise<void>);

    /**
     * Optional.
     *
     * Sets the http method with the submitted request -- only applicable when
     * parameter `action` is an endpoint string.
     *
     * @default "POST"
     */
    export let method: HttpMethod = "POST";

    /**
     * Optional.
     *
     * Typical handler that catches any error that occurred during `action`
     */
    export let onCatch: ((err: unknown) => void) | null = null;

    /**
     * Optional.
     *
     * Typical handler that acts on the body from the request if action was
     * an endpoint string, or the awaited value in the return value of the
     * action, if `action` was a callback.
     *
     * `data` contains the form data that was sent to the request endpoint
     */
    export let onThen: ((result: Result<unknown, unknown>, data: FormData) => void) | null = null;

    /**
     * Optional.
     *
     * Amount of delay to require between submission, to prevent rapid
     * submissions.
     *
     * @default 0
     */
    export let delay: number = 0;

    let sendRequest = function(formEl: HTMLFormElement) {
        const data = new FormData(formEl);
        if (typeof action === "function") {
            action(data)
                .catch(onCatch)
                .then((res) => (onThen ? onThen(res ? res : new Result(undefined), data) : null));
        } else {
            request(action, method, data)
                .catch(onCatch)
                .then((res) => onThen ? onThen(res ? res : new Result(undefined), data) : null);
        }
    }

    // apply any delay
    if (delay > 0) {
        sendRequest = debounce(sendRequest, delay);
    }

    let handleSubmit = function(evt: SubmitEvent) {
        evt.preventDefault();
        sendRequest(evt.currentTarget as HTMLFormElement);
    }

</script>

<form on:submit={handleSubmit} class={$$props["class"]}>
    <slot />
</form>
