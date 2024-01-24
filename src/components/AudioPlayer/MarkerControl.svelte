<script lang="ts">
    import type { MultiTrackControl } from "audio/MultiTrackControl";
    import { onMount } from "svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import { util } from "app/util";
    import type { AudioMarker, MarkerMgr } from "audio/MarkerMgr";

    export let markers: MarkerMgr;
    export let track: MultiTrackControl;
    export let looping: boolean = true;
    export let showMarkers: boolean = true;
    export let editMode: boolean = false;

    /** Whether key commands and inputs should work, aka when in view/focused*/
    let active: boolean = true;

    $: loopstart = markers.loopStart;
    $: loopend = markers.loopEnd;

    const id = util.genRandHex(6);

    let selection: AudioMarker | null = null;
    let entered: AudioMarker | null = null;

    let cursor = 0;

    function handleLoad()
    {
        // just notify an update to the ui
        markers = markers;
    }

    /** Action for loop point input elements */
    function setupLoopInput(node: HTMLInputElement)
    {
        if (!editMode) // don't setup input for interactivity if no editing
        {
            node.readOnly = true;
            return;
        }

        function handleInputChangeLoop(node: HTMLInputElement)
        {
            const name = node.dataset["index"];
            let value = parseFloat(node.value);
            if (isNaN(value))
            {
                throw Error("Loop offset input is invalid.");
            }

            if (name === "LoopStart")
            {
                // must come before loopend
                const loopEnd = markers.loopEnd;
                if (loopEnd && loopEnd.position <= value)
                {
                    value = loopEnd.position - .001;
                }

                markers.loopStart = {
                    name: "LoopStart",
                    position: value,
                };
            }
            else // LoopEnd
            {
                // must come after loopstart
                const loopStart = markers.loopStart;
                if (loopStart && loopStart.position >= value)
                {
                    value = loopStart.position + .001;
                }

                markers.loopEnd = {
                    name: "LoopEnd",
                    position: value,
                };
            }
        }

        // use general input setup
        const inputCallbacks = setupInput(node, handleInputChangeLoop);

        // add single-click callback as well
        const handleClick = () => {
            if (!active) return;

            node.readOnly = false;
        };

        node.addEventListener("click", handleClick);

        return {
            destroy() {
                // call destroy on setup input return value too
                inputCallbacks?.destroy();

                node.removeEventListener("click", handleClick);
            }
        }
    }

    function setupTable(node: HTMLElement)
    {
        function handleWindowClick(evt: MouseEvent)
        {
            if (!evt.target || !active) return;

            if (!node.contains(evt.target as Node))
            {
                selection = null;
                entered = null;
            }
        }

        window.addEventListener("click", handleWindowClick);

        return {
            destroy() {
                window.removeEventListener("click", handleWindowClick);
            }
        };
    }

    function handleInputChangeMarker(node: HTMLInputElement)
    {
        if (node.readOnly) return;

        node.readOnly = true;
        window.getSelection()?.removeAllRanges();

        const value = (node.dataset["value"] || "");
        const field = (node.dataset["field"]);
        const index = parseInt(node.dataset["index"] || "");
        if (isNaN(index))
            throw Error("Could not parse Marker input index");

        if (node.value !== value)
        {
            const marker = markers.array.at(index);
            if (!marker) return;

            switch(field)
            {
                case "name":
                {
                    // Prevent naming LoopStart and LoopEnd (TODO: notify the user that LoopStart/LoopEnd are reserved names)
                    if (node.value === "LoopStart" || node.value === "LoopEnd")
                        node.value = marker.name;
                    else
                        marker.name = node.value;

                    break;
                }

                case "offset":
                {
                    let newOffset = parseFloat(node.value);
                    if (isNaN(newOffset))
                        newOffset = 0;

                    markers.updatePositionByIndex(index, newOffset);
                    node.value = marker.position.toString();

                    // set the track position to match the selected marker
                    if (marker === selection)
                    {
                        track.position = newOffset * .001;
                    }
                break;
                }
                default:
                    throw Error("Invalid field name: \"" + field + "\"");
            }

            entered = marker;
        }
    }


    /** Action for input elements */
    function setupInput(node: HTMLInputElement, handleInputChange: (node: HTMLInputElement) => void)
    {
        if (!editMode) // don't setup input for interactivity if no editing
        {
            node.readOnly = true;
            return;
        }

        // Handles blur event after inputting
        function handleBlur(evt: FocusEvent)
        {
            handleInputChange(node);
        }

        function handleDoubleClick()
        {
            if (node.dataset["field"] === "name" &&
                (node.value === "LoopStart" || node.value === "LoopEnd") )
            {
                window.getSelection()?.removeAllRanges();
                return;
            }

            node.readOnly = false;
        }

        // Checks for "Enter" key when inputting
        function handleKeyDown(evt: KeyboardEvent)
        {
            evt.stopPropagation();
            if (node.readOnly === true) return;

            if (evt.key === "Enter")
            {
                handleInputChange(node);
            }
        }

        node.readOnly = true;

        node.addEventListener("blur", handleBlur);
        node.addEventListener("dblclick", handleDoubleClick);
        node.addEventListener("keydown", handleKeyDown);

        return {
            destroy() {
                node.removeEventListener("blur", handleBlur);
                node.removeEventListener("dblclick", handleDoubleClick);
                node.removeEventListener("keydown", handleKeyDown);
            }
        }
    }

    function handleCursorChanged(newCursor: number, oldCursor: number)
    {
        cursor = newCursor;
    }

    /** Grab marker from current position and name it by number of markers */
    function addMarker()
    {
        const marker = markers.push({
            name: "Marker " + (markers.length + 1),
            position: track.position * 1000,
        });

        selection = marker;
    }

    /** Delete current selected marker */
    function deleteMarker()
    {
        if (selection)
        {
            markers.erase(selection);
            selection = null;
            entered = null;
        }
    }

    /** Handle shortcuts for the marker control window */
    function handleKeyDown(evt: KeyboardEvent)
    {
        if (!active) return;

        if (evt.key === "Delete" || evt.key === "Backspace")
        {
            deleteMarker();
        }

        if ( (evt.metaKey && evt.key === "+") || (evt.altKey && evt.key === "'") ) // logic pro key command
        {
            addMarker();
        }
    }

    onMount(() => {
        track.onload.addListener(handleLoad);
        markers.oncursorchanged.addListener(handleCursorChanged);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            track.onload.removeListener(handleLoad);
            markers.oncursorchanged.removeListener(handleCursorChanged);
            window.removeEventListener("keydown", handleKeyDown);
        };
    });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bg-white w-full h-full overflow-hidden" role="group"
    on:click={evt => evt.stopImmediatePropagation()}
