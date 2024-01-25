<script lang="ts">
    import { Transition } from "@rgossiaux/svelte-headlessui";
    import { onMount } from "svelte";
    import { Icon, SpeakerWave, SpeakerXMark } from "svelte-hero-icons";

    /** Volume slider's initial level (default: 1) */
    export let initVolume: number = 1;
    let volume = initVolume;
    let lastVolume = volume;
    let hovering = false;
    let dragging = false;
    export let show = false;

    $: if (hovering) show = true;

    let tracklineEl: HTMLElement;

    /** Fires when the volume level changes */
    export let onchange: ((level: number) => void) | undefined = undefined;

    // Manually handle mouse movement while dragging the slider
    function handleMouseMove(evt: MouseEvent)
    {
        if (dragging && tracklineEl)
        {
            const rect = tracklineEl.getBoundingClientRect();
            const value = (Math.max(Math.min(rect.right, evt.x), rect.left) - rect.left) / rect.width;
            setVolume(value);
        }
    }

    function setVolume(level: number)
    {
        if (volume !== level)
        {
            volume = level;
            if (onchange)
                onchange(Math.min(Math.max(Math.log2(volume + 1), 0), 1)); // apply logarithm on result curve
        }
    }

    // Handles all mouse ups in the document
    function handleMouseUp(evt: MouseEvent)
    {
        if (dragging)
        {
            dragging = false;
        }
    }

    // Set up and break down callback handlers
    onMount(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    });
</script>

<div
    role="group"
    class="group h-full flex items-center pr-3"
    on:mouseenter={() => {
        hovering = true;
    }}
    on:mouseleave={() => hovering = false}
>
    <!-- Volume icon button: mutes/unmutes volume level -->
    <button class="h-full flex items-center {show && volume > 0 ? "text-white" : ""}"
        aria-roledescription="This button mutes and unmutes the audio; while hovering over it, it opens the volume slider to the right"
        on:click={() => {
            if (volume > 0)
            {
                lastVolume = volume;
                setVolume(0);
            }
            else
            {
                setVolume(lastVolume);
            }
        }}
    >
        <!-- Volume icon -->
        <Icon src={volume === 0 ? SpeakerXMark : SpeakerWave}
            size="20" mini class="mr-2 scale-90 sm:scale-100" />
    </button>

    <!-- Horizontal slider -->
    <Transition
        class="h-full relative z-40 flex items-center origin-left"
        show={show || (dragging || hovering)}
        enter="transition-all duration-200 ease-in-out"
        enterFrom="scale-x-0 w-[0px] opacity-0"
        enterTo="scale-x-100 w-[60px] opacity-100"
        leave="transition-all duration-200 ease-in-out"
        leaveFrom="scale-x-100 w-[60px] opacity-100"
        leaveTo="scale-x-0 w-[0px] opacity-0"
    >
        <!-- Track line container -->
        <button class="relative h-4 w-[60px] box-border py-1 my-auto"
            role="slider"
            aria-roledescription="Controls the main volume level"
            aria-valuenow={volume}
            aria-valuemin={0}
            aria-valuemax={1}
            bind:this={tracklineEl}
            on:mousedown={() => dragging = true}
        >
            <!-- Track line -->
            <div class="bg-[#c0c0c0] w-full h-1 rounded-full">
                <!-- Knob slider -->
                <button
                class={`absolute inline-block w-2 h-2 rounded-full shadow-lg ${(volume > 0 ? "bg-gray-100" : "bg-gray-200")}`}
                on:mousedown={() => dragging = true}
                style={`transform: translateY(-25%);
                    left: calc(${volume * 100}% - 4px)
                `}
                />
                <!-- Progress bar -->
                <div class="h-full rounded-full bg-gray-500" style={`width: ${volume * 100}%`}></div>
            </div>

        </button>

    </Transition>
</div>

