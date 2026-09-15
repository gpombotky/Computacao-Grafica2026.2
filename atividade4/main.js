const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
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
// CLASSE RENDERER
// ==================================================

class Renderer {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.positionLocation = gl.getAttribLocation(program, "aPosition");

    this.colorLocation = gl.getUniformLocation(program, "uColor");

    this.viewTransformLocation = gl.getUniformLocation(
      program,
      "u_viewTransform",
    );

    this.modelTransformLocation = gl.getUniformLocation(
      program,
      "u_modelTransform",
    );

    this.viewTransform = m3.identity();

    this.verticesBuffer = gl.createBuffer();
  }

  defineViewTransform(viewTransform) {
    this.viewTransform = viewTransform;
  }

  draw(object) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, object.vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.positionLocation);

    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3fv(this.colorLocation, object.color);

    gl.uniformMatrix3fv(
      this.modelTransformLocation,
      false,
      object.modelTransform,
    );

    gl.uniformMatrix3fv(this.viewTransformLocation, false, this.viewTransform);

    gl.drawArrays(gl.TRIANGLES, 0, object.vertices.length / 2);
  }
}

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function rectangleVertices(x, y, width, height) {
  return [
    x,
    y,

    x + width,
    y + height,

    x,
    y + height,

    x,
    y,

    x + width,
    y,

    x + width,
    y + height,
  ];
}

// ==================================================
// VÉRTICES DO ROBÔ
// ==================================================

function headVertices() {
  return new Float32Array(rectangleVertices(-0.1, 0.0, 0.2, 0.18));
}

function bodyVertices() {
  return new Float32Array(rectangleVertices(-0.14, 0.0, 0.28, 0.3));
}

function armVertices() {
  return new Float32Array(rectangleVertices(-0.04, -0.22, 0.08, 0.22));
}

function legVertices() {
  return new Float32Array(rectangleVertices(-0.05, -0.28, 0.1, 0.28));
}

// ==================================================
// OLHOS
// ==================================================

function eyeVertices() {
  return new Float32Array(rectangleVertices(-0.025, -0.025, 0.05, 0.05));
}

// ==================================================
// ANTENA
// ==================================================

function antennaVertices() {
  return new Float32Array(rectangleVertices(-0.01, 0.0, 0.02, 0.1));
}

function antennaTipVertices() {
  return new Float32Array(rectangleVertices(-0.025, 0.1, 0.05, 0.05));
}

// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {
  constructor(vertices, color) {
    this.vertices = vertices;

    this.color = color;

    this.modelTransform = m3.identity();
  }

  updateModelTransform(modelTransform) {
    this.modelTransform = modelTransform;
  }
}

// ==================================================
// CLASSE ROBOT PART
// ==================================================

class RobotPart extends SceneObject {
  constructor(vertices, color, x, y) {
    super(vertices, color);

    this.x = x;

    this.y = y;

    this.angle = 0;
  }

  updateModelTransform(robotTransform) {
    const localTransform = m3.multiply(
      m3.translation(this.x, this.y),

      m3.rotation(this.angle),
    );

    this.modelTransform = m3.multiply(robotTransform, localTransform);
  }
}

// ==================================================
// CABEÇA
// ==================================================

class Head extends RobotPart {
  constructor(color) {
    super(headVertices(), color, 0, 0.3);
  }

