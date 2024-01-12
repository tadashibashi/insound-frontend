<script lang="ts">
    import { onMount } from "svelte";

    // ----- Attributes -------------------------------------------------------
    export let width: string = "100px";
    export let onclick: () => void = () => {};

    // ----- State ------------------------------------------------------------

    let isHovering: boolean = false;
    let isDown: boolean = false;

    // ----- Event handlers ---------------------------------------------------

    function handlePointerDownBtn()
    {
        isDown = true;
    }

    function handlePointerUpGlobal()
    {
        isDown = false;
        if (isHovering)
        {
            onclick();
        }
    }

    function handlePointerEnterBtn()
    {
        isHovering = true;
    }

    function handlePointerLeaveBtn()
    {
        isHovering = false;
    }

    onMount(() => {
        document.addEventListener("pointerup", handlePointerUpGlobal);

        return () => {
            document.removeEventListener("pointerup", handlePointerUpGlobal);
        };
    });

</script>

<div class={$$props.class}
    style={`width: ${width};`}
>
    <div class="cursor-pointer w-full aspect-square rounded-full flex justify-center items-center"
        on:pointerdown={handlePointerDownBtn}
        on:pointerenter={handlePointerEnterBtn}
        on:pointerleave={handlePointerLeaveBtn}
    >
       <slot />
    </div>
</div>
