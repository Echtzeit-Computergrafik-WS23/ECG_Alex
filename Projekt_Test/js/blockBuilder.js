export {createTetrisBlock, createUnitBoxAttributes, createUnitBoxIndices}

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
