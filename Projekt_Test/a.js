// #region Boilerplate Code 
import glance, { DepthTest } from './js/glance.js';
import { createBlock } from './testing.js'
import { Playfield } from './playfield.js'
import * as global from './globalGameVariables.js'

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


const {
    vec3,
    mat3,
    mat4,
} = glance;

// #endregion
let gameField = new Playfield();

// #region Block Builder

function createTetrisBlock() {

    let indices = [];

    // Cube corners / vertices
    let attributes = [
        // Left Face
        0, 1, .5, -1, 0, 0, 1, 1,  // 0
        0, 0, .5, -1, 0, 0, 1, 0,
        0, 1, -.5, -1, 0, 0, 0, 1,
        0, 0, -.5, -1, 0, 0, 0, 0,

        // Front Face
        0, 1, .5, 0, 0, 1, 0, 1,  // 4
        1, 1, .5, 0, 0, 1, 1, 1,
        0, 0, .5, 0, 0, 1, 0, 0,
        1, 0, .5, 0, 0, 1, 1, 0,

        // Right Face
        1, 1, .5, 1, 0, 0, 1, 1,  // 8
        1, 1, -.5, 1, 0, 0, 0, 1,
        1, 0, .5, 1, 0, 0, 1, 0,
        1, 0, -.5, 1, 0, 0, 0, 0,

        // Back Face
        0, 1, -.5, 0, 0, -1, 0, 0,  // 12
        1, 1, -.5, 0, 0, -1, 0, 1,
        0, 0, -.5, 0, 0, -1, 1, 0,
        1, 0, -.5, 0, 0, -1, 1, 1,

        // Top Face
        0, 0, .5, 0, 1, 0, 0, 1,  // 16
        0, 0, -.5, 0, 1, 0, 0, 0,
        1, 0, .5, 0, 1, 0, 1, 1,
        1, 0, -.5, 0, 1, 0, 1, 0,

        // Bottom Face
        0, 1, .5, 0, -1, 0, 0, 0,  // 20
        0, 1, -.5, 0, -1, 0, 0, 1,
        1, 1, .5, 0, -1, 0, 1, 0,
        1, 1, -.5, 0, -1, 0, 1, 1,
    ];

    // Indices for the cube
    // Left face
    indices.push(0, 1, 2);
    indices.push(1, 3, 2);

    // Front face
    indices.push(4, 5, 6);
    indices.push(5, 7, 6);

    // Right face
    indices.push(8, 9, 10);
    indices.push(9, 11, 10);

    // Back face
    indices.push(14, 13, 12);
    indices.push(14, 15, 13);

    // Top face
    indices.push(18, 17, 16);
    indices.push(18, 19, 17);

    // Bottom face
    indices.push(20, 21, 22);
    indices.push(21, 23, 22);

    return {
        attributes: attributes,
        indices: indices
    }
}

// #endregion

// #region Shapes

// Generate a randomized list of shape indices using a "7 bag" generator.
function randomizeShapes() {
    let init = [0, 1, 2, 3, 4, 5, 6];
    let result = [];
    for (let i = 0; i < 7; i++) {
        let randIdx = Math.floor(Math.random() * init.length);
        result.push(init[randIdx]);
        init.splice(randIdx, 1);
    }
    return result;
}

var totalBlockCount = 0;
let lastBlockIndex = 0;
let currentBlockIndex = 0;
let randomShapes = randomizeShapes();
let blockComponentOffsets = [];


let currentBlock;
let indicatorBlock;