  update(robotTransform) {
    this.angle = 0;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// CORPO
// ==================================================

class Body extends RobotPart {
  constructor(color) {
    super(bodyVertices(), color, 0, 0);
  }

  update(robotTransform) {
    this.angle = 0;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// OLHO
// ==================================================

class Eye extends RobotPart {
  constructor(x, y) {
    super(
      eyeVertices(),

      new Float32Array([0.0, 0.0, 0.0]),

      x,
      y,
    );
  }

  update(robotTransform) {
    this.angle = 0;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// ANTENA
// ==================================================

class Antenna extends RobotPart {
  constructor(color) {
    super(antennaVertices(), color, 0, 0.48);
  }

  update(robotTransform) {
    this.angle = 0;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// PONTA DA ANTENA
// ==================================================

class AntennaTip extends RobotPart {
  constructor(color) {
    super(antennaTipVertices(), color, 0, 0.48);
  }

  update(robotTransform) {
    this.angle = 0;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// BRAÇO
// ==================================================

class Arm extends RobotPart {
  constructor(color, x, y, side) {
    super(armVertices(), color, x, y);

    this.side = side;
  }

  update(robotTransform, time) {
    this.angle = Math.sin(time) * 0.5 * this.side;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// PERNA
// ==================================================

class Leg extends RobotPart {
  constructor(color, x, y, side) {
    super(legVertices(), color, x, y);

    this.side = side;
  }

  update(robotTransform, time) {
    this.angle = Math.sin(time) * 0.3 * this.side;

    this.updateModelTransform(robotTransform);
  }
}

// ==================================================
// CLASSE ROBOT
// ==================================================

class Robot {
  constructor(x, y, color, speed) {
    this.tx = x;

    this.ty = y;

    this.speed = speed;

    this.time = 0;

    this.body = new Body(color);

    this.head = new Head(color);

    this.leftArm = new Arm(color, -0.18, 0.28, 1);

    this.rightArm = new Arm(color, 0.18, 0.28, -1);

    this.leftLeg = new Leg(color, -0.08, 0, -1);

    this.rightLeg = new Leg(color, 0.08, 0, 1);

    // Olho esquerdo
    this.leftEye = new Eye(-0.05, 0.4);

    // Olho direito
    this.rightEye = new Eye(0.05, 0.4);

    // Antena
    this.antenna = new Antenna(color);

    // Quadrado na ponta da antena
    this.antennaTip = new AntennaTip(color);
  }

  move() {
    this.tx += this.speed;

    this.time += 0.05;

    if (this.tx > 1.7 || this.tx < -1.7) {
      this.speed = -this.speed;
    }

    const robotTransform = m3.translation(this.tx, this.ty);

    this.body.update(robotTransform);

    this.head.update(robotTransform);

    this.leftArm.update(robotTransform, this.time);

    this.rightArm.update(robotTransform, this.time);

    this.leftLeg.update(robotTransform, this.time);

    this.rightLeg.update(robotTransform, this.time);

    this.leftEye.update(robotTransform);

    this.rightEye.update(robotTransform);

    this.antenna.update(robotTransform);

    this.antennaTip.update(robotTransform);
  }

  draw(renderer) {
    renderer.draw(this.leftLeg);

    renderer.draw(this.rightLeg);

    renderer.draw(this.body);

    renderer.draw(this.leftArm);

    renderer.draw(this.rightArm);

    renderer.draw(this.head);

    renderer.draw(this.leftEye);

    renderer.draw(this.rightEye);

    renderer.draw(this.antenna);

    renderer.draw(this.antennaTip);
  }
}

// ==================================================
// CLASSE CHÃO
// ==================================================

class Floor extends SceneObject {
  constructor() {
    super(
      new Float32Array(rectangleVertices(-2.0, -0.95, 4.0, 0.05)),

      new Float32Array([0.2, 0.2, 0.2]),
    );
  }

  draw(renderer) {
    renderer.draw(this);
  }
}

// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {
  constructor(gl, program) {
    this.renderer = new Renderer(gl, program);

    this.viewTransform = m3.setClippingWindow(-2.0, -1.0, 2.0, 1.0);

    this.renderer.defineViewTransform(this.viewTransform);

    this.floor = new Floor();

    this.robots = [
      // Robô prateado
      new Robot(
        -0.8,
        -0.65,

        new Float32Array([0.75, 0.75, 0.78]),

        0.004,
      ),

      // Robô dourado
      new Robot(
        0.8,
        -0.65,

        new Float32Array([0.95, 0.75, 0.15]),

        -0.003,
      ),
    ];
  }

  update() {
    for (const robot of this.robots) {
      robot.move();
    }
  }

  draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    this.floor.draw(this.renderer);

    for (const robot of this.robots) {
      robot.draw(this.renderer);
    }
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

// ==================================================
// CONFIGURAÇÃO INICIAL
// ==================================================

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);

// ==================================================
// INICIAR
// ==================================================

const scene = new Scene(gl, program);

scene.init();
