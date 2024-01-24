i want to create an instanced shader, where i can have different types of tetris block loaded.
here is the method for creating the attributes and indices of one tetris block:
```
function createTetrisBlock(shape) {
    let attributes = []
    let indices = []
    let counter = 0;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            let x = 0 + (1 * col);
            let y = 1 - (1 * row);
            if (shape[row][col] == 1) {

                // Cube corners / vertices
                const vertices = [
                    // Left Face
                    x, y - 1, 0.0, -1, 0, 0, 1, 1,  // 0
                    x, y, 0.0, -1, 0, 0, 1, 0,
                    x, y - 1, -1, -1, 0, 0, 0, 1,
                    x, y, -1, -1, 0, 0, 0, 0,

                    // Front Face
                    x, y - 1, 0.0, 0, 0, 1, 0, 1,  // 4
                    x + 1, y - 1, 0.0, 0, 0, 1, 1, 1,
                    x, y, 0.0, 0, 0, 1, 0, 0,
                    x + 1, y, 0.0, 0, 0, 1, 1, 0,

                    // Right Face
                    x + 1, y - 1, 0.0, 1, 0, 0, 1, 1,  // 8
                    x + 1, y - 1, -1, 1, 0, 0, 0, 1,
                    x + 1, y, 0.0, 1, 0, 0, 1, 0,
                    x + 1, y, -1, 1, 0, 0, 0, 0,

                    // Back Face
                    x, y - 1, -1, 0, 0, -1, 0, 0,  // 12
                    x + 1, y - 1, -1, 0, 0, -1, 0, 1,
                    x, y, -1, 0, 0, -1, 1, 0,
                    x + 1, y, -1, 0, 0, -1, 1, 1,

                    // Top Face
                    x, y, 0.0, 0, 1, 0, 0, 1,  // 16
                    x, y, -1, 0, 1, 0, 0, 0,
                    x + 1, y, 0.0, 0, 1, 0, 1, 1,
                    x + 1, y, -1, 0, 1, 0, 1, 0,

                    // Bottom Face
                    x, y - 1, 0.0, 0, -1, 0, 0, 0,  // 20
                    x, y - 1, -1, 0, -1, 0, 0, 1,
                    x + 1, y - 1, 0.0, 0, -1, 0, 1, 0,
                    x + 1, y - 1, -1, 0, -1, 0, 1, 1,
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
```
and here is the code for generating the shader:
```
const shape = [
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0]
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

const blockCount = 1;

const blockInstanceAttributes = new Float32Array(blockCount * 26); // 16 + 9 + 1
const blockIABO = glance.createAttributeBuffer(gl, "block-iabo", blockInstanceAttributes, {
    a_modelMatrix: { size: 4, width: 4, type: gl.FLOAT, divisor: 1 },
    a_normalMatrix: { size: 3, width: 3, type: gl.FLOAT, divisor: 1 },
    a_alpha: { size: 1, width: 1, type: gl.FLOAT, divisor: 1 }
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
```
i want to create different shapes, how do i initialize a set random amount of blocks inside the blockShader?