const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

// Configura o viewport com o tamanho real
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.enable(gl.DEPTH_TEST);

const vertexShaderSource = `#version 300 es

in vec3 aPosition;
in vec3 aColor;

out vec3 vColor;

uniform mat4 u_modelTransform;

void main() {

    vColor = aColor;
    gl_Position =
        u_modelTransform * vec4(aPosition, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(vColor, 1.0);
}
`;

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

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);

  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);

gl.enable(gl.DEPTH_TEST);

// ==================================================
// CONTROLE DE TECLADO SEGURO
// ==================================================
window.keys = window.keys || {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

if (!window._keysEventListenerAdded) {
  window._keysEventListenerAdded = true;

  window.addEventListener("keydown", (e) => {
    if (window.keys.hasOwnProperty(e.code)) {
      window.keys[e.code] = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (window.keys.hasOwnProperty(e.code)) {
      window.keys[e.code] = false;
    }
  });
}

// ==================================================
// CRIAR CENA E INICIAR ANIMAÇÃO
// ==================================================

const scene = new Scene(gl, program);

scene.init();