>
    <div class="flex justify-between items-center bg-gray-50 text-gray-400 border-t border-t-gray-100 h-[32px]">

        <!-- Show Markers option -->
        <div class="text-xs ms-2 h-full flex items-center">
            <label for={id + "-switch-markers"} class="me-2">Show Markers</label>
            <Switch width="32px" height="16px" bind:enabled={showMarkers} />
        </div>

        {#if editMode}
        <!-- Add / Delete buttons -->
        <div class="flex gap-1">
            <!-- Add marker button -->
            <div class="flex items-center">
                <button
                    class="rounded-full border border-gray-200 text-gray-400 text-xs px-2 py-[1px] whitespace-nowrap"
                    on:click={addMarker}
                >
                    Add
                </button>
            </div>

            <!-- Delete marker button -->
            <div class="flex items-center">
                <button
                    class="rounded-full border text-xs px-2 py-[1px] whitespace-nowrap {selection ? "text-gray-400 border-gray-200 cursor-pointer" : "text-gray-200 border-gray-100 cursor-default"}"
                    on:mousedown={deleteMarker}
                >
                    Delete
                </button>
            </div>
        </div>
        {/if}

        <!-- Loop Options -->
        <div class="h-full flex items-center">
            <label for={id + "-switch-looping"} class="text-xs me-2">Loop</label>
            <Switch id={id + "-switch-looping"} width="32px" height="16px" bind:enabled={looping} />

            <label class="ps-3 pe-1 text-xs font-light transition-colors {looping ? "" : "text-gray-100"}">
                from
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1"
                    type="number"
                    data-index={"LoopStart"}
                    data-value={loopstart?.position || 0}
                    value={loopstart?.position || 0}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
            <label class={"pe-1 text-xs font-light transition-colors " + (looping ? "" : "text-gray-100")}>
                to
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1"
                    type="number"
                    data-index={"LoopEnd"}
                    data-value={loopend?.position || 0}
                    value={loopend?.position || 0}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
        </div>
    </div>

    <!-- Table -->
    <div class="w-full text-xs border border-gray-200 bg-gray-50 border-b-transparent flex flex-col"
        on:focusout={evt => {if (!evt.relatedTarget) {selection = entered;} } }
        use:setupTable
    >

        <!-- Header row -->
        <div class="TableRow hide-scrollbar bg-gray-200 text-gray-500 cursor-default w-full h-[32px] overflow-y-scroll">
            <div class="text-center py-2 border-r h-full border-r-gray-300 overflow-ellipsis font-light overflow-hidden">
                <div class="text-center">Name</div>
            </div>

            <div class="text-center h-full px-[6vmin] py-2 overflow-ellipsis font-light overflow-hidden">
                <div class="inline-block text-center w-auto px-2">Position <span class="font-mono text-[10px]">(ms)</span></div>
            </div>
        </div>

        <!-- Body -->
        <div class="block text-gray-700 overflow-y-scroll h-[260px]"
        >

            <!-- cursor -->
            <div class={"relative transition-transform h-0 border border-violet-100 w-full z-10 " + (cursor === -1 ? "sr-only" : "")}
                style={`transform: translateY(${cursor * 24}px);`}
            />

            {#each markers.array as marker, i (marker)}
            <button
              class={ "TableRow cursor-pointer " + (selection === marker ? "read-only:bg-violet-300 read-only:text-white" :  (i % 2 === 0 ? "bg-gray-100" : "bg-gray-50")) }
              on:mousedown={() => {track.position = marker.position * .001; selection = marker;}}
            >
                <!-- data: marker name -->
                <div class="px-[6vmin] border-r border-r-gray-200 overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput={handleInputChangeMarker}
                        class={"w-full h-full rounded-md read-only:cursor-pointer read-only:select-none px-2 py-1 overflow-ellipsis overflow-hidden read-only:bg-transparent text-gray-500 bg-white " +
                            (selection === marker ? "read-only:text-white text-gray-500 read-only:shadow-none shadow-inner" : "text-gray-500")}
                        value={marker.name}
                        data-index={i} data-value={marker.name} data-field="name"
                        spellcheck="false" />
                </div>

                <!-- data: marker position -->
                <div class="px-[6vmin] w-auto overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput={handleInputChangeMarker}
                        type="number"
                        min="0"
                        step="1"
                        class={"w-full inline-block rounded-md read-only:cursor-pointer read-only:select-none px-2 py-1 overflow-ellipsis overflow-hidden read-only:bg-transparent text-gray-500 bg-white " +
                            (selection === marker ? "read-only:text-white text-gray-500 read-only:shadow-none shadow-inner" : "text-gray-500")}
                        value={marker.position}
                        data-index={i} data-value={marker.position} data-field="offset"
                        spellcheck="false" />
                </div>
            </button>
            {/each}

            <!-- Any trailing empty rows -->
            {#if (11 - markers.length > 0)}
                {#each {length: 11 - markers.length} as _, i ("extra-row-" + i)}
                    <button class="TableRow {(markers.length - 1 + i) % 2 !== 0 ? "bg-gray-100" : "bg-gray-50"}" on:pointerdown={() => selection = null}>
                        <div class="border-r border-r-gray-200 px-[6vmin]"><input class="bg-transparent w-full inline-block opacity-100 px-2 py-1" disabled /></div>
                        <div class="px-[6vmin]"><input class="bg-transparent w-full opacity-100 px-2 py-1 inline-block" disabled /></div>
                    </button>

                {/each}
            {/if}

        </div>
    </div>

</div>

<style>
    .TableRow {
        display: grid;
        grid-template-columns: 5fr 3fr;
        width: 100%;
        scrollbar-gutter: stable;
    }

    input[type=number] {
        appearance: textfield;
        -moz-appearance: textfield;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }

    .hide-scrollbar::-webkit-scrollbar {
        opacity: 0;
    }
</style>