function spawnNewBlock() {
    if (currentBlock) updateBlockInstanceAttributes();
    global.addClearedLines(gameField.clear());
    console.log(global.level);
    blockOffset = [0, 0, 0]
    totalBlockCount++;

    let shapeIdx = (totalBlockCount - 1) % 7

    // Generate new blocks
    if (shapeIdx == 0) {
        randomShapes = randomizeShapes();
    }

    if (currentBlock) {
        gameField.clearIndicator(currentBlock.indicatorBlock)
    }

    let index = getCurrentShapeIndex();
    switch (getCurrentShapeIndex()) {
        case 0:  // Z Block
            currentBlock = createBlock(0);
            indicatorBlock = createBlock(0, 2);
            break;
        case 1:  // S Block
            currentBlock = createBlock(1);
            indicatorBlock = createBlock(1, 2);
            break;
        case 2:  // L Block
            currentBlock = createBlock(2);
            indicatorBlock = createBlock(2, 2);
            break;
        case 3:  // Reversed L Block
            currentBlock = createBlock(3);
            indicatorBlock = createBlock(3, 2);
            break;
        case 4:  // 2x2 Block
            currentBlock = createBlock(4);
            indicatorBlock = createBlock(4, 2);
            break;
        case 5:  // T Block
            currentBlock = createBlock(5);
            indicatorBlock = createBlock(5, 2);
            break;
        case 6:  // 4x1 Block
            currentBlock = createBlock(6);
            indicatorBlock = createBlock(6, 2);
            break;
    }
    //console.log("CREATED NEW BLOCK: ", currentBlock)
    gameField.placeBlock(currentBlock);
    currentBlock.setIndicator(indicatorBlock)
    //console.log(currentBlock.indicatorBlock)
    //gameField.setIndicator(currentBlock);
}


function getCurrentShapeIndex() {
    return randomShapes[(totalBlockCount) % 7]
}



// #endregion

// #region Vertex / Fragment Shaders

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
in float f_alpha;
in vec3 f_color;

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
    vec3 diffuse = diffuseIntensity * u_lightColor;
    vec3 adjustedDiffuse = mix(diffuse, f_color, 1.0);

    // specular
    vec3 viewDir = normalize(u_viewPos - f_worldPos);
    vec3 halfWay = normalize(lightDir + viewDir);
    float specularIntensity = pow(max(dot(normal, halfWay), 0.0), u_shininess);
    vec3 specular = (u_specular * specularIntensity) * texSpecular * u_lightColor;
 
    // color
    FragColor = vec4((ambient + adjustedDiffuse + specular), f_alpha);

    gl_FragDepth =  1.0 - f_alpha + gl_FragCoord.z;;
}
`

const instancedBlockVertexShader = `#version 300 es
precision highp float;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

in vec3 a_pos;
in vec3 a_normal;
in mat4 a_modelMatrix;
in mat3 a_normalMatrix;
in float a_alpha;
in vec2 a_texCoord;

out vec3 f_worldPos;
out vec3 f_normal;
out vec2 f_texCoord;
out float f_alpha;

