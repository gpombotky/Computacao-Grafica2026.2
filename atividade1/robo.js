
function iniciarrobo(){
const canvas = document.getElementById("canvasrobo");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. FUNÇÃO PARA CRIAR UM RETÂNGULO
// --------------------------------------------------

function criarRetangulo(x, y, largura, altura) {

    return new Float32Array([
        // Triângulo 1
        x, y,
        x + largura, y,
        x, y + altura,

        // Triângulo 2
        x + largura, y,
        x + largura, y + altura,
        x, y + altura
    ]);
}


// --------------------------------------------------
// 2. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

`;


// --------------------------------------------------
// 3. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
    outColor = uColor;
}

`;


// --------------------------------------------------
// 4. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 5. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 6. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );


// --------------------------------------------------
// 7. BUFFER
// --------------------------------------------------

const buffer = gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);

gl.enableVertexAttribArray(
    positionLocation
);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);


// --------------------------------------------------
// 8. FUNÇÃO PARA DESENHAR RETÂNGULO
// --------------------------------------------------

function desenharRetangulo(
    x,
    y,
    largura,
    altura,
    cor
) {

    const vertices = criarRetangulo(
        x,
        y,
        largura,
        altura
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    gl.uniform4f(
        colorLocation,
        cor[0],
        cor[1],
        cor[2],
        1.0
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );
}


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(
    0.05,
    0.05,
    0.05,
    1.0
);

gl.clear(
    gl.COLOR_BUFFER_BIT
);

gl.useProgram(program);


// --------------------------------------------------
// 10. CORES
// --------------------------------------------------

const azul = [0.2, 0.6, 0.9];

const preto = [0.0, 0.0, 0.0];


// --------------------------------------------------
// 11. ROBÔ
// --------------------------------------------------

// Cabeça
desenharRetangulo(
    -0.30,
    0.30,
    0.60,
    0.40,
    azul
);


// Corpo
desenharRetangulo(
    -0.45,
    -0.40,
    0.90,
    0.65,
    azul
);


// Braço esquerdo
desenharRetangulo(
    -0.65,
    -0.30,
    0.20,
    0.50,
    azul
);


// Braço direito
desenharRetangulo(
    0.45,
    -0.30,
    0.20,
    0.50,
    azul
);


// Perna esquerda
desenharRetangulo(
    -0.35,
    -0.85,
    0.30,
    0.45,
    azul
);


// Perna direita
desenharRetangulo(
    0.05,
    -0.85,
    0.30,
    0.45,
    azul
);


// --------------------------------------------------
// 12. OLHOS
// --------------------------------------------------

// Olho esquerdo
desenharRetangulo(
    -0.18,
    0.48,
    0.08,
    0.08,
    preto
);


// Olho direito
desenharRetangulo(
    0.10,
    0.48,
    0.08,
    0.08,
    preto
);


// --------------------------------------------------
// 13. BOCA
// --------------------------------------------------

desenharRetangulo(
    -0.15,
    0.36,
    0.30,
    0.05,
    preto
);
}
iniciarrobo();