const canvas = document.getElementById("canvas");
// Initialize the GL context
const gl = canvas.getContext("webgl2");

// Add mouse move event handlers to the canvas to update the cursor[] array.
const cursor = [0, 0]
canvas.addEventListener('mousemove', (event) =>
{
    cursor[0] = (event.offsetX / canvas.width) * 2 - 1
    cursor[1] = (event.offsetY / canvas.height) * -2 + 1
})
// Shader //////////////////////////////////////////////////////////////////////

const vertexShaderSource = `#version 300 es
    precision highp float; // Calculate the varying outputs with high precision
  
    uniform float u_time;
    uniform vec2 u_cursor;

    in vec2 a_pos;
    in vec3 a_color;  

    out vec3 f_color;
    out float xPos;
    out float yPos;

    float speedfactor = 2.0;
	void main() {
 		gl_Position = vec4(a_pos[0] + sin(u_time * speedfactor) * 0.4,
                           a_pos[1] + cos(u_time * speedfactor * 2.0) * 0.2,
                           0.0,
                           1.0);
        xPos = gl_Position[0];
        yPos = gl_Position[1];
        f_color = a_color;
	}
`

const fragmentShaderSource = `#version 300 es
    precision mediump float; // Fragment shader calculations require less precision.

    uniform float u_time;
    uniform vec2 u_cursor;

    in vec3 f_color;
    in vec2 a_pos;
    in float xPos;
    in float yPos;
    out vec4 FragColor;
  
	void main() {
        
		FragColor = vec4(mod(xPos + f_color[0] * u_cursor[0] * 5.0, 1.0),
                         mod(yPos + f_color[1] * u_cursor[1] * 5.0, 1.0),
                         0,
                         1.0);

	}
`
// FragColor = vec4(mod(vec3(u_time + u_cursor[0] + u_cursor[1]) + f_color, 1.0), 1.0);

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

// Data ////////////////////////////////////////////////////////////////////////

const vertexPositions = new Float32Array([
    +0, +0, 1, 0, 0,
    -0.6, -0.6, 0, 1, 1,
    +0.6, -0.6, 0, 1, 1,
    +0.6, +0.6, 0, 1, 1,
    -0.6, +0.6, 0, 1, 1,
])

// Create the position buffer
const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW)

const faceIndices = new Uint16Array([
    0, 1, 2, // first triangle
    0, 2, 3, // second triangle
    0, 3, 4,
    0, 4, 1
])

// Create the index buffer
const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceIndices, gl.STATIC_DRAW)

// Attribute Mapping ///////////////////////////////////////////////////////////

// Map the contents of the buffer to the vertex shader
const vertexAttribute = gl.getAttribLocation(shaderProgram, 'a_pos')
gl.enableVertexAttribArray(vertexAttribute)
gl.vertexAttribPointer(
    vertexAttribute,
    2,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    20,       // stride
    0         // offset
)

const colorAttribute = gl.getAttribLocation(shaderProgram, 'a_color')
gl.enableVertexAttribArray(colorAttribute)
gl.vertexAttribPointer(
    colorAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    20,       // stride
    8         // offset
)

// Uniform /////////////////////////////////////////////////////////////////////

const timeUniform = gl.getUniformLocation(shaderProgram, "u_time")
const cursorUniform = gl.getUniformLocation(shaderProgram, "u_cursor")

// Rendering ///////////////////////////////////////////////////////////////////


requestAnimationFrame(renderLoop)
function renderLoop(time) {
    gl.uniform1f(timeUniform, time / 1000)
    gl.uniform2f(cursorUniform, cursor[0], cursor[1])
    // Draw the scene.
    gl.drawElements(
        gl.TRIANGLES,       // primitive type
        faceIndices.length, // vertex count
        gl.UNSIGNED_SHORT,  // type of indices
        0                   // offset
    )
}


function setRenderLoop(callback) {
    function renderLoop(time) {
        if (setRenderLoop._callback !== null) {
            setRenderLoop._callback(time)
            requestAnimationFrame(renderLoop)
        }
    }
    setRenderLoop._callback = callback
    requestAnimationFrame(renderLoop)
}

setRenderLoop(renderLoop)