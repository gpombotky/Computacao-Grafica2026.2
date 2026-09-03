function iniciarCarro() {

    const canvas = document.getElementById("canvascarro");
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
    // 3. COMPILAR SHADERS
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
    // 6. BUFFER
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
    // 7. FUNÇÃO PARA DESENHAR RETÂNGULO
    // --------------------------------------------------

    function desenharRetangulo(
        x,
        y,
        largura,
        altura,
        cor
    ) {

        const vertices = new Float32Array([

            // Triângulo 1
            x, y,
            x + largura, y,
            x, y + altura,

            // Triângulo 2
            x + largura, y,
            x + largura, y + altura,
            x, y + altura
        ]);


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
    // 8. FUNÇÃO PARA DESENHAR CÍRCULO
    // --------------------------------------------------

    function desenharCirculo(
        x,
        y,
        raio,
        cor
    ) {

        const vertices = [];

        const quantidade = 40;


        for (let i = 0; i < quantidade; i++) {

            const angulo1 =
                (i / quantidade) * Math.PI * 2;

            const angulo2 =
                ((i + 1) / quantidade) * Math.PI * 2;


            // Centro
            vertices.push(x, y);


            // Ponto 1
            vertices.push(
                x + Math.cos(angulo1) * raio,
                y + Math.sin(angulo1) * raio
            );


            // Ponto 2
            vertices.push(
                x + Math.cos(angulo2) * raio,
                y + Math.sin(angulo2) * raio
            );
        }


        const verticesArray =
            new Float32Array(vertices);


        gl.bufferData(
            gl.ARRAY_BUFFER,
            verticesArray,
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
            verticesArray.length / 2
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

    const vermelho = [0.9, 0.1, 0.1];

    const azul = [0.1, 0.4, 0.9];

    const preto = [0.0, 0.0, 0.0];

    const cinza = [0.5, 0.5, 0.5];

    const amarelo = [1.0, 0.8, 0.0];


    // --------------------------------------------------
    // 11. CÉU
    // --------------------------------------------------

    desenharRetangulo(-1,-0.48,2,1.48,azul);

    // --------------------------------------------------
    // 11. CARROCERIA
    // --------------------------------------------------

    desenharRetangulo(
        -0.75,
        -0.25,
        1.50,
        0.45,
        vermelho
    );


    // --------------------------------------------------
    // 12. PARTE DE CIMA DO CARRO
    // --------------------------------------------------

    desenharRetangulo(
        -0.45,
        0.20,
        0.90,
        0.35,
        vermelho
    );


    // --------------------------------------------------
    // 13. JANELA ESQUERDA
    // --------------------------------------------------

    desenharRetangulo(
        -0.38,
        0.25,
        0.35,
        0.20,
        azul
    );


    // --------------------------------------------------
    // 14. JANELA DIREITA
    // --------------------------------------------------

    desenharRetangulo(
        0.03,
        0.25,
        0.35,
        0.20,
        azul
    );


    // --------------------------------------------------
    // 15. RODA ESQUERDA
    // --------------------------------------------------

    desenharCirculo(
        -0.45,
        -0.30,
        0.18,
        preto
    );


    // --------------------------------------------------
    // 16. RODA DIREITA
    // --------------------------------------------------

    desenharCirculo(
        0.45,
        -0.30,
        0.18,
        preto
    );


    // --------------------------------------------------
    // 17. CENTRO DAS RODAS
    // --------------------------------------------------

    desenharCirculo(
        -0.45,
        -0.30,
        0.08,
        cinza
    );

    desenharCirculo(
        0.45,
        -0.30,
        0.08,
        cinza
    );


    // --------------------------------------------------
    // 18. FARÓIS
    // --------------------------------------------------

    desenharRetangulo(
        -0.75,
        -0.05,
        0.12,
        0.12,
        amarelo
    );

    desenharRetangulo(
        0.63,
        -0.05,
        0.12,
        0.12,
        amarelo
    );

}


// --------------------------------------------------
// INICIAR
// --------------------------------------------------

iniciarCarro();