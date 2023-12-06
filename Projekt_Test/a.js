////////////////////////////////////////////////////////////////////////////////
// START OF BOILERPLATE CODE ///////////////////////////////////////////////////

// Get the WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

// Add mouse move event handlers to the canvas to update the cursor[] array.
const cursor = [0, 0];
canvas.addEventListener('mousemove', (event) => {
    cursor[0] = (event.offsetX / canvas.width) * 2 - 1;
    cursor[1] = (event.offsetY / canvas.height) * -2 + 1;
});

function onMouseDrag(callback) {
    canvas.addEventListener('pointerdown', () => {
        const stopDrag = () => {
            canvas.removeEventListener("pointermove", callback);
            canvas.removeEventListener("pointerup", stopDrag);
            canvas.removeEventListener("pointerleave", stopDrag);
        };

        canvas.addEventListener('pointermove', callback);
        canvas.addEventListener("pointerup", stopDrag, { once: true });
        canvas.addEventListener("pointerleave", stopDrag, { once: true });
    });
}

function onMouseWheel(callback) {
    canvas.addEventListener('wheel', callback);
}

function onKeyDown(callback) {
    canvas.addEventListener('keydown', callback);
}

function onKeyUp(callback) {
    canvas.addEventListener('keyup', callback);
}

// Basic render loop manager.
function setRenderLoop(callback) {
    function renderLoop(time) {
        if (setRenderLoop._callback !== null) {
            setRenderLoop._callback(time);
            requestAnimationFrame(renderLoop);
        }
    }
    setRenderLoop._callback = callback;
    requestAnimationFrame(renderLoop);
}
setRenderLoop._callback = null;

import glance from './js/glance.js';

// BOILERPLATE END
////////////////////////////////////////////////////////////////////////////////

const {
    vec3,
    mat3,
    mat4,
} = glance;

// Math ------------------------------------------------------------------------

// Block builder ///////////////////////////////////////////////////////////////

function createTetrisBlock(shape) {
    let attributes = []
    let indices = []
    let counter = 0;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            let x = -0.5 + (0.25 * col);
            let y = 0.25 - (0.25 * row);
            if (shape[row][col] == 1) {

                // Cube corners / vertices
                const vertices = [
                    // Left Face
                    x, y - 0.25, 0.0, -1, 0, 0, 1, 1,  // 0
                    x, y, 0.0, -1, 0, 0, 1, 0,
                    x, y - 0.25, -0.25, -1, 0, 0, 0, 1,
                    x, y, -0.25, -1, 0, 0, 0, 0,

                    // Front Face
                    x, y - 0.25, 0.0, 0, 0, 1, 0, 1,  // 4
                    x + 0.25, y - 0.25, 0.0, 0, 0, 1, 1, 1,
                    x, y, 0.0, 0, 0, 1, 0, 0,
                    x + 0.25, y, 0.0, 0, 0, 1, 1, 0,

                    // Right Face
                    x + 0.25, y - 0.25, 0.0, 1, 0, 0, 1, 1,  // 8
                    x + 0.25, y - 0.25, -0.25, 1, 0, 0, 0, 1,
                    x + 0.25, y, 0.0, 1, 0, 0, 1, 0,
                    x + 0.25, y, -0.25, 1, 0, 0, 0, 0,

                    // Back Face
                    x, y - 0.25, -0.25, 0, 0, -1, 0, 0,  // 12
                    x + 0.25, y - 0.25, -0.25, 0, 0, -1, 0, 1,
                    x, y, -0.25, 0, 0, -1, 1, 0,
                    x + 0.25, y, -0.25, 0, 0, -1, 1, 1,

                    // Top Face
                    x, y, 0.0, 0, 1, 0, 0, 1,  // 16
                    x, y, -0.25, 0, 1, 0, 0, 0,
                    x + 0.25, y, 0.0, 0, 1, 0, 1, 1,
                    x + 0.25, y, -0.25, 0, 1, 0, 1, 0,

                    // Bottom Face
                    x, y - 0.25, 0.0, 0, -1, 0, 0, 0,  // 20
                    x, y - 0.25, -0.25, 0, -1, 0, 0, 1,
                    x + 0.25, y - 0.25, 0.0, 0, -1, 0, 1, 0,
                    x + 0.25, y - 0.25, -0.25, 0, -1, 0, 1, 1,
                ];

                vertices.forEach((value) => attributes.push(value));

                let refidx = counter * 24;
                counter += 1;

                // Indices for the cube
                // Left face
                indices.push(refidx + 0, refidx + 1, refidx + 2);
                indices.push(refidx + 1, refidx + 3, refidx + 2);

                // Front face
                indices.push(refidx + 4, refidx + 5, refidx + 6);
                indices.push(refidx + 5, refidx + 7, refidx + 6);

                // Right face
                indices.push(refidx + 8, refidx + 9, refidx + 10);
                indices.push(refidx + 9, refidx + 11, refidx + 10);

                // Back face
                indices.push(refidx + 14, refidx + 13, refidx + 12);
                indices.push(refidx + 14, refidx + 15, refidx + 13);

                // Top face
                indices.push(refidx + 18, refidx + 17, refidx + 16);
                indices.push(refidx + 18, refidx + 19, refidx + 17);

                // Bottom face
                indices.push(refidx + 20, refidx + 21, refidx + 22);
                indices.push(refidx + 21, refidx + 23, refidx + 22);


            }
        }
    }
    return [attributes, indices];
}

