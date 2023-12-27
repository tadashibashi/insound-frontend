<script lang="ts">
    import { Icon, XCircle, XMark } from 'svelte-hero-icons';

    export let title: string = "";
    export let errorList: string[] = [];
    export let cancancel = true;

    export let oncancel: () => void = () => {};
</script>

<div class="rounded-md bg-red-50">
    <div class="relative">
        <!-- Cancel X -->
        {#if cancancel}
            <button
                class="absolute top-1 right-1 w-3 text-red-400"
                on:click={oncancel}
            >
                <Icon src="{XMark}" />
            </button>
        {/if}
    </div>

    <!-- Body -->
    <div class="p-4 flex">
        <!-- Icon -->
        <div class="flex-shrink-0">
            <Icon src="{XCircle}" solid class="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>

        <!-- Text -->
        <div class="ml-3">
            <!-- Title -->
            {#if title.length > 0}
            <h3 class="text-sm font-medium text-red-800">{title}</h3>
            {/if}

            <!-- Error list -->
            {#if errorList.length > 0}
            <div class="mt-2 text-sm text-red-700">
                <ul role="list" class="list-disc space-y-1 pl-5">
                    {#each errorList as message, i (message + "-" + i)}
                    <li>{message}</li>
                    {/each}
                </ul>
            </div>
            {/if}

            <!-- Other items -->
            <slot />
        </div>
    </div>
</div>
