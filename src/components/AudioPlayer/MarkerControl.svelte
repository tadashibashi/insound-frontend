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

    let loopPoints: {loopstart: number, loopend: number} = { loopstart: 0, loopend: 0 };

    const id = util.genRandHex(6);

    let selection: AudioMarker | null;

    let cursor = 0;

    /** Find marker cursor index, minus LoopStart/LoopEnd */
    function findCursor(current: number)
    {
        let cursor = 0;
        for (let i = 0; i < current; ++i)
        {
            const curName = markers.array[i].name;
            if (curName === "LoopStart" || curName === "LoopEnd")
                continue;
            ++cursor;
        }

        return cursor;
    }

    function handleLoad()
    {
        loopPoints = track.loopPoints;

        // just notify an update to the ui
        markers = markers;
    }

    /** Action for loop point input elements */
    function setupLoopInput(node: HTMLInputElement)
    {
        // use general input setup
        const inputCallbacks = setupInput(node);

        // add single-click callback as well
        const handleClick = () => {
            node.readOnly = false;
        };

        node.addEventListener("click", handleClick);

        return {
            destroy() {
                // call destroy on setup input return value too
                inputCallbacks.destroy();

                node.removeEventListener("click", handleClick);
            }
        }
    }

    /** Action for input elements */
    function setupInput(node: HTMLInputElement)
    {
        // Applies input change
        function handleChange()
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

                if (field === "name") // update marker name
                {
                    // Prevent naming LoopStart and LoopEnd (TODO: notify the user that LoopStart/LoopEnd are reserved names)
                    if (node.value === "LoopStart" || node.value === "LoopEnd")
                        node.value = marker.name;
                    else
                        marker.name = node.value;
                }
                else if (field === "offset") // update marker offset
                {
                    let newOffset = parseFloat(node.value);
                    if (isNaN(newOffset))
                        newOffset = 0;

                    node.readOnly = true;

                    if (marker.name === "LoopStart")
                    {
                        const end = loopPoints.loopend;
                        if (end < newOffset)
                            newOffset = end;
                        newOffset = Math.max(Math.min(newOffset, track.length * 1000), 0);

                        track.setLoopPoint(newOffset, end);

                        return;
                    }
                    else if (marker.name === "LoopEnd")
                    {
                        const start = loopPoints.loopstart;
                        if (start > newOffset)
                            newOffset = start;
                        newOffset = Math.max(Math.min(newOffset, track.length * 1000), 0);

                        track.setLoopPoint(start, newOffset);
                        return;
                    }

                    markers.updatePositionByIndex(index, newOffset);
                    node.value = marker.position.toString();

                    if (marker === selection)
                    {
                        track.position = newOffset * .001;
                    }
                }
            }
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

        function handleKeyDown(evt: KeyboardEvent)
        {
            evt.stopPropagation();
            if (node.readOnly === true) return;

            if (evt.key === "Enter")
            {
                handleChange();
            }
        }

        node.readOnly = true;

        node.addEventListener("blur", handleChange);
        node.addEventListener("dblclick", handleDoubleClick);
        node.addEventListener("keydown", handleKeyDown);

        return {
            destroy() {
                node.removeEventListener("blur", handleChange);
                node.removeEventListener("dblclick", handleDoubleClick);
                node.removeEventListener("keydown", handleKeyDown);
            }
        };
    }

    function handleCursorChanged(newCursor: number, oldCursor: number)
    {
        cursor = findCursor(markers.current);
    }

    onMount(() => {
        track.onload.addListener(handleLoad);
        markers.oncursorchanged.addListener(handleCursorChanged);

        return () => {
            track.onload.removeListener(handleLoad);
            markers.oncursorchanged.removeListener(handleCursorChanged);
        };
    });
</script>

<div class="bg-white w-full h-full overflow-hidden">
    <div class="flex justify-between items-center bg-gray-50 text-gray-400 border-t border-t-gray-100 h-[32px]">
        <div class="text-xs ms-2 h-full flex items-center">
            <label for={id + "-switch-markers"} class="me-2">Show Markers</label>
            <Switch width="32px" height="16px" bind:enabled={showMarkers} />
        </div>
        <!-- Loop Options -->
        <div class="h-full flex items-center">
            <label for={id + "-switch-looping"} class="text-xs me-2">Loop</label>
            <Switch id={id + "-switch-looping"} width="32px" height="16px" bind:enabled={looping} />

            <label class={"ps-3 pe-1 text-xs font-light transition-colors " + (looping ? "" : "text-gray-100")}>
                from
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1"
                    type="number"
                    data-index={markers.findIndexByName("LoopStart")}
                    data-value={loopPoints.loopstart}
                    value={loopPoints.loopstart}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
            <label class={"pe-1 text-xs font-light transition-colors " + (looping ? "" : "text-gray-100")}>
                to
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1"
                    type="number"
                    data-index={markers.findIndexByName("LoopEnd")}
                    data-value={loopPoints.loopend}
                    value={loopPoints.loopend}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
        </div>
    </div>

    <!-- Table -->
    <div class="w-full text-xs border border-gray-200 bg-gray-50 border-b-transparent flex flex-col" on:focusout={() => selection = null}>

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
        <div class="block text-gray-700 overflow-y-scroll h-[264px]">


            <div class={"absolute transition-transform h-0 border border-violet-100 w-full" + (cursor === -1 ? "sr-only" : "")}
                style={`transform: translateY(${cursor * 24}px);`}
            />

            {#each markers.array as marker, i (marker)}
            {#if marker.name !== "LoopStart" && marker.name !== "LoopEnd"}
            <button
              class={ "TableRow cursor-pointer " + (selection === marker ? "read-only:bg-violet-300 read-only:text-white" :  (i % 2 === 0 ? "bg-gray-100" : "bg-gray-50")) }
              on:click={() => {track.position = marker.position * .001; selection = marker;}}
            >
                <!-- data: marker name -->
                <div class="px-[6vmin] border-r border-r-gray-200 overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput
                        class={"w-full h-full rounded-md read-only:cursor-pointer read-only:select-none px-2 py-1 overflow-ellipsis overflow-hidden read-only:bg-transparent text-gray-500 bg-white " +
                            (selection === marker ? "read-only:text-white text-gray-500 read-only:shadow-none shadow-inner" : "text-gray-500")}
                        value={marker.name}
                        data-index={i} data-value={marker.name} data-field="name"
                        spellcheck="false" />
                </div>

                <!-- data: marker position -->
                <div class="px-[6vmin] w-auto overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput
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
            {/if}
            {/each}

            <!-- Any trailing empty rows -->
            {#if (13 - markers.length > 0)}
                {#each {length: 13 - markers.length} as _, i ("extra-row-" + i)}
                    <div class={ "TableRow  " + ((markers.length - 1 + i) % 2 === 0 ? "bg-gray-100" : "bg-gray-50")}>
                        <div class="border-r border-r-gray-200 px-[6vmin]"><input class="bg-transparent w-full inline-block opacity-100 px-2 py-1" disabled /></div>
                        <div class="px-[6vmin]"><input class="bg-transparent w-full opacity-100 px-2 py-1 inline-block" disabled /></div>
                    </div>

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
