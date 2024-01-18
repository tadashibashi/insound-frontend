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
    let undoDepth = 0;
    let redoDepth = 0;

    function handleCheckScroll(evt: Event)
    {
        const contentDOM = editor.view.contentDOM;
        const vScrollbarVisible = (contentDOM.scrollHeight > editorParentEl.clientHeight);
        // Can use this if you want to support side shadows
        // const hScrollbarVisible = (contentDOM.scrollWidth > editorParentEl.clientWidth);

        shadowTop = vScrollbarVisible && scrollerEl.scrollTop > 0;
        shadowBottom = vScrollbarVisible && scrollerEl.scrollTop < contentDOM.scrollHeight - editorParentEl.clientHeight - 24;
    }

    function updateUndoDepth()
    {
        undoDepth = editor.undoDepth;
    }

    function updateRedoDepth()
    {
        redoDepth = editor.redoDepth;
    }

    onMount(() => {
        // Create the text editor object
        if (!editor)
        {
            editor = new TextEditorMgr({text: value});
            editorParentEl.appendChild(editor.parent);
        }

        // Get the editor element that contains scrolling
        scrollerEl = editor.scrollDOM;

        // Set up scrolling callbacks
        scrollerEl.addEventListener("scroll", handleCheckScroll);
        editor.contentDOM.addEventListener("keydown", handleCheckScroll); // keydown can cause text to increase div height
        editor.contentDOM.addEventListener("keyup", updateUndoDepth);
        editor.onundo.addListener(updateUndoDepth);
        editor.onredo.addListener(updateRedoDepth);

        // capture on mount only
        const tempDoLoadScript = doloadscript || (() => {});
        editor.onsave.addListener(tempDoLoadScript);

        // Teardown callbacks
        return () => {
            scrollerEl.removeEventListener("scroll", handleCheckScroll);
            editor.contentDOM.removeEventListener("keydown", handleCheckScroll);
            editor.contentDOM.removeEventListener("keyup", updateUndoDepth);
            editor.onundo.removeListener(updateUndoDepth);
            editor.onredo.removeListener(updateRedoDepth);
            editor.onsave.removeListener(tempDoLoadScript);
        };
    });

</script>

<div class =" h-[324px] flex flex-col">
    <div class={"flex justify-between items-center bg-gray-50 h-[32px] " +
        (shadowTop ? "shadow-md" : "")}
    >
        <div>
            <p class="text-xs text-gray-200 ps-2">Scripting Engine v0.0.1</p>
        </div>
        <div class="flex items-center">
            <!-- Undo button -->
            <button
                class={"block mr-3 text-xs border rounded-full px-2 border-gray-200 " +
                    (undoDepth > 0 ? "text-gray-400 cursor-pointer" : "text-gray-100 cursor-default")}
                on:click={() => editor.undo()}
            >
                <Icon src={ArrowUturnLeft} size="14" />
            </button>

            <!-- Redo button -->
            <button
                class={"block mr-3 text-xs border-gray-200 border rounded-full px-2 " +
                    (redoDepth > 0 ? "text-gray-400 cursor-pointer" : "text-gray-100 cursor-default")}
                on:click={() => editor.redo()}
            >
                <Icon src={ArrowUturnRight} size="14" />
            </button>

            <!-- Reload Script button -->
            <button class="block mr-3 text-xs font-light text-gray-400 border-gray-200 border rounded-full px-2 cursor-pointer"
                on:click={() => { if (doloadscript) doloadscript(); }}
            >
                Reload Script
            </button>
        </div>

    </div>



    <div class="flex-grow overflow-hidden relative" bind:this={editorParentEl} >
        <div class={"absolute w-full -bottom-2 h-2 bg-white rotate-180 " + (shadowBottom ? "shadow-md" : "")} />
    </div>
</div>

<style>
    .shadow-bottom {
        box-shadow: 0 -4px 3px -1px#00000010, 0 -2px 8px -4px #00000090, var(--tw-ring-shadow), 0 0 #000;
    }
</style>
