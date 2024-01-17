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
            let x = 0 + (0.25 * col);
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
    f_worldPos = vec3(u_modelMatrix * vec4(a_pos, 1));
    f_normal = u_normalMatrix * a_normal;
    f_texCoord = a_texCoord;
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(f_worldPos, 1.0);
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

uniform sampler2D u_texAmbient;
uniform sampler2D u_texDiffuse;
uniform sampler2D u_texSpecular;

in vec3 f_worldPos;
in vec3 f_normal;
in vec2 f_texCoord;

out vec4 FragColor;

void main() {

    // texture
    vec3 texAmbient = texture(u_texAmbient, f_texCoord).rgb;
    vec3 texDiffuse = texture(u_texDiffuse, f_texCoord).rgb;
    vec3 texSpecular = texture(u_texSpecular, f_texCoord).rgb;

    // ambient
    vec3 ambient = max(vec3(u_ambient), texAmbient) * texDiffuse;

    // diffuse
    vec3 normal = normalize(f_normal);
    vec3 lightDir = normalize(u_lightPos - f_worldPos);
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseIntensity * u_lightColor * texDiffuse;

    // specular
    vec3 viewDir = normalize(u_viewPos - f_worldPos);
    vec3 halfWay = normalize(lightDir + viewDir);
    float specularIntensity = pow(max(dot(normal, halfWay), 0.0), u_shininess);
    vec3 specular = (u_specular * specularIntensity) * texSpecular * u_lightColor;

    // color
    FragColor = vec4(ambient + diffuse + specular, 1.0);

    gl_FragDepth = gl_FragCoord.z;
}
`

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
    vec4 ndcPos = u_projectionMatrix * inverse(mat4(u_viewRotationMatrix)) * vec4(a_pos, 1.0);
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

// Playfield Shader ////////////////////////////////////////////////////////////

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

    f_worldPos = vec3(u_modelMatrix * vec4(a_pos, 1) * 0.25);
    f_normal = u_normalMatrix * a_normal;
    f_texCoord = a_texCoord;
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(f_worldPos, 1.0);
}
`

const playfieldFragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 FragColor;

void main() {
    FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragDepth = gl_FragCoord.z;
}
`
const phongVertexShader = `#version 300 es
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
        f_worldPos = vec3(u_modelMatrix * vec4(a_pos, 1.0));
        f_normal = u_normalMatrix * a_normal;
        f_texCoord = a_texCoord;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_pos, 1.0);
    }
`;


const instancedPhongVertexShader = `#version 300 es
    precision highp float;

    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    in vec3 a_pos;
    in vec3 a_normal;
    in vec2 a_texCoord;
    in mat4 a_modelMatrix;
    in mat3 a_normalMatrix;
    in float a_alpha;

    out vec3 f_worldPos;
    out vec3 f_normal;
    out vec2 f_texCoord;
    out float f_alpha;

    void main() {
        f_worldPos = vec3(a_modelMatrix * vec4(a_pos, 1.0));
        f_normal = a_normalMatrix * a_normal;
        f_texCoord = a_texCoord;
        f_alpha = a_alpha;
        gl_Position = u_projectionMatrix * u_viewMatrix * a_modelMatrix * vec4(a_pos, 1.0);
    }
`;

const phongFragmentShader = `#version 300 es
    precision mediump float;

    uniform float u_ambient;
    uniform float u_specular;
    uniform float u_shininess;
    uniform vec3 u_lightPos;
    uniform vec3 u_lightColor;
    uniform vec3 u_viewPos;
    uniform sampler2D u_texAmbient;
    uniform sampler2D u_texDiffuse;
    uniform sampler2D u_texSpecular;

    in vec3 f_worldPos;
    in vec3 f_normal;
    in vec2 f_texCoord;
    in float f_alpha;

    out vec4 FragColor;

    void main() {

        // texture
        vec3 texAmbient = texture(u_texAmbient, f_texCoord).rgb;
        vec3 texDiffuse = texture(u_texDiffuse, f_texCoord).rgb;
        vec3 texSpecular = texture(u_texSpecular, f_texCoord).rgb;

        // ambient
        vec3 ambient = max(vec3(u_ambient), texAmbient) * texDiffuse;

        // diffuse
        vec3 normal = normalize(f_normal);
        vec3 lightDir = normalize(u_lightPos - f_worldPos);
        float diffuseIntensity = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diffuseIntensity * u_lightColor * texDiffuse;

        // specular
        vec3 viewDir = normalize(u_viewPos - f_worldPos);
        vec3 halfWay = normalize(lightDir + viewDir);
        float specularIntensity = pow(max(dot(normal, halfWay), 0.0), u_shininess);
        vec3 specular = (u_specular * specularIntensity) * texSpecular * u_lightColor;

        // color
        FragColor = vec4(ambient + diffuse + specular, f_alpha);
    }
