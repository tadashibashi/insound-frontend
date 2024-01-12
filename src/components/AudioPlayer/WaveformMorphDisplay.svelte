<script lang="ts">
    import { WaveMorpher } from "app/util/WaveMorpher";
    import { onMount } from "svelte";

    import { createProgram, createShader } from "app/util/gl";

    export let wave: WaveMorpher;

    let canvas: HTMLCanvasElement;

    onMount(() => {
        /** Shader program */
        let program: WebGLProgram | null = null;
        let bufferWaveData: WebGLBuffer[] = [];
        let uScalesLoc: WebGLUniformLocation | null = null;
        let aWaveLoc: number[] = [];

        const gl = canvas.getContext("webgl2");
        if (!gl)
        {
            throw Error("Failed to initialize WebGL. May be unsupported by the browser.");
        }

        let vao = gl.createVertexArray();


        // set viewport
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // initial background
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        wave.onLoadCallback = () => {

            const length = wave.waveData.length;

            // generate vertex shader source
            let vShaderSource = "#version 300 es\n";

            for (let i = 0; i < length; ++i)
            {
                vShaderSource += "in float a_wave" + i.toString() + ";\n";
            }
            vShaderSource += "const int NUM_CHANNELS = " + (length + 1) + ";\n" +
                "const int WIDTH = " + wave.width + ";\n" +
                "uniform float u_scales[NUM_CHANNELS];\n" +
                "out highp float total;\n" +
                "void main() {\n";

            vShaderSource += "total = ";
            for (let i = 0; i < length; ++i)
            {
                vShaderSource += "    a_wave" + i.toString() + " * u_scales[" + (i+1).toString() + "]" +
                    (i === length - 1 ? ";\n" : " + ");
            }
            vShaderSource +=
                "    total = total * u_scales[0];\n" +
                "    bool isNegative = total < 0.0;\n" +
                "    total = max(min(log2(log2(abs(total) + 1.0) + 1.0), 1.0), -1.0);\n" +
                "    if (isNegative)\n" +
                "        total = -total;\n" +
                "    float width = float(WIDTH);\n" +
                "    float index = float(gl_VertexID);\n" +
                "    gl_Position = vec4(min(max(floor(index/2.0) / width * 2.0 - 1.0, -1.0), 1.0), total, 0, 1.0);\n" +
                "}";

            // create fragment shader source
            let fShaderSource = "#version 300 es\n" +
                "precision highp float;\n" +
                "uniform float u_scales[" + (length + 1) + "];\n" +
                "in highp float total;\n" +
                "out vec4 outColor;\n" +
                "void main() {\n" +
                "    float amt = 1.0 - abs(total * 0.75) - 0.25;\n" +
                "    outColor = vec4(amt, amt, amt, 1.0);\n" +
                "}";

            if (program)
                gl.deleteProgram(program);
            const vShader = createShader(gl, vShaderSource, gl.VERTEX_SHADER);
            const fShader = createShader(gl, fShaderSource, gl.FRAGMENT_SHADER);

            program = createProgram(gl, vShader, fShader);
            gl.detachShader(program, vShader);
            gl.detachShader(program, fShader);
            gl.deleteShader(vShader);
            gl.deleteShader(fShader);

            uScalesLoc = gl.getUniformLocation(program, "u_scales");

            aWaveLoc.length = 0;
            for (let i = 0; i < length; ++i)
            {
                aWaveLoc.push(gl.getAttribLocation(program, "a_wave" + i.toString()));
            }

            gl.useProgram(program);

            // set up wave buffers
            if (bufferWaveData.length > 0)
            {
                for (const buf of bufferWaveData)
                    gl.deleteBuffer(buf);
            }
            bufferWaveData.length = 0;
            for (let i = 0; i < length; ++i)
                bufferWaveData.push(gl.createBuffer() as WebGLBuffer);

            // set initial scales value
            const volumes = wave.getCurrentVolumes();
            gl.uniform1fv(uScalesLoc, volumes, 0);

            gl.bindVertexArray(vao);

            // set initial wave data buffers
            for (let i = 0; i < length; ++i)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferWaveData[i]);
                gl.bufferData(gl.ARRAY_BUFFER, wave.waveData[i], gl.STATIC_DRAW);

                gl.enableVertexAttribArray(aWaveLoc[i]);
                {
                    const size = 1;
                    const type = gl.FLOAT;
                    const normalize = false;
                    const stride = 0;
                    const offset = 0;
                    gl.vertexAttribPointer(aWaveLoc[i], size, type, normalize, stride, offset);
                }
            }

            gl.drawArrays(gl.LINES, 0, wave.width * 2);
        };

        wave.onChangeCallback = () => {
            if (program)
            {
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindVertexArray(vao);

                const volumes = wave.getCurrentVolumes();
                gl.uniform1fv(uScalesLoc, volumes, 0);

                gl.drawArrays(gl.LINES, 0, wave.width * 2);
            }
        };

        () => {
            if (gl)
            {
                if (program)
                    gl.deleteProgram(program);
                if (bufferWaveData)
                    gl.deleteBuffer(bufferWaveData);
                if (vao)
                    gl.deleteVertexArray(vao);
            }
        }
    });
</script>

<div class={$$props.class}>
    <canvas class="w-full h-full" bind:this={canvas} width="{wave.width}" height="100">
    </canvas>
</div>

