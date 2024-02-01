<script lang="ts">
    import type { MultiTrackControl } from "app/audio/src/ts/MultiTrackControl";
    import { StorageName } from "app/consts";
    import { util } from "app/util";
    import { ScriptConsole } from "app/util/ScriptConsole";
    import { TextEditorMgr } from "app/util/TextEditorMgr";
    import { onMount } from "svelte";
    import { ArrowUturnLeft, ArrowUturnRight, ChevronRight, EllipsisVertical, Icon, LockClosed } from "svelte-hero-icons";

    export let editMode: boolean = true;

    // Bindable text editor object, or you can provide your own
    export let editor: TextEditorMgr;
    export let track: MultiTrackControl;
    let editorParentEl: HTMLElement;
    let editorGroupEl: HTMLElement;
    let scriptConsoleEl: HTMLElement;

    let draggingBorder = false;

    export let value: string = "";

    export let doloadscript: (() => boolean) | undefined = undefined;

    let shadowTop: boolean = false;
    let shadowBottom: boolean = false;
    let scrollerEl: HTMLElement;
    let undoDepth = 0;
    let redoDepth = 0;

    export const id = "AudioScriptEditor-" + util.genRandHex(8);

    let editorWidth: number = Number(localStorage.getItem(StorageName.Audio_ScriptEditor_ConsoleSize) || 70);

    let scriptConsole: ScriptConsole;

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

    function handleMouseUp(evt: MouseEvent)
    {
        if (draggingBorder)
        {
            draggingBorder = false;

            if (!isNaN(editorWidth))
            {
                localStorage.setItem(StorageName.Audio_ScriptEditor_ConsoleSize,
                    editorWidth.toString());
            }
        }

    }

    function handleMouseMove(evt: MouseEvent)
    {
        if (!draggingBorder) return;

        const groupRect = editorGroupEl.getBoundingClientRect();
        const widthPercent = (evt.x - groupRect.left) / (groupRect.width || 1);
        editorWidth = Math.min(Math.max(widthPercent, .2), .8) * 100.0;
    }

    function handleReloadScript()
    {
        doloadscript && doloadscript();
    }

    onMount(() => {
        // Create the text editor object
        if (!editor)
        {
            editor = new TextEditorMgr({text: value, editMode});
            editorParentEl.appendChild(editor.parent);
        }

        // Get the editor element that contains scrolling
        scrollerEl = editor.scrollDOM;

        // attach screen to block mouse interaction with top
        if (!editMode)
        {
            const screenEl = document.createElement("div");
            screenEl.className = "fixed inset-0 cursor-default bg-gray-50 opacity-50";
            screenEl.addEventListener("click", evt => evt.stopPropagation());
            screenEl.addEventListener("wheel", evt => editor.scrollDOM.scrollTop += evt.deltaY / 2);
            editor.scrollDOM.appendChild(screenEl);
        }


        // Set up scrolling callbacks
        scrollerEl.addEventListener("scroll", handleCheckScroll);
        editor.contentDOM.addEventListener("keydown", handleCheckScroll); // keydown can cause text to increase div height
        editor.contentDOM.addEventListener("keyup", updateUndoDepth);
        editor.onundo.addListener(updateUndoDepth);
        editor.onredo.addListener(updateRedoDepth);

        // capture on mount only
        const tempDoLoadScript = doloadscript || (() => {});
        editor.onsave.addListener(tempDoLoadScript);

        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);

        scriptConsole = new ScriptConsole(scriptConsoleEl);

        function doprint(level: number, name: string, message: string, extraData?: any)
        {
            scriptConsole.print(level, name, message, extraData);
        }

        function doclear()
        {
            scriptConsole.clear();
        }

        function domovecursor(line: number, col: number)
        {
            editor.moveCursor(line, col);
        }

        track.doprint.addListener(doprint);
        track.doclear.addListener(doclear);
        scriptConsole.doMoveCursor.addListener(domovecursor);

        // Teardown callbacks
        return () => {
            scrollerEl.removeEventListener("scroll", handleCheckScroll);
            editor.contentDOM.removeEventListener("keydown", handleCheckScroll);
            editor.contentDOM.removeEventListener("keyup", updateUndoDepth);
            editor.onundo.removeListener(updateUndoDepth);
            editor.onredo.removeListener(updateRedoDepth);
            editor.onsave.removeListener(tempDoLoadScript);

            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);

            track.doprint.removeListener(doprint);
            track.doclear.removeListener(doclear);
        };
    });

    let liveScript: string = "";

    let showCompletions = false;

</script>

