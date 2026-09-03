let canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

let mode = "r";      
let clickState = 0;  
let x0 = 0, y0 = 0;
let x1 = 0, y1 = 0;
let x2 = 0, y2 = 0;

let currentColor = [0.0, 0.0, 1.0];
let currentPoints = [];

let vertices = new Float32Array([]);
let colors = new Float32Array([]);
let pointSizes = new Float32Array([]);

let verticesBuffer = gl.createBuffer();
let colorsBuffer = gl.createBuffer();
let pointSizesBuffer = gl.createBuffer();

let vertexShaderSource = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
in float aPointSize;
out vec3 vColor;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}
`;

let fragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
    outColor = vec4(vColor, 1.0);
}
`;

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == false) {
    let error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(error);
  }
  return shader;
}

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

let program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (gl.getProgramParameter(program, gl.LINK_STATUS) == false) {
  throw new Error(gl.getProgramInfoLog(program));
}

let positionLocation = gl.getAttribLocation(program, "aPosition");
let colorLocation = gl.getAttribLocation(program, "aColor");
let pointSizeLocation = gl.getAttribLocation(program, "aPointSize");

function drawScene() {
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  if (vertices.length > 0) {
    gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
  }
}

function updateBuffersAndDraw() {
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(pointSizeLocation);
  gl.vertexAttribPointer(pointSizeLocation, 1, gl.FLOAT, false, 0, 0);

  drawScene();
}

function updateFigure(pointsArray) {
  if (pointsArray.length === 0) {
    vertices = new Float32Array([]);
    colors = new Float32Array([]);
    pointSizes = new Float32Array([]);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return;
  }

  let totalPoints = pointsArray.length / 2;
  vertices = new Float32Array(pointsArray.length);
  colors = new Float32Array(totalPoints * 3);
  pointSizes = new Float32Array(totalPoints);

  for (let i = 0; i < totalPoints; i = i + 1) {
    let px = pointsArray[i * 2];
    let py = pointsArray[i * 2 + 1];

    vertices[i * 2] = (px / canvas.width) * 2 - 1;
    vertices[i * 2 + 1] = -((py / canvas.height) * 2 - 1);

    colors[i * 3] = currentColor[0];
    colors[i * 3 + 1] = currentColor[1];
    colors[i * 3 + 2] = currentColor[2];

    pointSizes[i] = 2.0;
  }

  updateBuffersAndDraw();
}

function getBresenhamPoints(startX, startY, endX, endY) {
  let dx = Math.abs(endX - startX);
  let dy = Math.abs(endY - startY);
  let sx, sy, err, e2;
  let points = [];

  sx = (startX < endX) ? 1 : -1;
  sy = (startY < endY) ? 1 : -1;

  err = dx - dy;
  let currentX = startX;
  let currentY = startY;

  while (true) {
    points.push(currentX);
    points.push(currentY);

    if (currentX == endX && currentY == endY) {
      break;
    }

    e2 = 2 * err;

    if (e2 > -dy) {
      err = err - dy;
      currentX = currentX + sx;
    }

    if (e2 < dx) {
      err = err + dx;
      currentY = currentY + sy;
    }
  }

  return points;
}

function tracarReta(px0, py0, px1, py1) {
  currentPoints = getBresenhamPoints(px0, py0, px1, py1);
  updateFigure(currentPoints);
}

function mudarCor(novaCor) {
  currentColor = novaCor;
  if (currentPoints.length > 0) {
    updateFigure(currentPoints);
  }
}

function tracarTriangulo(px0, py0, px1, py1, px2, py2) {
  let p1 = getBresenhamPoints(px0, py0, px1, py1);
  let p2 = getBresenhamPoints(px1, py1, px2, py2);
  let p3 = getBresenhamPoints(px2, py2, px0, py0);

  currentPoints = [];
  for (let i = 0; i < p1.length; i = i + 1) currentPoints.push(p1[i]);
  for (let i = 0; i < p2.length; i = i + 1) currentPoints.push(p2[i]);
  for (let i = 0; i < p3.length; i = i + 1) currentPoints.push(p3[i]);

  updateFigure(currentPoints);
}

canvas.addEventListener("mousedown", function (event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  let x = Math.round(mouseX * (canvas.width / rect.width));
  let y = Math.round(mouseY * (canvas.height / rect.height));

  if (mode === "r") {
    if (clickState === 0) {
      x0 = x; y0 = y;
      clickState = 1;
      tracarReta(x0, y0, x0, y0);
    } else {
      x1 = x; y1 = y;
      clickState = 0;
      tracarReta(x0, y0, x1, y1);
    }
  } else if (mode === "t") {
    if (clickState === 0) {
      x0 = x; y0 = y;
      clickState = 1;
      tracarReta(x0, y0, x0, y0);
    } else if (clickState === 1) {
      x1 = x; y1 = y;
      clickState = 2;
      tracarReta(x0, y0, x1, y1);
    } else {
      x2 = x; y2 = y;
      clickState = 0;
      tracarTriangulo(x0, y0, x1, y1, x2, y2);
    }
  }
});

window.addEventListener("keydown", function (event) {
  let key = event.key.toLowerCase();

  if (key === "r") {
    mode = "r";
    clickState = 0;
    currentPoints = [];
    updateFigure(currentPoints);
  } else if (key === "t") {
    mode = "t";
    clickState = 0;
    currentPoints = [];
    updateFigure(currentPoints);
  } else {
    let cores = {
      "0": [0.0, 0.0, 1.0],
      "1": [1.0, 0.0, 0.0],
      "2": [0.0, 1.0, 0.0],
      "3": [1.0, 1.0, 0.0],
      "4": [1.0, 0.0, 1.0],
      "5": [0.0, 1.0, 1.0],
      "6": [0.5, 0.5, 0.5],
      "7": [0.5, 0.0, 0.0],
      "8": [0.0, 0.5, 0.0],
      "9": [0.0, 0.0, 0.0]
    };

    if (cores[key]) {
      mudarCor(cores[key]);
    }
  }
});

tracarReta(0, 0, 0, 0);