`;

// Data ////////////////////////////////////////////////////////////////////////
const projectionMatrix = mat4.perspective(Math.PI / 4, 1, 0.1, 100)

// const phongShader = glance.buildShaderProgram(gl, "phong-shader", phongVertexShader, phongFragmentShader, {
//     u_ambient: 0.1,
//     u_specular: 0.6,
//     u_shininess: 64,
//     u_lightPos: [0, 0, 5],
//     u_lightColor: [1, 1, 1],
//     u_projectionMatrix: projectionMatrix,
//     u_texAmbient: 0,
//     u_texDiffuse: 1,
//     u_texSpecular: 2,
// });

// Block


const blockShader = glance.buildShaderProgram(gl, "block-shader", vertexShaderSource, fragmentShaderSource, {
    u_ambient: 0.1,
    u_specular: 0.6,
    u_shininess: 64,
    u_lightPos: [0, 0, 5],
    u_lightColor: [1, 1, 1],
    u_projectionMatrix: projectionMatrix,
    u_texAmbient: 0,
    u_texDiffuse: 1,
    u_texSpecular: 2,
})

const shape = [
    [1, 0, 0, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0]
];

let tetrisBlockInfo = createTetrisBlock(shape);

const vertexPositions = new Float32Array(tetrisBlockInfo[0]);
const faceIndices = new Uint16Array(tetrisBlockInfo[1]);

const blockIBO = glance.createIndexBuffer(gl, faceIndices)

const blockABO = glance.createAttributeBuffer(gl, "block-abo", vertexPositions, {
    a_pos: { size: 3, type: gl.FLOAT },
    a_normal: { size: 3, type: gl.FLOAT },
    a_texCoord: { size: 2, type: gl.FLOAT },
})

const blockVAO = glance.createVAO(
    gl,
    "block-vao",
    blockIBO,
    glance.buildAttributeMap(blockShader, blockABO, ["a_pos", "a_normal", "a_texCoord"])
)

const blockTextureAmbient = await glance.loadTextureNow(gl, "/img/block_ambient.png")
const blockTextureDiffuse = await glance.loadTextureNow(gl, "./img/block_diffuse.png")
const blockTextureSpecular = await glance.loadTextureNow(gl, "./img/block_specular.png")

// Skybox

const skyShader = glance.buildShaderProgram(gl, "sky-shader", skyVertexShaderSource, skyFragmentShaderSource, {
    u_projectionMatrix: projectionMatrix,
    u_skybox: 0,
})

const skyIBO = glance.createIndexBuffer(gl, glance.createSkyBoxIndices())

const skyABO = glance.createAttributeBuffer(gl, "sky-abo", glance.createSkyBoxAttributes(), {
    a_pos: { size: 3, type: gl.FLOAT },
})

const skyVAO = glance.createVAO(gl, "sky-vao", skyIBO, glance.buildAttributeMap(skyShader, skyABO))

const skyCubemap = await glance.loadCubemapNow(gl, "sky-texture", [
    "./CloudyCrown_Sunset_Left.png",
    "./CloudyCrown_Sunset_Right.png",
    "./CloudyCrown_Sunset_Up.png",
    "./CloudyCrown_Sunset_Down.png",
    "./CloudyCrown_Sunset_Front.png",
    "./CloudyCrown_Sunset_Back.png",
], {flipY: false})

// Playfield 1

const playfieldShader = glance.buildShaderProgram(gl, "playfield-shader", instancedPhongVertexShader, phongFragmentShader, {
    u_ambient: 0.1,
    u_specular: 0.6,
    u_shininess: 64,
    u_lightPos: [0, 0, 5],
    u_lightColor: [1, 1, 1],
    u_projectionMatrix: projectionMatrix,
    u_texAmbient: 0,
    u_texDiffuse: 0,
    u_texSpecular: 0,
})

const { attributes: playfieldAttr, indices: playfieldIdx } = await glance.loadObj("./obj/playfield.obj")

const playfieldIBO = glance.createIndexBuffer(gl, playfieldIdx)

const playfieldABO = glance.createAttributeBuffer(gl, "playfield-abo", playfieldAttr, {
    a_pos: { size: 3, type: gl.FLOAT },
    a_texCoord: { size: 2, type: gl.FLOAT },
    a_normal: { size: 3, type: gl.FLOAT },
})

const playfieldCount = 2;


const playfieldInstanceAttributes = new Float32Array(playfieldCount * 26); // 16 + 9 + 1
const playfieldIABO = glance.createAttributeBuffer(gl, "playfield-iabo", playfieldInstanceAttributes, {
    a_modelMatrix: { size: 4, width: 4, type: gl.FLOAT, divisor: 1 },
    a_normalMatrix: { size: 3, width: 3, type: gl.FLOAT, divisor: 1 },
    a_alpha: { size: 1, width: 1, type: gl.FLOAT, divisor: 1 }
});

const playfieldVAO = glance.createVAO(
    gl,
    "playfield-vao",
    playfieldIBO,
    glance.combineAttributeMaps(
        glance.buildAttributeMap(playfieldShader, playfieldABO),
        glance.buildAttributeMap(playfieldShader, playfieldIABO),
    ),
)
console.log(playfieldVAO)

let firstFieldActive = true;

function updateBlockAttributes() {
    const modelMatrix = mat4.identity();
    mat4.rotate(modelMatrix, Math.PI / 2, [0, 0, 1]);
    const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.invert(modelMatrix)));
    playfieldInstanceAttributes.set(modelMatrix);
    playfieldInstanceAttributes.set(normalMatrix);
}

function updatePlayfieldInstanceAttributes() {
    for (let i = 0; i < playfieldCount; i++) {
        const modelMatrix = mat4.identity();

        mat4.translate(modelMatrix, [0, -6, 0])

        mat4.rotate(modelMatrix, i * (Math.PI / playfieldCount), [0, 1, 0])

        var alpha = 1;
        if (firstFieldActive) {
            alpha = (i == 0) ? 1 : 0.05;
            const arrayOffset = i * 26;
            playfieldInstanceAttributes.set(modelMatrix, arrayOffset);
            playfieldInstanceAttributes.set([alpha], arrayOffset + 25);
            const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.invert(modelMatrix)));
            playfieldInstanceAttributes.set(normalMatrix, arrayOffset + 16);

        } else {
            alpha = (i == 1) ? 1 : 0.05;
            const arrayOffset = (i == 0) ? 26 : 0;  // Fixes intersection being transparent. 
            playfieldInstanceAttributes.set(modelMatrix, arrayOffset);
            playfieldInstanceAttributes.set([alpha], arrayOffset + 25);
            const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.invert(modelMatrix)));
            playfieldInstanceAttributes.set(normalMatrix, arrayOffset + 16);
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, playfieldIABO.glObject);
    gl.bufferData(gl.ARRAY_BUFFER, playfieldInstanceAttributes, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}


// Draw Calls /////////////////////////////////////////////////////////////////////

// Scene State
var targetViewDist = 22;
var targetViewPan = -0.5;
var targetViewTilt = -0.25;

let viewDist = 22
let viewPan = 0
let viewTilt = 0
let panDelta = 0
let tiltDelta = 0

const viewRotationMatrix = new glance.Cached(
    () =>
        mat4.multiply(
            mat4.fromRotation(viewPan, [0, 1, 0]),
            mat4.fromRotation(viewTilt, [1, 0, 0]),
        )
);

const blockDrawCall = glance.createDrawCall(
    gl,
    blockShader,
    blockVAO,
    {
        uniforms: {

            // uniform update callbacks
            u_modelMatrix: () => mat4.translate(mat4.scale(mat4.identity(), [4, 4, 4]), [-0.125, 0, 0.125]),
            u_normalMatrix: (time) => mat3.fromMat4(mat4.transpose(mat4.invert(mat4.multiply(mat4.identity(), mat4.fromRotation(0.000 * time, [0, 1, 0]))))),
            u_viewMatrix: () => mat4.invert(mat4.multiply(mat4.multiply(
                mat4.multiply(mat4.identity(), mat4.fromRotation(viewPan, [0, 1, 0])),
                mat4.fromRotation(viewTilt, [1, 0, 0])
            ), mat4.fromTranslation([0, 0, viewDist]))),
            u_viewPos: () => vec3.transformMat4(vec3.zero(), mat4.multiply(mat4.multiply(
                mat4.multiply(mat4.identity(), mat4.fromRotation(viewPan, [0, 1, 0])),
                mat4.fromRotation(viewTilt, [1, 0, 0])
            ), mat4.fromTranslation([0, 0, viewDist]))),
        },
        textures: [
            // texture bindings
            [0, blockTextureAmbient],
            [1, blockTextureDiffuse],
            [2, blockTextureSpecular],
        ],
        cullFace: gl.BACK,
        depthTest: gl.LESS,
    },

)

const skyDrawCall = glance.createDrawCall(
    gl,
    skyShader,
    skyVAO,
    {
        uniforms: {
            u_viewRotationMatrix: () => mat3.fromMat4(viewRotationMatrix.get()),
        },
        textures: [
            [0, skyCubemap],
        ],
        cullFace: gl.NONE,
        depthTest: gl.LEQUAL,
    }
);


const playfieldDrawCall = glance.createDrawCall(
    gl,
    playfieldShader,
    playfieldVAO,
    {
        uniforms: {

            // uniform update callbacks
            // u_modelMatrix: () => {
            //    mat4.translate(mat4.identity(), [0.5, -4.5, 0]);
            // },
            // u_normalMatrix: (time) => mat3.fromMat4(mat4.transpose(mat4.invert(mat4.multiply(mat4.identity(), mat4.fromRotation(0.000 * time, [0, 1, 0]))))),
            u_viewMatrix: () => mat4.invert(mat4.multiply(mat4.multiply(
                mat4.multiply(mat4.identity(), mat4.fromRotation(viewPan, [0, 1, 0])),
                mat4.fromRotation(viewTilt, [1, 0, 0])
            ), mat4.fromTranslation([0, 0, viewDist]))),
        },
        textures: [],
        cullFace: gl.BACK,
        depthTest: gl.LEQUAL,
        instanceCount: playfieldCount,

    },
    // [
    //     // texture bindings
    //     [0, blockTextureAmbient],
    //     [1, blockTextureDiffuse],
    //     [2, blockTextureSpecular],
    //     [3, blockTextureNormal],
    // ]
)


let lastTime = 0;

// Set the transition time in seconds
const transitionTime = 2; // Adjust this as needed

// Variable to track the elapsed time
let elapsedTime = 0;

let isSpacePressed = false;
let animationStartTime = 0;

setRenderLoop((time) => {
    //console.log(viewPan, viewTilt, viewDist)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const deltaTime = (time - lastTime) / 1000; // Convert to seconds
    lastTime = time;
    if (elapsedTime < transitionTime) updateBeginningAnimation(deltaTime)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotateAnimation(time)

    viewRotationMatrix.setDirty();
    updatePlayfieldInstanceAttributes(time);
    updateBlockAttributes();
    glance.performDrawCall(gl, blockDrawCall, time);
    glance.performDrawCall(gl, skyDrawCall, time);
    glance.performDrawCall(gl, playfieldDrawCall, time);
});

function updateBeginningAnimation(deltaTime) {
    elapsedTime += deltaTime;

    // Calculate the interpolation factor (value between 0 and 1)
    const t = Math.min(elapsedTime / transitionTime, 1);
    //console.log(t)
    // Use linear interpolation (lerp) to update the variables
    viewDist = lerp(0, targetViewDist, t);
    viewPan = lerp(0, targetViewPan, t);
    viewTilt = lerp(0, targetViewTilt, t);

    // Update your render or camera setup using the updated variables
}


function rotateAnimation(time) {
    if (isSpacePressed) {
        const animationDuration = 500; // Duration of the animation in milliseconds

        // Calculate elapsed time since the animation started
        const elapsedTime = time - animationStartTime;

        // Check if the animation is still in progress
        if (elapsedTime < animationDuration) {
            // Calculate the rotation angle based on elapsed time
            const rotationAngle = targetViewPan + (elapsedTime / animationDuration) * (Math.PI / 2);

            // Update viewPan based on the rotation angle
            viewPan = rotationAngle;
        } else {
            // Animation completed, reset variables
            isSpacePressed = false;
            viewPan = targetViewPan + Math.PI / 2;  // Set final rotation angle
            targetViewPan = viewPan;
            firstFieldActive = !firstFieldActive;
            updateBlockAttributes();
        }
    }
}

// Linear interpolation function
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

onMouseDrag((e) => {
    viewPan += e.movementX * -.01
    viewTilt += e.movementY * -.01
})

onMouseWheel((e) => {
    viewDist = Math.max(1.5, Math.min(100, viewDist * (1 + Math.sign(e.deltaY) * 0.2)))
})

onKeyDown((e) => {
    console.log(e)
    if (e.key == "ArrowLeft") {
        
    }
    if (e.key == "ArrowRight") {
        
    }
    if (e.key == "ArrowUp") {
        
    }
    if (e.key == "ArrowDown") {
        
    }
    if (e.key == " ") {
        if (!isSpacePressed) animationStartTime = e.timeStamp;
        isSpacePressed = true;
    }
})

onKeyUp((e) => {
    if (e.key == "ArrowLeft") {
        
    }
    if (e.key == "ArrowRight") {
        
    }
    if (e.key == "ArrowUp") {
        
    }
    if (e.key == "ArrowDown") {
        
    }
})