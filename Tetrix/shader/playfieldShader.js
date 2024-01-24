const { attributes: playfieldAttr, indices: playfieldIdx } = await glance.loadObj("./obj/playfieldobj.obj")

const playfieldVertexShaderSource = `#version 300 es
precision highp float;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;

in vec3 a_pos;
in vec3 a_normal;

in vec2 a_texCoord;

out vec3 f_worldPos;
out vec3 f_normal;
out vec2 f_texCoord;

void main() {
    f_worldPos = vec3(u_modelMatrix * vec4(a_pos, 1));
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(f_worldPos, 1.0);
    f_normal = u_normalMatrix * a_normal;
    f_texCoord = a_texCoord;
}
`

const playfieldFragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 FragColor;

void main() {

    FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`
// Create the Vertex Shader
const playfieldVertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(playfieldVertexShader, playfieldVertexShaderSource)
gl.compileShader(playfieldVertexShader)

// Create the Fragment Shader
const playfieldFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(playfieldFragmentShader, playfieldFragmentShaderSource)
gl.compileShader(playfieldFragmentShader)

// Link the two into a single Shader Program
const playfieldShaderProgram = gl.createProgram()
gl.attachShader(playfieldShaderProgram, playfieldVertexShader)
gl.attachShader(playfieldShaderProgram, playfieldFragmentShader)
gl.linkProgram(playfieldShaderProgram)

// Data ////////////////////////////////////////////////////////////////////////

gl.useProgram(playfieldShaderProgram);
const playfieldVao = gl.createVertexArray();
gl.bindVertexArray(playfieldVao);


const playfieldPositions = new Float32Array(playfieldAttr);

const playfieldPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, playfieldPositionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, playfieldPositions, gl.STATIC_DRAW)

console.log(playfieldPositions)

// Create the index buffer
const playfieldFaceIndices = new Uint16Array(playfieldIdx);

const playfieldIndices = new Uint16Array(playfieldIdx);

const playfieldIndexBuffer = gl.createBuffer()

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playfieldIndexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, playfieldIndices, gl.STATIC_DRAW)

const playfieldVertexAttribute = gl.getAttribLocation(playfieldShaderProgram, 'a_pos')
gl.enableVertexAttribArray(playfieldVertexAttribute)
gl.vertexAttribPointer(
    playfieldVertexAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    0         // offset
)

const playfieldNormalAttribute = gl.getAttribLocation(playfieldShaderProgram, 'a_normal')
gl.enableVertexAttribArray(playfieldNormalAttribute)
gl.vertexAttribPointer(
    playfieldNormalAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    20        // offset
)

const playfieldTexCoordAttribute = gl.getAttribLocation(playfieldShaderProgram, 'a_texCoord')
gl.enableVertexAttribArray(playfieldTexCoordAttribute)
gl.vertexAttribPointer(
    playfieldTexCoordAttribute,
    2,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    12        // offset
)

gl.bindVertexArray(null)
gl.bindBuffer(gl.ARRAY_BUFFER, null)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

