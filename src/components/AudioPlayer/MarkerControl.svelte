<script lang="ts">
    import type { MultiTrackControl } from "audio/MultiTrackControl";
    import type { SyncPointMgr } from "audio/SyncPointMgr";
    import { onMount } from "svelte";
    import Switch from "app/components/widgets/Switch.svelte";
    import { util } from "app/util";

    export let markers: SyncPointMgr;
    export let track: MultiTrackControl;
    export let looping: boolean = true;
    export let showMarkers: boolean = true;

    $: loopStart = markers.getByName("LoopStart");
    $: loopEnd = markers.getByName("LoopEnd");

    const id = util.genRandHex(6);

    let selection = -1;

    function handleLoad()
    {
        // just notify an update to the ui
        markers = markers;
    }


    function getLoopOffset(name: string)
    {
        const startMarker = markers.getByName(name);
        if (!startMarker)
            throw Error(`Marker "${name}" was not found!`);
        return startMarker.offset;
    }

    function setupLoopInput(node: HTMLInputElement)
    {
        const inputCallbacks = setupInput(node);

        const handleClick = () => {
            node.readOnly = false;
        };

        node.addEventListener("click", handleClick);

        return {
            destroy() {
                inputCallbacks.destroy();
                node.removeEventListener("click", handleClick);
            }
        }
    }

    function setupInput(node: HTMLInputElement)
    {
        function handleChange()
        {
            node.readOnly = true;
            window.getSelection()?.removeAllRanges();

            const value = (node.dataset["value"] || "");
            const field = (node.dataset["field"]);
            const index = parseInt(node.dataset["index"] || "");
            if (isNaN(index))
                throw Error("Could not parse Marker input index");

            if (node.value !== value)
            {
                console.log("value changed");
                const marker = markers.get(index);
                if (!marker) return;

                if (field === "name")
                {
                    marker.name = node.value;
                }
                else if (field === "offset")
                {
                    let newOffset = parseInt(node.value);
                    if (isNaN(newOffset))
                        newOffset = 0;

                    if (marker.name === "LoopStart")
                    {
                        const end = getLoopOffset("LoopEnd");
                        if (newOffset > end)
                            newOffset = end - 1;
                    }
                    else if (marker.name === "LoopEnd")
                    {
                        const start = getLoopOffset("LoopStart");
                        if (newOffset < start)
                            newOffset = start + 1;
                    }

                    newOffset = Math.max(Math.min(newOffset, track.length * 1000), 0);

                    node.value = newOffset.toString();
                    marker.offset = parseInt(node.value);
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

    onMount(() => {
        track.onload.addListener(handleLoad);

        return () => {
            track.onload.removeListener(handleLoad);
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
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1" type="number"
                    data-index={markers.points.findIndex(m => m.name === "LoopStart")}
                    data-value={loopStart?.offset || 0}
                    value={loopStart?.offset || 0}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
            <label class={"pe-1 text-xs font-light transition-colors " + (looping ? "" : "text-gray-100")}>
                to
                <input use:setupLoopInput class="w-20 ps-2 py-[1px] rounded-md border border-gray-100 read-only:bg-transparent select-none bg-white px-1" type="number"
                    data-index={markers.points.findIndex(m => m.name === "LoopEnd")}
                    data-value={loopEnd?.offset || 0}
                    value={loopEnd?.offset || 0}
                    data-field="offset"
                    disabled={!looping}
                />
            </label>
        </div>
    </div>

    <!-- Table -->
    <div class="w-full text-xs border border-gray-200 bg-gray-50 border-b-transparent flex flex-col" on:focusout={() => selection = -1}>

        <!-- Header row -->
        <div class="TableRow bg-gray-200 text-gray-500 cursor-default w-full h-[32px] overflow-y-scroll">
            <div class="text-center py-2 border-r border-r-gray-300 overflow-ellipsis font-light">
                <div class="text-center">Name</div>
            </div>

            <div class="text-center px-[6vmin] py-2 overflow-ellipsis font-light ">
                <div class="inline-block text-center w-auto px-2">Position <span class="font-mono text-[10px]">(ms)</span></div>
            </div>
        </div>

        <!-- Body -->
        <div class="block text-gray-700 overflow-y-scroll h-[264px]">

            {#each markers.points as marker, i (marker)}
            {#if marker.name !== "LoopStart" && marker.name !== "LoopEnd"}
            <button
              class={ "TableRow cursor-pointer " + (selection === i ? "read-only:bg-violet-300 read-only:text-white" :  (i % 2 === 0 ? "bg-gray-100" : "bg-gray-50")) }
              on:click={() => {track.position = marker.offset * .001; selection = i; }}
            >
                <!-- data: marker name -->
                <div class="px-[6vmin] border-r border-r-gray-200 overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput
                        class={"w-full h-full rounded-md read-only:cursor-pointer read-only:select-none px-2 py-1 overflow-ellipsis overflow-hidden read-only:bg-transparent text-gray-500 bg-white " +
                            (selection === i ? "read-only:text-white text-gray-500 read-only:shadow-none shadow-inner" : "text-gray-500")}
                        value={marker.name}
                        data-index={i} data-value={marker.name} data-field="name" />
                </div>

                <!-- data: marker position -->
                <div class="px-[6vmin] w-auto overflow-ellipsis whitespace-nowrap">
                    <input use:setupInput
                        type="number"
                        min="0"
                        step="1"
                        class={"w-full inline-block rounded-md read-only:cursor-pointer read-only:select-none px-2 py-1 overflow-ellipsis overflow-hidden read-only:bg-transparent text-gray-500 bg-white " +
                            (selection === i ? "read-only:text-white text-gray-500 read-only:shadow-none shadow-inner" : "text-gray-500")}
                        value={marker.offset}
                        data-index={i} data-value={marker.offset} data-field="offset" />
                </div>
            </button>
            {/if}
            {/each}

            <!-- Any trailing empty rows -->
            {#if (13 - markers.length > 0)}
                {#each {length: 13 - markers.length} as _, i ("extra-row-" + i)}
                    <div class={ "TableRow  " + ((markers.points.length - 1 + i) % 2 === 0 ? "bg-gray-100" : "bg-gray-50")}>
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

    /* Firefox */
    input[type=number]:focus:not(:read-only) {
        appearance: auto;
        -moz-appearance: auto;
    }

    input[type=number] {
        appearance: textfield;
        -moz-appearance: textfield;
    }

    /* Chrome, Safari, Edge, Opera */
    input:focus:not(:read-only)::-webkit-outer-spin-button,
    input:focus:not(:read-only)::-webkit-inner-spin-button {
        -webkit-appearance: auto;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
</style>
