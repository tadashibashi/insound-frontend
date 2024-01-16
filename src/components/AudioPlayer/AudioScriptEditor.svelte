<script lang="ts">
    import { TextEditorMgr } from "app/util/TextEditorMgr";
    import { onMount } from "svelte";
    import { ArrowUturnLeft, ArrowUturnRight, Icon } from "svelte-hero-icons";

    // Bindable text editor object, or you can provide your own
    export let editor: TextEditorMgr;
    let editorParentEl: HTMLElement;

    export let value: string = "";

    export let doloadscript: (() => void) | undefined = undefined;

    let shadowTop: boolean = false;
    let shadowBottom: boolean = false;
    let scrollerEl: HTMLElement;

    function handleCheckScroll(evt: Event)
    {
        const contentDOM = editor.view.contentDOM;
        const vScrollbarVisible = (contentDOM.scrollHeight > editorParentEl.clientHeight);
        // const hScrollbarVisible = (contentDOM.scrollWidth > editorParentEl.clientWidth);

        shadowTop = vScrollbarVisible && scrollerEl.scrollTop > 0;
        shadowBottom = vScrollbarVisible && scrollerEl.scrollTop < contentDOM.scrollHeight - editorParentEl.clientHeight - 24;
        if (shadowBottom)
            console.log(shadowBottom);
    }

    onMount(() => {
        // Create the text editor object
        if (!editor)
        {
            editor = new TextEditorMgr({text: value});
            editorParentEl.appendChild(editor.parent);
        }

        // Get the editor element that contains scrolling
        const tempScrollerEl = document.querySelector(`#${editor.id}.cm-editor .cm-scroller`);
        if (tempScrollerEl)
            scrollerEl = tempScrollerEl as HTMLElement;
        else
            throw Error("Could not find editor scroller element!");

        // Set up scrolling callbacks
        scrollerEl.addEventListener("scroll", handleCheckScroll);
        window.addEventListener("keydown", handleCheckScroll); // keydown can cause text to increase div height

        // Teardown callbacks
        return () => {
            scrollerEl.removeEventListener("scroll", handleCheckScroll);
            window.removeEventListener("keydown", handleCheckScroll);
        };
    });

</script>

<div class =" h-[324px] flex flex-col">
    <div class={"flex justify-end items-center bg-gray-50 py-1 " +
        (shadowTop ? "shadow-md" : "")}
    >
        <!-- Undo button -->
        <button
            class="block mr-3 text-xs text-gray-500 border-gray-200 border rounded-full px-2 mt-1 cursor-pointer"
            on:click={() => editor.undo()}
        >
            <Icon src={ArrowUturnLeft} size="14" />
        </button>

        <!-- Redo button -->
        <button
            class="block mr-3 text-xs text-gray-500 border-gray-200 border rounded-full px-2 mt-1 cursor-pointer"
            on:click={() => editor.redo()}
        >
            <Icon src={ArrowUturnRight} size="14" />
        </button>

        <!-- Reload Script button -->
        <button class="block mr-3 text-xs text-gray-500 border-gray-200 border rounded-full px-2 mt-1 cursor-pointer"
            on:click={() => { if (doloadscript) doloadscript(); }}
        >
            Reload Script
        </button>
    </div>



    <div class="flex-grow overflow-hidden relative" bind:this={editorParentEl} >
        <div class={"absolute w-full -bottom-2 h-2 bg-white rotate-180 " + (shadowBottom ? "shadow-md" : "")} />
    </div>
    <div class="h-2 bg-white"></div>

</div>

<style>
    .shadow-bottom {
        box-shadow: 0 -4px 3px -1px#00000010, 0 -2px 8px -4px #00000090, var(--tw-ring-shadow), 0 0 #000;
    }
</style>