function createUnitBoxAttributes() {
    return [
        -1, -1, -1, // 0
        +1, -1, -1, // 1
        +1, +1, -1, // 2
        -1, +1, -1, // 3
        -1, -1, +1, // 4
        +1, -1, +1, // 5
        +1, +1, +1, // 6
        -1, +1, +1, // 7
    ]
}

function createUnitBoxIndices() {
    return [
        4, 5, 6, 4, 6, 7, // front
        1, 0, 3, 1, 3, 2, // back
        7, 6, 2, 7, 2, 3, // top
        0, 1, 5, 0, 5, 4, // bottom
        5, 1, 2, 5, 2, 6, // right
        0, 4, 7, 0, 7, 3, // left
    ]
}


// Shader //////////////////////////////////////////////////////////////////////

const vertexShaderSource = `#version 300 es
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
    // The world position is calculated by multiplying the model matrix with the
    // vertex position in model space.
    // The model matrix is a 4x4 matrix, which is why we need to expand the 3D
    // vertex position to a 4D vector by adding a 1.0 as the 4th component.
    // After the transformation, we can discard the 4th component again.

    f_worldPos = vec3(u_modelMatrix * vec4(a_pos, 1));

    // The final vertex position is calculated by multiplying the world position
    // with view matrix first and projection matrix second.
    // You can think of it as first moving the world so that the camera is at
    // the center, then rotating the world so that the camera is looking down
    // the negative z-axis.
    // The projection matrix then transforms the 3D world to 2D screen space.

    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(f_worldPos, 1.0);

    // Normal vectors are perpendicular to the surface of the model, and must be
    // transformed differently than the vertex position.
    // Instead, they are transformed by the inverse transpose of the model
    // matrix which we pre-calculate in the application, so we don't have to do
    // it for every vertex in the shader.
    // The normal matrix is a 3x3 matrix, because it only rotates and scales
    // the normal vectors, but doesn't translate them.
    // This is the same as calling:
    //  f_normal = transpose(inverse(mat3(u_modelMatrix))) * a_normal;
    // inside the vertex shader.

    f_normal = u_normalMatrix * a_normal;

    f_texCoord = a_texCoord;

}
`

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform vec3 u_viewPos;
uniform float u_ambient;
uniform float u_specular;
uniform float u_shininess;

uniform sampler2D u_texDiffuse;
uniform sampler2D u_texNormal;

in vec3 f_worldPos;
in vec3 f_normal;

in vec2 f_texCoord;

out vec4 FragColor;

void main() {
    // texture
    vec3 texDiffuse = texture(u_texDiffuse, f_texCoord).rgb;

    // ambient
    vec3 ambient = vec3(u_ambient) * texDiffuse;

    vec3 texNormal = texture(u_texNormal, f_texCoord).rgb;

    // diffuse
    vec3 normal = normalize(texNormal * (255./128.) - 1.0);
    vec3 lightDir = normalize(u_lightPos - f_worldPos);
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseIntensity * u_lightColor * texDiffuse;

    // specular
    vec3 viewDir = normalize(u_viewPos - f_worldPos);
    vec3 halfWay = normalize(lightDir + viewDir);
    float specularIntensity = pow(max(dot(normal, halfWay), 0.0), u_shininess);
    vec3 specular = (u_specular * specularIntensity) * u_lightColor;

    FragColor = vec4(ambient + diffuse + specular, 1.0);
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
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(`Unable to initialize shader program "${name}":${gl.getProgramInfoLog(shaderProgram)}`
        + `\nVertex Shader log: ${gl.getShaderInfoLog(vertexShader)}`
        + `\nFragent Shader log: ${gl.getShaderInfoLog(fragmentShader)}`)
}

