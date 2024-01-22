<script lang="ts">
    import { WaveMorpher } from "app/util/WaveMorpher";
    import { onMount } from "svelte";

    import { createShaderProgram } from "app/util/gl";

    export let wave: WaveMorpher;

    let canvas: HTMLCanvasElement;

    onMount(() => {
        /** Shader program */
        let program: WebGLProgram | null = null;
        let bufferWaveData: WebGLBuffer[] = [];
        let uScalesLoc: WebGLUniformLocation | null = null;
        let uProgressLoc: WebGLUniformLocation | null = null;
        let aWaveLoc: number[] = [];

        const gl = canvas.getContext("webgl2");
        if (!gl)
        {
            throw Error("Failed to initialize WebGL. May be unsupported by the browser.");
        }

        let vao: WebGLVertexArrayObject | null;
        let progress = 0;

        // set viewport
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // initial background
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        wave.onLoadCallback = () => {
            const length = wave.waveData.length;
            const source = genShaderSource(wave);

            if (program)
                gl.deleteProgram(program);
            program = createShaderProgram(gl, source.vertex, source.fragment);

            uScalesLoc = gl.getUniformLocation(program, "u_scales");
            uProgressLoc = gl.getUniformLocation(program, "u_progress");

            aWaveLoc.length = 0;
            for (let i = 0; i < length; ++i)
            {
                aWaveLoc.push(gl.getAttribLocation(program, "a_wave" + i.toString()));
            }

            gl.useProgram(program);

            // set initial scales value
            const volumes = wave.getCurrentVolumes();
            gl.uniform1fv(uScalesLoc, volumes, 0);

            // Set up vertex buffers
            if (vao)
                gl.deleteVertexArray(vao);
            vao = gl.createVertexArray();
            if (!vao)
                throw Error("Failed to create WebGL2 VAO");

            gl.bindVertexArray(vao);

            const buffers: WebGLBuffer[] = [];
            for (let i = 0; i < length; ++i)
            {
                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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
                buffers.push(buffer as WebGLBuffer);
            }

            // clean up existing buffers
            if (bufferWaveData.length > 0)
            {
                for (const buf of bufferWaveData)
                    gl.deleteBuffer(buf);
            }
            bufferWaveData = buffers;

            gl.drawArrays(gl.LINES, 0, wave.width * 2);
        };

        wave.onUnloadCallback = () => {
            
        };

        wave.onUpdateCallback = (prog: number) => {
            if (wave.waveData.length === 0) return;

            progress = prog;
            render();
        };

        wave.onChangeCallback = () => {
            if (wave.waveData.length === 0) return;

            render();
        };

        function render() {
            if (program && gl)
            {
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindVertexArray(vao);

                const volumes = wave.getCurrentVolumes();
                gl.uniform1fv(uScalesLoc, volumes, 0);
                gl.uniform1f(uProgressLoc, progress);

                gl.drawArrays(gl.LINES, 0, wave.width * 2);
            }
        }

        () => {
            if (gl)
            {
                if (program)
                    gl.deleteProgram(program);
                if (bufferWaveData.length)
                {
                    for (const buf of bufferWaveData)
                        gl.deleteBuffer(buf);
                }
                if (vao)
                    gl.deleteVertexArray(vao);
            }
        }
    });



    function genShaderSource(wave: WaveMorpher): {vertex: string, fragment: string}
    {
        const length = wave.waveData.length;

        // vertex shader source
        let vertex = "#version 300 es\n";

        for (let i = 0; i < length; ++i)
        {
            vertex += "in float a_wave" + i.toString() + ";\n";
        }
        vertex += "const int NUM_CHANNELS = " + (length + 1) + ";\n" +
            "const int WIDTH = " + wave.width + ";\n" +
            "uniform float u_scales[NUM_CHANNELS];\n" +
            "uniform float u_position;\n" +
            "out highp float total;\n" +
            "out highp float xPos;\n" +
            "void main() {\n";

        vertex += "total = ";
        for (let i = 0; i < length; ++i)
        {
            vertex += "    a_wave" + i.toString() + " * u_scales[" + (i+1).toString() + "]" +
                (i === length - 1 ? ";\n" : " + ");
        }
        vertex +=
            "    total = total * u_scales[0];\n" +
            "    bool isNegative = total < 0.0;\n" +
            "    total = max(min(log2(log2(abs(total) + 1.0) + 1.0), 1.0), -1.0);\n" +
            "    if (isNegative)\n" +
            "        total = -total;\n" +
            "    float width = float(WIDTH);\n" +
            "    float index = float(gl_VertexID);\n" +
            "    gl_Position = vec4(min(max(floor(index/2.0) / width * 2.0 - 1.0, -1.0), 1.0), total, 0, 1.0);\n" +
            "    xPos = gl_Position.x;\n" +
            "}";

        // create fragment shader source
        let fragment = "#version 300 es\n" +
            "precision highp float;\n" +
            "uniform float u_scales[" + (length + 1) + "];\n" +
            "uniform float u_progress;\n" +
            "in highp float xPos;\n" +
            "in highp float total;\n" +
            "out vec4 outColor;\n" +
            "void main() {\n" +
            "    bool beforePlayhead = u_progress * 2.0 - 1.0 > xPos;\n" +
            "    float amt = beforePlayhead ? .9 : (1.0 - abs(total * 0.75) - 0.25);\n" +
            "    outColor = vec4(amt, amt, amt, 1.0);\n" +
            "}";

        return {
            vertex,
            fragment,
        };
    }
</script>

<div class={$$props.class}>
    <canvas class="w-full h-full" bind:this={canvas} width="{wave.width}" height="100">
    </canvas>
</div>

