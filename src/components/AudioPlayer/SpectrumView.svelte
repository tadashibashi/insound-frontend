<script lang="ts">
    import { onMount } from "svelte";

    export let data: Uint8Array;
    export let progress: number | undefined = undefined;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    $: if (data && ctx)
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let num = 0;
        const len = Math.min(data.length, 1024/4);

        for (let i = 0; i < len; ++i, ++num)
        {
            const scale = data[Math.floor(i)] / 255;
            const height = Math.log1p(scale * 100) * 15;

            if (progress !== undefined)
            {
                ctx.fillStyle = (progress > i / len) ?
                    `rgba(200 200 200 / ${scale * .5}` :
                    `rgba(100 100 100 / ${scale * .5})`;
;
            }
            else
            {
                ctx.fillStyle = `rgba(0 0 0 / ${scale * .2})`;
            }

            ctx.beginPath();
            ctx.roundRect(num * 4, 100 - height, 4, height, 40);
            ctx.fill();
        }
    }

    onMount(() => {
        const tempContext = canvas.getContext("2d");
        if (tempContext)
            ctx = tempContext;
    });

</script>

<div class={($$props.class || "") + " pointer-events-none h-[50px] overflow-hidden"}>
    <canvas class="w-full h-full z-10 pointer-events-none" bind:this={canvas} width="{1024}" height="100">
    </canvas>
</div>

