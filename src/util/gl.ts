export function createShader(gl: WebGL2RenderingContext, source: string, type: number)
{
    const shader = gl.createShader(type);
    if (!shader)
    {
        throw Error("Error creating shader");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        const info = gl.getShaderInfoLog(shader);
        throw Error("Failed to compile shader" + (info ? ": " + info : ""));
    }

    return shader;
}

export function createProgram(gl: WebGL2RenderingContext,
    vertexShader: WebGLShader, fragmentShader: WebGLShader)
{
    const program = gl.createProgram();
    if (!program)
    {
        throw Error("WebGL failed to create shader program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        const infoLog = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw Error("Failed to link shader program" +
            (infoLog ? ": " + infoLog : ""));
    }

    return program;
}