void main() {
    f_worldPos = vec3(a_modelMatrix * vec4(a_pos, 1));
    f_normal = a_normalMatrix * a_normal;
    f_texCoord = a_texCoord;
    f_alpha = a_alpha;
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(f_worldPos, 1.0);
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
    in vec3 a_color;

    out vec3 f_worldPos;
    out vec3 f_normal;
    out vec2 f_texCoord;
    out float f_alpha;
    out vec3 f_color;

    void main() {
        if (a_alpha >= 0.001) {

            f_worldPos = vec3(a_modelMatrix * vec4(a_pos, 1.0));
            f_normal = a_normalMatrix * a_normal;
            f_texCoord = a_texCoord;
            f_alpha = a_alpha;
            f_color = a_color;
            gl_Position = u_projectionMatrix * u_viewMatrix * a_modelMatrix * vec4(a_pos, 1.0);
        }
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
    in vec3 f_color;

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
        //FragColor = vec4(f_alpha * 5.0, 1, 1, 1);
    }
`;

// #endregion

// #region Block Shader Components
const aspectRatio = canvas.width / canvas.height;
const projectionMatrix = mat4.perspective(Math.PI / 4, aspectRatio, 0.1, 1000)

const blockShader = glance.buildShaderProgram(gl, "block-shader", instancedPhongVertexShader, fragmentShaderSource, {
    u_ambient: 0.7,
    u_specular: 0.9,
    u_shininess: 64,
    u_lightPos: [0, -5, 0],
    u_lightColor: [1, 1, 1],
    u_projectionMatrix: projectionMatrix,
    u_texAmbient: 0,
    u_texDiffuse: 1,
    u_texSpecular: 2,
})


let blockInfo = createTetrisBlock();

const blockIBO = glance.createIndexBuffer(gl, new Uint16Array(blockInfo.indices));

let blockABO = glance.createAttributeBuffer(gl, "block-abo", blockInfo.attributes, {
    a_pos: { size: 3, type: gl.FLOAT },
    a_normal: { size: 3, type: gl.FLOAT },
    a_texCoord: { size: 2, type: gl.FLOAT },
});


const maxtotalBlockCount = 2 * 11 * 18;

let blockAttribLength = 29
const blockInstanceAttributes = new Float32Array(maxtotalBlockCount * blockAttribLength);  // 16 + 9 + 1

const blockIABO = glance.createAttributeBuffer(gl, "block-iabo", blockInstanceAttributes, {
    a_modelMatrix: { size: 4, width: 4, type: gl.FLOAT, divisor: 1 },
    a_normalMatrix: { size: 3, width: 3, type: gl.FLOAT, divisor: 1 },
    a_alpha: { size: 1, width: 1, type: gl.FLOAT, divisor: 1 },
    a_color: { size: 3, width: 1, type: gl.FLOAT, divisor: 1 }
    //a_warning: { size: 1, width: 1, type: gl.FLOAT, divisor: 1 }
});




const blockVAO = glance.createVAO(
    gl,
    "block-vao",
    blockIBO,
    glance.combineAttributeMaps(
        glance.buildAttributeMap(blockShader, blockABO),
        glance.buildAttributeMap(blockShader, blockIABO),
    )
)


const blockTextureAmbient = await glance.loadTextureNow(gl, ".img/block_ambient.png")
const blockTextureDiffuse = await glance.loadTextureNow(gl, ".img/block_diffuse.png")
const blockTextureSpecular = await glance.loadTextureNow(gl, ".img/block_specular.png")



// #endregion

// #region Sky Shader Components

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
    "./loudyCrown_Sunset_Right.png",
    "./CloudyCrown_Sunset_Up.png",
    "./CloudyCrown_Sunset_Down.png",
    "./CloudyCrown_Sunset_Front.png",
    "./CloudyCrown_Sunset_Back.png",
], { flipY: false })

// #endregion

// #region Playfield Shader Components

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

let playfieldAttribLength = 29;
const playfieldInstanceAttributes = new Float32Array(playfieldCount * playfieldAttribLength); // 16 + 9 + 1 + 1
const playfieldIABO = glance.createAttributeBuffer(gl, "playfield-iabo", playfieldInstanceAttributes, {
    a_modelMatrix: { size: 4, width: 4, type: gl.FLOAT, divisor: 1 },
    a_normalMatrix: { size: 3, width: 3, type: gl.FLOAT, divisor: 1 },
    a_alpha: { size: 1, width: 1, type: gl.FLOAT, divisor: 1 },
    a_color: { size: 3, width: 1, type: gl.FLOAT, divisor: 1 }

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

// #endregion

// #region Block Instance Update


var blockOffset = [0, 0, 0]
let firstFieldActive = true;
let xMove = [1, 0, 0]
let yMove = [0, 1, 0]
let rPressed = false;


function updateBlockInstanceAttributes() {
    let field = gameField._boards;
    let indexCounter = 0;
    let shape = currentBlock.activeShape;

    for (let z = 0; z < field.length; z++) {

        // Set color of current block.
        for (let j = 0; j < shape.length; j++) {
            for (let i = 0; i < shape[j].length; i++) {
                if (shape[j][i] != -1) {
                    //console.log(currentBlock.location)
                    if (firstFieldActive && z == 0) {
                        let index = (currentBlock.location[1] + j) * 11 + currentBlock.location[0] + i;
                        blockInstanceAttributes.set(currentBlock.color, index * blockAttribLength + 26);
                    }
                    if (!firstFieldActive && z == 1) {
                        let index = (1 * 11 * 18) + ((currentBlock.location[1] + j) * 11) + currentBlock.location[0] + i;
                        blockInstanceAttributes.set(currentBlock.color, index * blockAttribLength + 26);
                    }
                    if (currentBlock.location[0] + i == 5) {
                        if (firstFieldActive && z == 1) {
                            let index = (1 * 11 * 18) + ((currentBlock.location[1] + j) * 11) + currentBlock.location[0] + i;
                            blockInstanceAttributes.set(currentBlock.color, index * blockAttribLength + 26);
                        } if (!firstFieldActive && z == 0) {
                            let index = ((currentBlock.location[1] + j) * 11) + currentBlock.location[0] + i;
                            blockInstanceAttributes.set(currentBlock.color, index * blockAttribLength + 26);

                        }
                    }
                }
            }
        }
        for (let y = 0; y < field[0].length; y++) {
            for (let x = 0; x < field[0][0].length; x++) {
                if (field[z][y][x] != -1) {

                    if ((firstFieldActive && z == 0)) {
                        blockInstanceAttributes.set([1.0], indexCounter * blockAttribLength + 25);
                        if (field[z][y][x] == 2) {
                            blockInstanceAttributes.set([0.5], indexCounter * blockAttribLength + 25);
                            blockInstanceAttributes.set(currentBlock.color, indexCounter * blockAttribLength + 26);
                        }
                    }
                    else if (!firstFieldActive && z == 1) {
                        blockInstanceAttributes.set([1.0], indexCounter * blockAttribLength + 25);
                        if (field[z][y][x] == 2) {
                            blockInstanceAttributes.set([0.5], indexCounter * blockAttribLength + 25);
                            blockInstanceAttributes.set(currentBlock.color, indexCounter * blockAttribLength + 26);
                        }
                    }
                    else blockInstanceAttributes.set([0.2], indexCounter * blockAttribLength + 25);
                }
                else {
                    blockInstanceAttributes.set([0.0], indexCounter * blockAttribLength + 25);
                    //blockInstanceAttributes.set(currentBlock.color, indexCounter * blockAttribLength + 26);

                }
                indexCounter++;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, blockIABO.glObject);
        gl.bufferData(gl.ARRAY_BUFFER, blockInstanceAttributes, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}

let blockSpawn = [-5, 0, 0]

function initBlockAttributes() {
    let field = gameField._boards;
    let indexCounter = 0;
    for (let i = 0; i < field.length; i++) {
        for (let y = 0; y < field[0].length; y++) {
            for (let x = 0; x < field[0][0].length; x++) {
                var modelMatrix = mat4.identity();

                blockInstanceAttributes.set([0.0], indexCounter * blockAttribLength + 25);
                mat4.translate(modelMatrix, [-0.5, 0, 0])
                mat4.translate(modelMatrix, blockSpawn)

                // First or second board. 
                if (i == 0) {
                    mat4.translate(modelMatrix, [x, field[0].length - 1 - y, 0])
                } else {
                    mat4.translate(modelMatrix, [-blockSpawn[0], field[0].length - 1 - y, -1 * blockSpawn[0] - x])
                }

                blockInstanceAttributes.set(modelMatrix, indexCounter * blockAttribLength);
                const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.invert(modelMatrix)));
                blockInstanceAttributes.set(normalMatrix, indexCounter * blockAttribLength + 16);

                indexCounter++;
            }
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, blockIABO.glObject);
    gl.bufferData(gl.ARRAY_BUFFER, blockInstanceAttributes, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

initBlockAttributes();

// }
// #endregion

// #region Playfield Instance Update

function updatePlayfieldInstanceAttributes() {
    for (let i = 0; i < playfieldCount; i++) {
        const modelMatrix = mat4.identity();

        mat4.translate(modelMatrix, [0, 0, 0])

        mat4.rotate(modelMatrix, i * (Math.PI / playfieldCount), [0, 1, 0])

        var alpha = 1;
        if (firstFieldActive) {
            alpha = (i == 0) ? 1 : 0.0;

        } else {
            alpha = (i == 1) ? 1 : 0.0;
        }
        const arrayOffset = (i == 0) ? playfieldAttribLength : 0;  // Fixes intersection being transparent. 
        playfieldInstanceAttributes.set(modelMatrix, arrayOffset);
        playfieldInstanceAttributes.set([alpha], arrayOffset + 25);
        const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.invert(modelMatrix)));
        playfieldInstanceAttributes.set(normalMatrix, arrayOffset + 16);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, playfieldIABO.glObject);
    gl.bufferData(gl.ARRAY_BUFFER, playfieldInstanceAttributes, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

// #endregion

// #region Draw Calls

// Scene State
var targetViewDist = 25;
var targetViewPan = Math.PI * 2 * 2;
var targetViewTilt = 0.3;

let viewHeight = 8;
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
            u_viewMatrix: () => mat4.invert(mat4.multiply(mat4.multiply(
                mat4.multiply(mat4.identity(), mat4.fromRotation(viewPan, [0, 1, 0])),
                mat4.fromRotation(viewTilt, [1, 0, 0])
            ), mat4.fromTranslation([0, viewHeight, viewDist])))
        },
        textures: [
            [0, blockTextureAmbient],
            [1, blockTextureDiffuse],
            [2, blockTextureSpecular],
        ],
        cullFace: gl.FRONT,
        depthTest: gl.LEQUAL,
        instanceCount: maxtotalBlockCount,
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
            ), mat4.fromTranslation([0, viewHeight, viewDist]))),
        },
        textures: [],
        cullFace: gl.BACK,
        depthTest: gl.LEQUAL,
        instanceCount: playfieldCount,

    },
)

// #endregion

// #region Renderloop

let lastTime = 0;

// Set the transition time in seconds
const transitionTime = 2; // Adjust this as needed

// Variable to track the elapsed time
let elapsedTime = 0;

let isSpacePressed = false;
let animationStartTime = 0;
const spawnInterval = 100;

let firstSpawned = false;
setRenderLoop((time) => {
    //console.log(viewPan, viewTilt, viewDist)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const deltaTime = (time - lastTime) / 1000; // Convert to seconds
    lastTime = time;
    if (elapsedTime < transitionTime) updateBeginningAnimation(deltaTime)
    if (elapsedTime > transitionTime && !firstSpawned) {
        spawnNewBlock();
        firstSpawned = true;
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // if (Math.floor(time / 100 ) % 50 == 0) {
    // // console.log("blocklength:   ", blocks.length)
    //     spawnNewBlock();
    // }
    // Render all existing blocks

    updatePlayfieldInstanceAttributes();
    if (firstSpawned) updateBlockInstanceAttributes(time);
    if (currentBlock) gameField.setIndicator(currentBlock)
    rotateAnimation(time)
    //console.log(blockABO.attributes.set("a_pos", [0, 1, 5]))
    viewRotationMatrix.setDirty();

    glance.performDrawCall(gl, skyDrawCall, time);
    glance.performDrawCall(gl, blockDrawCall, time)
    glance.performDrawCall(gl, playfieldDrawCall, time);
});

let currentLevel = 1;
let intervalId = setInterval(moveBlockByTime, 500);

function moveBlockByTime() {
    global.addScore(1);
    console.log("current: ", currentLevel, " lines cleared: ", global.clearedLines)
    if (currentBlock && !isSpacePressed) {
        gameField.clearIndicator(currentBlock.indicatorBlock)
        if (!gameField.moveBlockDown(currentBlock)) spawnNewBlock();
        gameField.setIndicator(currentBlock)
    }
    if (currentLevel != global.level) {
        clearInterval(intervalId);
        intervalId = setInterval(moveBlockByTime, global.getLevelTime());
        currentLevel = global.level;
    }
    console.log(global.score)
}


function updateBeginningAnimation(deltaTime) {
    elapsedTime += deltaTime;

    // Calculate the interpolation factor (value between 0 and 1)
    const t = Math.min(elapsedTime / transitionTime, 1);
    //console.log(t)
    // Use linear interpolation (lerp) to update the variables
    viewDist = lerp(0, targetViewDist, t);
    viewPan = lerp(0, targetViewPan, t);
    viewTilt = lerp(0, targetViewTilt, t);
}

// #endregion

// #region Animations

function rotateAnimation(time) {
    if (isSpacePressed) {
        const animationDuration = 500; // Duration of the animation in milliseconds

        // Calculate elapsed time since the animation started
        const elapsedTime = time - animationStartTime;
        let clockwise = (firstFieldActive) ? 1 : -1;

        // Check if the animation is still in progress
        if (elapsedTime < animationDuration) {
            // Calculate the rotation angle based on elapsed time
            const rotationAngle = targetViewPan + clockwise * (elapsedTime / animationDuration) * (Math.PI / 2);

            // Update viewPan based on the rotation angle
            viewPan = rotationAngle;
        } else {
            // Animation completed, reset variables
            isSpacePressed = false;
            viewPan = targetViewPan + clockwise * Math.PI / 2;  // Set final rotation angle
            targetViewPan = viewPan;
            firstFieldActive = !firstFieldActive;
            timesPressed = (timesPressed + 1) % 4;
            // gameField.rotateField(currentBlock);
            //rotateActiveBlock();
        }
    }
}

// Linear interpolation function
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// #endregion

// #region Input

onMouseDrag((e) => {
    viewPan += e.movementX * -.01
    viewTilt += e.movementY * -.01
})

onMouseWheel((e) => {
    viewDist = Math.max(1.5, Math.min(100, viewDist * (1 + Math.sign(e.deltaY) * 0.2)))
})

let timesPressed = 0;
let enterPressed = false;
onKeyDown((e) => {
    if (e.key == "ArrowUp") {
        gameField.clearIndicator(currentBlock.indicatorBlock)
        gameField.rotateBlock(currentBlock);
    }
    if (e.key == "ArrowLeft") {
        gameField.clearIndicator(currentBlock.indicatorBlock)
        gameField.moveBlockLeft(currentBlock)
        gameField.setIndicator(currentBlock)
    }
    if (e.key == "ArrowRight") {
        gameField.clearIndicator(currentBlock.indicatorBlock)
        gameField.moveBlockRight(currentBlock)
        gameField.setIndicator(currentBlock)
    }
    if (e.key == "ArrowDown") {
        gameField.clearIndicator(currentBlock.indicatorBlock)
        gameField.moveBlockDown(currentBlock)
        gameField.setIndicator(currentBlock)
        global.addScore(5);
    }
    if (e.key == " ") {
        if (!isSpacePressed && gameField.rotationPossible(currentBlock)) {
            gameField.clearIndicator(currentBlock.indicatorBlock)
            gameField.rotateField(currentBlock);
            gameField.setIndicator(currentBlock)
            animationStartTime = e.timeStamp;
            isSpacePressed = true;
        }
    }
    if (e.key == "Enter") {
        gameField.moveBlockDownFast(currentBlock)
        spawnNewBlock();

    }
    if (e.key == "r") {  // debug button
        //rPressed = true;
        console.log(gameField._boards)
        //moveBlocksDown([[-1, -1, -1], [4]]);
    }
    // "Cheat key"
    if (e.key == "s") {
        global.addClearedLines(1)
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

// #endregion