// Skybox Shader ///////////////////////////////////////////////////////////////

const skyVertexShaderSource = `#version 300 es
    precision highp float;

    uniform mat3 u_viewRotationMatrix;
    uniform mat4 u_projectionMatrix;

    in vec3 a_pos;

    out vec3 f_texCoord;

    void main() {
        // Use the local position of the vertex as texture coordinate.
        f_texCoord = a_pos;

        // By setting Z == W, we ensure that the vertex is projected onto the
        // far plane, which is exactly what we want for the background.
        vec4 ndcPos = u_projectionMatrix * vec4(a_pos, 1.0);
        gl_Position = ndcPos.xyww;
    }
`

const skyFragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform samplerCube u_skybox;

    in vec3 f_texCoord;

    out vec4 FragColor;

    void main() {
        // The fragment color is simply the color of the skybox at the given
        // texture coordinate (local coordinate) of the fragment on the cube.
        FragColor = texture(u_skybox, f_texCoord);
    }
`

// Create the Vertex Shader
const skyVertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(skyVertexShader, skyVertexShaderSource)
gl.compileShader(skyVertexShader)

// Create the Fragment Shader
const skyFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(skyFragmentShader, skyFragmentShaderSource)
gl.compileShader(skyFragmentShader)

// Link the two into a single Shader Program
const skyShaderProgram = gl.createProgram()
gl.attachShader(skyShaderProgram, skyVertexShader)
gl.attachShader(skyShaderProgram, skyFragmentShader)
gl.linkProgram(skyShaderProgram)

// Data ////////////////////////////////////////////////////////////////////////

const blockVao = gl.createVertexArray()
gl.bindVertexArray(blockVao)

gl.useProgram(shaderProgram);
const shape = [[1, 1, 1, 1],
               [1, 0, 0, 1],
               [0, 0, 0, 0],
               [0, 0, 0, 0]];

let tetrisBlockInfo = createTetrisBlock(shape);

console.log(tetrisBlockInfo);

// Create the position buffer
const vertexPositions = new Float32Array(tetrisBlockInfo[0]);

const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW)


// Create the index buffer
const faceIndices = new Uint16Array(tetrisBlockInfo[1]);


const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceIndices, gl.STATIC_DRAW)

// Attribute Mapping ///////////////////////////////////////////////////////////

// Map the contents of the buffer to the vertex shader
const vertexAttribute = gl.getAttribLocation(shaderProgram, 'a_pos')
gl.enableVertexAttribArray(vertexAttribute)
gl.vertexAttribPointer(
    vertexAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    0         // offset
)

// const colorAttribute = gl.getAttribLocation(shaderProgram, 'a_color')
// gl.enableVertexAttribArray(colorAttribute)
// gl.vertexAttribPointer(
//     colorAttribute,
//     3,        // numComponents
//     gl.FLOAT, // type
//     false,    // normalize
//     32,       // stride
//     12        // offset
// )

const normalAttribute = gl.getAttribLocation(shaderProgram, 'a_normal')
gl.enableVertexAttribArray(normalAttribute)
gl.vertexAttribPointer(
    normalAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    12        // offset
)

const texCoordAttribute = gl.getAttribLocation(shaderProgram, 'a_texCoord')
gl.enableVertexAttribArray(texCoordAttribute)
gl.vertexAttribPointer(
    texCoordAttribute,
    2,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    32,       // stride
    24        // offset
)



// const colorAttribute = gl.getAttribLocation(shaderProgram, 'vertexColor')
// gl.enableVertexAttribArray(colorAttribute)
// gl.vertexAttribPointer(
//     colorAttribute,
//     4,        // numComponents
//     gl.FLOAT, // type
//     false,    // normalize
//     0,       // stride
//     0         // offset
// )



// const normalAttribute = gl.getAttribLocation(shaderProgram, 'a_normal');
// gl.enableVertexAttribArray(normalAttribute);
// gl.vertexAttribPointer(
//     normalAttribute,
//     3,
//     gl.FLOAT,
//     false,
//     24,
//     12
// );

gl.bindVertexArray(null)
gl.bindBuffer(gl.ARRAY_BUFFER, null)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

// Skybox Data /////////////////////////////////////////////////////////////////

const skyVao = gl.createVertexArray()
gl.bindVertexArray(skyVao)

const skyAttributes = createUnitBoxAttributes()
const skyVertexAttributes = new Float32Array(skyAttributes)
const skyAttributeBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, skyAttributeBuffer)
gl.bufferData(gl.ARRAY_BUFFER, skyVertexAttributes, gl.STATIC_DRAW)

const skyIndices = createUnitBoxIndices()
const skyFaceIndices = new Uint16Array(skyIndices)
const skyIndexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyIndexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, skyFaceIndices, gl.STATIC_DRAW)

// Define the attribute buffer layout
const skyPosAttribute = gl.getAttribLocation(skyShaderProgram, 'a_pos')
gl.enableVertexAttribArray(skyPosAttribute)
gl.vertexAttribPointer(
    skyPosAttribute,
    3,        // numComponents
    gl.FLOAT, // type
    false,    // normalize
    12,       // stride
    0,        // offset
)

gl.bindVertexArray(null)
gl.bindBuffer(gl.ARRAY_BUFFER, null)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

// Uniform /////////////////////////////////////////////////////////////////////

// Constants

let lightPos = [-3, 0, 10]
const lightColor = [1.0, 1.0, 1.0]
const viewPos = [0, 0, 2.5]
const ambient = 0.3
const specular = 0.5
const shininess = 2048
const projection = mat4.perspective(Math.PI / 4, 1, 0.1, 100)
let viewMatrix = new Float32Array(16)
let viewRotationMatrix = new Float32Array(9)

gl.useProgram(shaderProgram)
gl.uniform3fv(
    gl.getUniformLocation(shaderProgram, "u_lightPos"),
    lightPos)

gl.uniform3fv(
    gl.getUniformLocation(shaderProgram, "u_lightColor"),
    lightColor)

gl.uniform3fv(
    gl.getUniformLocation(shaderProgram, "u_viewPos"),
    viewPos)

gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "u_ambient"),
    ambient)

gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "u_specular"),
    specular)

gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "u_shininess"),
    shininess)

gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_projectionMatrix"),
    false, new Float32Array(projection))

gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_viewMatrix"),
    false, new Float32Array(mat4.invert(mat4.fromTranslation(viewPos))))

gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texAmbient"), 0)
gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texDiffuse"), 1)
gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texSpecular"), 2)
gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texNormal"), 3)

gl.useProgram(skyShaderProgram)
gl.uniformMatrix4fv(
    gl.getUniformLocation(skyShaderProgram, "u_projectionMatrix"), false,
    projection)
gl.uniform1i(gl.getUniformLocation(skyShaderProgram, "u_skybox"), 0)
gl.useProgram(null)



const skyRotationUniform = gl.getUniformLocation(skyShaderProgram, "u_viewRotationMatrix")


// Dynamic


const modelMatrixUniform = gl.getUniformLocation(shaderProgram, "u_modelMatrix")
const modelMatrix = new Float32Array(16)

const normalMatrixUniform = gl.getUniformLocation(shaderProgram, "u_normalMatrix")
const normalMatrix = new Float32Array(9)


// Textures
const WIP_TEXTURE_UNIT = gl.TEXTURE0 + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) - 1

const textures = [gl.createTexture(), gl.createTexture(), gl.createTexture(), gl.createTexture()]
const [ambientTexture, diffuseTexture, specularTexture, normalTexture] = textures
const textureUrls = [
    'img/block_ambient.png',
    'img/block_diffuse.png',
    'img/block_specular.png',
    'img/block_normal.png'
]


const placeholderPixel = new Uint8Array([0, 0, 0, 255]);


textures.forEach((texture, index) => {
    gl.activeTexture(WIP_TEXTURE_UNIT)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholderPixel)

    let image = new Image()
    image.onload = () => {
        gl.activeTexture(WIP_TEXTURE_UNIT)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D,
            0,                  // level
            gl.RGBA,            // internal format
            gl.RGBA,            // (source) format
            gl.UNSIGNED_BYTE,   // data type
            image)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        gl.bindTexture(gl.TEXTURE_2D, null)
        image = null
    }
    image.src = textureUrls[index]
    gl.bindTexture(gl.TEXTURE_2D, null)
})

// Skybox Texture //////////////////////////////////////////////////////////////



const skyUrls = [ // order: right, left, top, bottom, front, back
    'CloudyCrown_Sunset_Right.png',
    'CloudyCrown_Sunset_Left.png',
    'CloudyCrown_Sunset_Up.png',
    'CloudyCrown_Sunset_Down.png',
    'CloudyCrown_Sunset_Front.png',
    'CloudyCrown_Sunset_Back.png',
]

const skyTexture = gl.createTexture()
let skyTexturesLoaded = 0
gl.activeTexture(WIP_TEXTURE_UNIT)
gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyTexture)
for (let i = 0; i < skyUrls.length; i++) {
    gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, // face
        0,                                  // level
        gl.RGBA,                            // internal format
        1,                                  // width
        1,                                  // height
        0,                                  // border (must be zero)
        gl.RGBA,                            // (source) format
        gl.UNSIGNED_BYTE,                   // data type
        placeholderPixel,                   // data (will be set later)
    )

    let image = new Image()
    image.onload = () => {
        const index = i
        gl.activeTexture(WIP_TEXTURE_UNIT)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyTexture)
        gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, // face
            0,                                      // level
            gl.RGB,                                 // internal format
            gl.RGB,                                 // (source) format
            gl.UNSIGNED_BYTE,                       // data type
            image,                                  // data
        )
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
        ++skyTexturesLoaded
        image = null
    }
    image.src = skyUrls[i]
}
gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)

// Rendering ///////////////////////////////////////////////////////////////////
gl.enable(gl.DEPTH_TEST)   // Enable depth testing.
//gl.depthFunc(gl.ALWAYS);
gl.enable(gl.CULL_FACE)    // Enable (back-)face culling.

// (Re-)Bind the active textures
gl.activeTexture(gl.TEXTURE0 + 0)
gl.bindTexture(gl.TEXTURE_2D, ambientTexture)
gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyTexture)
gl.activeTexture(gl.TEXTURE0 + 1)
gl.bindTexture(gl.TEXTURE_2D, diffuseTexture)
gl.activeTexture(gl.TEXTURE0 + 2)
gl.bindTexture(gl.TEXTURE_2D, specularTexture)
gl.activeTexture(gl.TEXTURE0 + 3);
gl.bindTexture(gl.TEXTURE_2D, normalTexture)

function renderLoop(time) {
    // Update the model matrix every frame
    let modelMat = mat4.identity()
    mat4.multiply(modelMat, mat4.fromRotation(0.0002 * time, [0, 1, 0]))
    modelMatrix.set(modelMat)
    normalMatrix.set(mat3.fromMat4(mat4.transpose(mat4.invert(modelMat))))

    // Update the view position and -matrix
    let viewMat = mat4.identity()
    viewRotationMatrix.set(mat3.fromMat4(viewMat))

    const viewPos = vec3.transformMat4(vec3.zero(), viewMat)
    viewMatrix.set(mat4.invert(viewMat))

    // Clear the renderbuffers before drawing.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.depthFunc(gl.ALWAYS);  // For rendering the skybox correctly.
    if (skyTexturesLoaded === 6) {
        // Enable the vertex array object
        gl.bindVertexArray(skyVao)

        // Set up the Shader and -Uniforms
        gl.useProgram(skyShaderProgram)
        gl.uniformMatrix3fv(skyRotationUniform, false, viewRotationMatrix)

        // Do not cull faces as we are looking from inside the cube.
        gl.disable(gl.CULL_FACE)

        // Draw the world.
        gl.drawElements(
            gl.TRIANGLES,           // primitive type
            skyIndices.length,   // vertex count
            gl.UNSIGNED_SHORT,      // type of indices
            0,                      // offset
        )
    }

    gl.depthFunc(gl.LESS);  // Set to LESS so block faces get drawn correctly.
    gl.bindVertexArray(blockVao)
    // Set up the Shader and -Uniforms
    gl.useProgram(shaderProgram)

    gl.uniformMatrix4fv(
        modelMatrixUniform,
        false, // has to be false
        modelMatrix)
    gl.uniformMatrix3fv(
        normalMatrixUniform,
        false, // has to be false
        normalMatrix)

    // Cull back-facing faces of the sphere
    gl.enable(gl.CULL_FACE)
    //gl.cullFace(gl.FRONT);
    // Draw the scene.
    gl.drawElements(
        gl.TRIANGLES,       // primitive type
        faceIndices.length, // vertex count
        gl.UNSIGNED_SHORT,  // type of indices
        0                   // offset
    )

    // Teardown State
    gl.useProgram(null)
    gl.bindVertexArray(null)
}

setRenderLoop(renderLoop)

