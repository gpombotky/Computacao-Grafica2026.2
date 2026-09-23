// ==================================================
// CONTROLE DE TECLADO SEGURO
// ==================================================
if (typeof window.keys === "undefined") {
  window.keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };

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
// CLASS - SCENE
// ==================================================

class Scene {
  constructor(gl, program) {
    this.renderer = new Renderer(gl, program);

    // Componentes do helicóptero
    this.helicopterBody = new HelicopterBody();
    this.helicopterTopShaft = new HelicopterTopShaft();
    this.helicopterTail = new HelicopterTail();
    this.helicopterPropellers = new HelicopterPropellers();
    this.helicopterTailPropeller = new HelicopterTailPropeller();

    // Posição inicial no centro
    this.posX = 0.0;
    this.posY = 0.0;

    // >>> Altere de 0.02 para 0.01 (ou 0.008) para ficar na velocidade perfeita <<<
    this.speed = 0.01;

    // Escala base do helicóptero
    this.scale = 0.4;

    // Ângulos e velocidades de rotação das hélices
    this.topPropellerTheta = 0.0;
    this.tailPropellerTheta = 0.0;

    this.topSpeed = 0.3;
    this.tailSpeed = 0.5;
  }

  update() {
    // 1. Movimentação via setas do teclado
    let moveX = 0.0;
    let moveY = 0.0;
    let tilt = 0.0;

    if (typeof this.facingDirection === "undefined") {
      this.facingDirection = 1.0;
    }

    if (window.keys.ArrowUp) {
      moveY += this.speed;
      tilt = -0.3;
    }
    if (window.keys.ArrowDown) {
      moveY -= this.speed;
      tilt = 0.3;
    }
    if (window.keys.ArrowLeft) {
      moveX -= this.speed;
      this.facingDirection = 1.0;
      tilt = 0.3;
    }
    if (window.keys.ArrowRight) {
      moveX += this.speed;
      this.facingDirection = -1.0;
      tilt = 0.3;
    }

    // Acumula a posição
    this.posX += moveX;
    this.posY += moveY;

    // 2. Atualização contínua dos ângulos das hélices
    this.topPropellerTheta += this.topSpeed;
    this.tailPropellerTheta += this.tailSpeed;

    // 3. Calcula a proporção da tela (Aspect Ratio) para corrigir a distorção
    let aspect = canvas.width / canvas.height;

    // 4. Matriz base: Translação + Correção de Proporção + Espelhamento + Inclinação
    let baseMatrix = m4.translation(this.posX, this.posY, 0.0);

    // Compensa o formato retangular da tela no eixo X para o helicóptero não esticar
    let scaleX = (this.scale / aspect) * this.facingDirection;
    let scaleY = this.scale;

    baseMatrix = m4.multiply(baseMatrix, m4.scaling(scaleX, scaleY, 1.0));

    // Aplica a inclinação
    baseMatrix = m4.multiply(baseMatrix, m4.zRotation(tilt));

    // Atualiza o corpo e as partes fixas
    this.helicopterBody.update(baseMatrix);
    this.helicopterTopShaft.update(baseMatrix);
    this.helicopterTail.update(baseMatrix);

    // 5. Hélice Superior
    let topMatrix = m4.multiply(
      baseMatrix,
      m4.yRotation(this.topPropellerTheta),
    );
    this.helicopterPropellers.update(topMatrix);

    // 6. Hélice da Cauda
    let tailMatrix = m4.multiply(
      baseMatrix,
      m4.xRotation(this.tailPropellerTheta),
    );
    this.helicopterTailPropeller.update(tailMatrix);
  }

  draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    this.helicopterBody.draw(this.renderer);
    this.helicopterTopShaft.draw(this.renderer);
    this.helicopterTail.draw(this.renderer);
    this.helicopterPropellers.draw(this.renderer);
    this.helicopterTailPropeller.draw(this.renderer);
  }

  execute() {
    this.update();
    this.draw();

    requestAnimationFrame(() => this.execute());
  }

  init() {
    requestAnimationFrame(() => this.execute());
  }
}