<div class ="Grid h-[324px]">
    <div class="OptionBar
            flex justify-between items-center bg-gray-50 overflow-hidden py-1.5
            {shadowTop ? "shadow-md" : ""}
        "
    >
        <!-- Version -->
        <div>
            <p class="text-xs text-gray-200 ps-2">
                Scripting Engine v0.0.1
            </p>
        </div>


        {#if editMode}
            <div class="flex items-center">
                <!-- Undo button -->
                <button class="block mr-3 px-2 text-xs rounded-full border border-gray-200
                    { (undoDepth > 0) ?
                        "text-gray-400 cursor-pointer" :
                        "text-gray-100 cursor-default" }
                    "
                    on:click={() => editor.undo()}
                >
                    <Icon src={ArrowUturnLeft} size="14" />
                </button>

                <!-- Redo button -->
                <button class="block mr-3 px-2 text-xs rounded-full border border-gray-200
                    { (redoDepth > 0) ?
                        "text-gray-400 cursor-pointer" :
                        "text-gray-100 cursor-default" }
                    "
                    on:click={() => editor.redo()}
                >
                    <Icon src={ArrowUturnRight} size="14" />
                </button>

                <!-- Reload Script button -->
                <button class="block mr-3 text-xs font-light text-gray-400
                    border-gray-200 border rounded-full px-2 cursor-pointer
                "
                    on:click={handleReloadScript}
                >
                    Reload Script
                </button>
            </div>

        {:else}
            <!-- Lock icon, indicates read-only -->
            <div class="flex items-center pe-2">
                <Icon class="text-gray-200" src={LockClosed} solid size="16" />
            </div>
        {/if}
    </div>

    <div class="overflow-hidden relative grid
            {draggingBorder ? "cursor-grabbing" : ""}"
        style={`grid-template-columns: ${editorWidth}% ${100-editorWidth}%;`}
        bind:this={editorGroupEl}
    >
        <!-- Editor Region -->
        <div class="overflow-hidden max-sm:col-span-2 col-span-1">
            <!-- Text Editor -->
            <div bind:this={editorParentEl}
                class="h-full w-full
                    {editMode ? "" : "select-none"}
                "
            >
                <div class="
                    absolute w-full -bottom-2 h-2 bg-white rotate-180
                    {shadowBottom ? "shadow-md" : ""}
                    " />
            </div>
        </div>

        <!-- Console -->
        <div
            class="relative bg-gray-100 h-full shadow-inner col-span-1 not-sr-only max-sm:sr-only overflow-hidden select-text">
            <div class="flex flex-col w-full h-full">
                <div class="p-2 w-full h-full font-mono text-xs overflow-y-auto select-text flex-grow" bind:this={scriptConsoleEl}>
                </div>
                <div class="flex flex-row items-center">
                    <Icon src={ChevronRight} size="12" class="mx-1" />
                    <input list={id + "-console-completions"} class="select-none bg-transparent flex-grow font-code text-xs py-1" type="text" bind:value={liveScript}
                        spellcheck="false"
                        on:keydown={e => {
                            if (e.repeat) return;
                            showCompletions = false;

                            if (e.key === "Enter")
                            {
                                const result = track.executeScript(liveScript);
                                console.log(result);
                                if (result)
                                    scriptConsole.print(1, "Script", result.toString());
                                //scriptConsole.print(1, "Script", liveScript);

                                liveScript = "";
                            }
                            else if (e.code === "Space" && e.ctrlKey)
                            {
                                showCompletions = true;
                            }
                        }}
                    />
                </div>

            </div>

            <!-- Width drag handle -->
            <button class="absolute h-full w-2 bg-gray-300 hover:opacity-100 transition-opacity duration-200
            {draggingBorder ? "opacity-100 cursor-grabbing" : "opacity-0 cursor-grab"}"
                on:mousedown={() => draggingBorder = true}>
                <Icon class="float-left -translate-x-[25%]" src={EllipsisVertical} size="18" />
            </button>
        </div>
    </div>

</div>

<datalist id={(liveScript.length > 0 || showCompletions) ? id + "-console-completions" : ""}>
    <option value="clear()"/>
    <option value="print(x: any)"/>
    <option value="error(x: any)"/>

    {#if liveScript.startsWith("track")}
    <option value="track.play(fadein_sec?: number): void"/>
    <option value="track.pause(fadeout_sec?: number): void"/>
    <option value="track.paused(value?: boolean): boolean" />
    <option value="track.position(seconds?: number): number" />
    <option value="track.volume(channel: number, level?: number, seconds?: number): number" />
    <option value="track.pan_left(channel: number, level?: number, seconds?: number): number" />
    <option value="track.pan_right(channel: number, level?: number, seconds?: number): number" />
    <option value="track.reverb_level(channel: number, level?: number, seconds?: number): number" />
    <option value="track.channel_count(): number" />
    <option value="track.loop_point(start: number, end: number): {'{'}start: number, end: number{'}'}" />


        {#if liveScript.startsWith("track.marker")}
            <option value="track.marker.get(index: number | string): {'{'}name: string, position: number{'}'}"/>
            <option value="track.marker.count(): number"/>
            <option value="track.marker.add(name: string, ms: number): void"/>
            <option value="track.marker.edit(index: number|string, name: string, ms: number): void" />
        {:else}
            <option value="track.marker: namespace" />
        {/if}

        {#if liveScript.startsWith("track.preset")}
            <option value="track.preset.apply(index: number|string, seconds: number): void" />
            <option value="track.preset.get_name(index: number): string" />
            <option value="track.preset.count(): number" />
        {:else}
            <option value="track.preset: namespace" />
        {/if}
    {:else}
        <option value="track: namespace" />
    {/if}
</datalist>

<style>
    .shadow-bottom {
        box-shadow: 0 -4px 3px -1px#00000010, 0 -2px 8px -4px #00000090, var(--tw-ring-shadow), 0 0 #000;
    }

    .Grid {
        display: grid;
        grid-template-rows: auto 1fr;
    }
</style>
