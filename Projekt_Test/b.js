const canvas = document.getElementById("canvas");
// Initialize the GL context
const gl = canvas.getContext("webgl2");

const vertexShaderSource = `
	attribute vec4 vertexPos;
    attribute vec3 vertexColor; // Added color attribute
    varying vec4 v_color;
	void main() {
	    gl_Position = vertexPos;
        v_color = vec4(vertexColor, 1.0);
	}
`

const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
		gl_FragColor = v_color;
	}
`

// Create the Vertex Shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vertexShaderSource)
gl.compileShader(vertexShader)

// Create the Fragment Shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, fragmentShaderSource)
gl.compileShader(fragmentShader)

// Link the two into a single Shader Program
const shaderProgram = gl.createProgram()
gl.attachShader(shaderProgram, vertexShader)
gl.attachShader(shaderProgram, fragmentShader)
gl.linkProgram(shaderProgram)
gl.useProgram(shaderProgram)

//////////////////////// Daten

const vertices = new Float32Array([
    -0.5, 0.0, 0.0, 1., 1., 0., // 0
    -0.5, 0.5, 0.0, 1., 0., 0.,  // 1
    -0.5, 0.0, 0.5, 1., 0., 0.,  // 2
    -0.5, 0.5, -0.5, 1., 0., 0.,  // 3

    0, 0.0, 0.0, 0., 0, 1.,  // 4
    0, 0.5, 0.0, 0., 1., 1.,  // 5
    0, 0.0, -0.5, 0., 1., 1.,  // 6
    0, 0.5, -0.5, 0., 1., 1.,  // 7
]);

const vertexPositions = new Float32Array([
	.5, 0.0, 0.0, 1., 0., 0.,  // 0
	.5, .5, 0.0, 1., 0., 0.,  // 1
	.5, .5, 0.5, 1., 0., 0.,  // 2
    1., 1., +.5, 0., 1., 1.,  // 3
    1., 1., +.5, 0., 1., 1.,  // 4
    0., 1., +.5, 0., 1., 1.,  // 5
])

// Create the position buffer
const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)


const faceIndices = new Uint16Array([
    0, 1, 2


])

// Create the index buffer
const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceIndices, gl.STATIC_DRAW)


// Map the contents of the buffer to the vertex shader
const vertexAttribute = gl.getAttribLocation(shaderProgram, 'vertexPos')
gl.enableVertexAttribArray(vertexAttribute)
gl.vertexAttribPointer(
	vertexAttribute,
	3,        // numComponents
	gl.FLOAT, // type
	false,    // normalize
	6 * Float32Array.BYTES_PER_ELEMENT,        // stride
	0         // offset
)

const colorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
gl.enableVertexAttribArray(colorAttribute);
gl.vertexAttribPointer(
    colorAttribute,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT);

    gl.disable(gl.CULL_FACE);

/// Draw the scene.
gl.drawElements(
    gl.TRIANGLES,       // primitive type
    faceIndices.length,                  // vertex count
    gl.UNSIGNED_SHORT,  // type of indices
    0                   // offset
)
