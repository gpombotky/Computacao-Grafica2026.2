function iniciarflor() {
  const canvas = document.getElementById("canvasflor");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
  }

  // --------------------------------------------------
  // 1. VERTEX SHADER
  // --------------------------------------------------

  const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

`;

  // --------------------------------------------------
  // 2. FRAGMENT SHADER
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
  // 3. COMPILAR SHADER
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

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  // --------------------------------------------------
  // 4. CRIAR PROGRAMA
  // --------------------------------------------------

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  // --------------------------------------------------
  // 5. LOCALIZAÇÕES
  // --------------------------------------------------

  const positionLocation = gl.getAttribLocation(program, "aPosition");

  const colorLocation = gl.getUniformLocation(program, "uColor");

  // --------------------------------------------------
  // 6. BUFFER
  // --------------------------------------------------

  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.enableVertexAttribArray(positionLocation);

  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // --------------------------------------------------
  // 7. FUNÇÃO PARA DESENHAR CÍRCULO
  // --------------------------------------------------

  function desenharCirculo(x, y, raio, cor) {
    const vertices = [];

    const quantidade = 40;

    for (let i = 0; i < quantidade; i++) {
      const angulo1 = (i / quantidade) * Math.PI * 2;

      const angulo2 = ((i + 1) / quantidade) * Math.PI * 2;

      // Centro
      vertices.push(x, y);

      // Primeiro ponto
      vertices.push(x + Math.cos(angulo1) * raio, y + Math.sin(angulo1) * raio);

      // Segundo ponto
      vertices.push(x + Math.cos(angulo2) * raio, y + Math.sin(angulo2) * raio);
    }

    const verticesArray = new Float32Array(vertices);

    gl.bufferData(gl.ARRAY_BUFFER, verticesArray, gl.STATIC_DRAW);

    gl.uniform4f(colorLocation, cor[0], cor[1], cor[2], 1.0);

    gl.drawArrays(gl.TRIANGLES, 0, verticesArray.length / 2);
  }

  // --------------------------------------------------
  // 8. FUNÇÃO PARA DESENHAR RETÂNGULO
  // --------------------------------------------------

  function desenharRetangulo(x, y, largura, altura, cor) {
    const vertices = new Float32Array([
      // Triângulo 1
      x,
      y,
      x + largura,
      y,
      x,
      y + altura,

      // Triângulo 2
      x + largura,
      y,
      x + largura,
      y + altura,
      x,
      y + altura,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.uniform4f(colorLocation, cor[0], cor[1], cor[2], 1.0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // --------------------------------------------------
  // 9. LIMPAR TELA
  // --------------------------------------------------

  gl.clearColor(0.05, 0.05, 0.05, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  // --------------------------------------------------
  // 10. CORES
  // --------------------------------------------------

  const rosa = [1.0, 0.2, 0.5];

  const amarelo = [1.0, 0.8, 0.0];

  const verde = [0.1, 0.7, 0.2];

  const marrom = [0.6, 0.3, 0.1];

  const azul = [0, 0, 0.7];

  const branco = [1, 1, 1];

  const vermelho = [1, 0 , 0]

  // --------------------------------------------------
  // CÉU
  // --------------------------------------------------

  desenharRetangulo(-1, -1, 2, 2, azul);

  // --------------------------------------------------
  // ESTRELAS
  // --------------------------------------------------

  var posy = 1;

  while (posy > -1) {
    var posx = -1;

    while (posx < 1) {
      desenharRetangulo(posx, posy, 0.01, 0.01, branco);
      posx += 0.05;
    }

    posy -= 0.05;
  }

  // --------------------------------------------------
  // 11. PÉTALAS
  // --------------------------------------------------

  desenharCirculo(0.0, 0.55, 0.25, vermelho);

  desenharCirculo(0.35, 0.35, 0.25, vermelho);

  desenharCirculo(0.35, 0.05, 0.25, vermelho);

  desenharCirculo(0.0, -0.1, 0.25, vermelho);

  desenharCirculo(-0.35, 0.05, 0.25, vermelho);

  desenharCirculo(-0.35, 0.35, 0.25, vermelho);

  // --------------------------------------------------
  // 12. CENTRO DA FLOR
  // --------------------------------------------------

  desenharCirculo(0.0, 0.25, 0.18, amarelo);

  // --------------------------------------------------
  // 13. CAULE
  // --------------------------------------------------

  desenharRetangulo(-0.04, -0.85, 0.08, 0.8, verde);

  // --------------------------------------------------
  // 14. FOLHAS
  // --------------------------------------------------

  desenharRetangulo(-0.3, -0.55, 0.25, 0.07, verde);

  desenharRetangulo(0.05, -0.4, 0.25, 0.07, verde);

  // --------------------------------------------------
  // 15. TERRA
  // --------------------------------------------------

  desenharRetangulo(-1, -1, 2, 0.15, marrom);
}
iniciarflor();
