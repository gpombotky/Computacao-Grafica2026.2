const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// CENTRALIZAR CANVAS E PLACAR
// --------------------------------------------------
// Garantimos que o canvas fique no centro da tela
canvas.style.display = "block";
canvas.style.margin = "0 auto";

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();
let corBarraDireita = new Float32Array([0.0, 0.0, 1.0]);

let verticesBarraEsquerda = verticesBarra();
let corBarraEsquerda = new Float32Array([0.0, 1.0, 0.0]);

let verticesBolaCentro = verticesBola();
let corBolaCentro = new Float32Array([1.0, 0.0, 0.0]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------
let MbarraEsquerda = m3.translation(-0.9, 0.0);
let MbarraDireita = m3.translation(0.9, 0.0);
let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------
const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
uniform mat3 u_transform;
out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------
const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}
`;

// --------------------------------------------------
// COMPILAR SHADERS E CRIAR PROGRAMA
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------
const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
const transformLocation = gl.getUniformLocation(program, "u_transform");

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------
let tyBE = 0.0; 
let tyBD = 0.0; 

let txBola = 0.0;
let tyBola = 0.0;

// Constantes para a velocidade da bola
const VELOCIDADE_BOLA_X_PADRAO = 0.01;
const VELOCIDADE_BOLA_Y_PADRAO = 0.008;
const MULTIPLICADOR_VELOCIDADE = 1.05; // Aumenta 5% a cada batida

let txBola_offset = VELOCIDADE_BOLA_X_PADRAO;
let tyBola_offset = VELOCIDADE_BOLA_Y_PADRAO;

const RAIO_BOLA = 0.05;
const META_LARGURA_BARRA = 0.05;
const META_ALTURA_BARRA = 0.2;
const VELOCIDADE_BARRA = 0.025;
const LIMITE_VERTICAL_BARRA = 1.0 - META_ALTURA_BARRA;

// --------------------------------------------------
// PLACAR CENTRALIZADO
// --------------------------------------------------
let placarEsquerda = 0;
let placarDireita = 0;

const placarDiv = document.createElement("div");
placarDiv.style.fontFamily = "sans-serif";
placarDiv.style.fontSize = "24px";
placarDiv.style.textAlign = "center";
placarDiv.style.color = "#fff";
placarDiv.style.background = "#111";
placarDiv.style.padding = "8px";
placarDiv.style.boxSizing = "border-box";
// Força o placar a ter a mesma largura que o canvas e a ficar centralizado
placarDiv.style.width = (canvas.clientWidth || 800) + "px"; 
placarDiv.style.margin = "0 auto"; 

canvas.parentNode.insertBefore(placarDiv, canvas);

function atualizaPlacar(){
    placarDiv.textContent = `${placarEsquerda}  x  ${placarDireita}`;
}
atualizaPlacar();

// --------------------------------------------------
// CONTROLE DO TECLADO
// --------------------------------------------------
const teclasPressionadas = {};

window.addEventListener("keydown", (event) => {
    teclasPressionadas[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    teclasPressionadas[event.key.toLowerCase()] = false;
});

function moveBarras(){
    if (teclasPressionadas["w"]) tyBE += VELOCIDADE_BARRA;
    if (teclasPressionadas["s"]) tyBE -= VELOCIDADE_BARRA;
    
    if (teclasPressionadas["arrowup"]) tyBD += VELOCIDADE_BARRA;
    if (teclasPressionadas["arrowdown"]) tyBD -= VELOCIDADE_BARRA;

    tyBE = Math.min(LIMITE_VERTICAL_BARRA, Math.max(-LIMITE_VERTICAL_BARRA, tyBE));
    tyBD = Math.min(LIMITE_VERTICAL_BARRA, Math.max(-LIMITE_VERTICAL_BARRA, tyBD));

    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);
}

// --------------------------------------------------
// COLISÃO DA BOLA (AUMENTO DE VELOCIDADE AQUI)
// --------------------------------------------------

function resetBola(direcao){
    txBola = 0.0;
    tyBola = 0.0;
    // Reseta a velocidade para o padrão
    txBola_offset = VELOCIDADE_BOLA_X_PADRAO * direcao;
    tyBola_offset = (Math.random() < 0.5 ? -1 : 1) * VELOCIDADE_BOLA_Y_PADRAO;
}

function verificaColisaoBola(){
    // Quique no topo/base da tela
    if (tyBola + RAIO_BOLA > 1.0 || tyBola - RAIO_BOLA < -1.0) {
        tyBola_offset = -tyBola_offset;
    }

    // Colisão com a barra esquerda
    const bordaDireitaBarraEsq = -0.9 + META_LARGURA_BARRA;
    if (
        txBola_offset < 0 &&
        txBola - RAIO_BOLA <= bordaDireitaBarraEsq &&
        txBola - RAIO_BOLA >= -0.9 &&
        tyBola + RAIO_BOLA >= tyBE - META_ALTURA_BARRA &&
        tyBola - RAIO_BOLA <= tyBE + META_ALTURA_BARRA
    ) {
        // Inverte a direção e AUMENTA a velocidade
        txBola_offset = Math.abs(txBola_offset) * MULTIPLICADOR_VELOCIDADE;
        tyBola_offset = tyBola_offset * MULTIPLICADOR_VELOCIDADE;
    }

    // Colisão com a barra direita
    const bordaEsquerdaBarraDir = 0.9 - META_LARGURA_BARRA;
    if (
        txBola_offset > 0 &&
        txBola + RAIO_BOLA >= bordaEsquerdaBarraDir &&
        txBola + RAIO_BOLA <= 0.9 &&
        tyBola + RAIO_BOLA >= tyBD - META_ALTURA_BARRA &&
        tyBola - RAIO_BOLA <= tyBD + META_ALTURA_BARRA
    ) {
        // Inverte a direção e AUMENTA a velocidade
        txBola_offset = -Math.abs(txBola_offset) * MULTIPLICADOR_VELOCIDADE;
        tyBola_offset = tyBola_offset * MULTIPLICADOR_VELOCIDADE;
    }

    // Bola passou da barra esquerda -> ponto pra direita
    if (txBola < -1.0) {
        placarDireita++;
        atualizaPlacar();
        resetBola(1);
    }

    // Bola passou da barra direita -> ponto pra esquerda
    if (txBola > 1.0) {
        placarEsquerda++;
        atualizaPlacar();
        resetBola(-1);
    }
}

function atualizaAnimacao(){
    moveBarras();
    txBola += txBola_offset;
    tyBola += tyBola_offset;
    verificaColisaoBola();
    MbolaCentro = m3.translation(txBola, tyBola);
}

// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);
const numComponents = 2;

function drawScene(){
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();

    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraEsquerda, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraEsquerda);
    gl.uniformMatrix3fv(transformLocation, false, MbarraEsquerda);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraEsquerda.length / numComponents);
}

function drawBarraDireita(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraDireita, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraDireita);
    gl.uniformMatrix3fv(transformLocation, false, MbarraDireita);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraDireita.length / numComponents);
}

function drawBolaCentro(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBolaCentro, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBolaCentro);
    gl.uniformMatrix3fv(transformLocation, false, MbolaCentro);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBolaCentro.length / numComponents);
}

drawScene();