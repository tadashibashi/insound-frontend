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

export function createShaderProgram(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram
{
    const vShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fShader: WebGLShader;
    try {
        fShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    }
    catch(err)
    {
        gl.deleteShader(vShader);
        throw err;
    }

    let program: WebGLProgram;
    try {
        program = createProgram(gl, vShader, fShader);
        gl.detachShader(program, vShader);
        gl.detachShader(program, fShader);
    }
    finally
    {
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
    }

    return program;
}
