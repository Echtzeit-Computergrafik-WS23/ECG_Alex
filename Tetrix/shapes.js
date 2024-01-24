export const shape_z = [  // 0
    [-1, -1, -1],
    [1, 1, -1],
    [-1, 1, 1],
]

export const shape_s = [  // 1
    [-1, -1, -1],
    [-1, 1, 1],
    [1, 1, -1],
]

export const shape_l = [  // 1
    [-1, -1, -1],
    [1, 1, 1],
    [1, -1, -1],
]

export const shape_rev_l = [  // 1
    [-1, -1, -1],
    [1, 1, 1],
    [-1, -1, 1],
]

export const shape_2x2 = [  // 1
    [-1, -1],
    [1, 1],
    [1, 1],
]

export const shape_t = [  // 5
    [-1, -1, -1],
    [1, 1, 1],
    [-1, 1, -1],
]

export const shape_4x1 = [  // 6
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [1, 1, 1, 1],
    [-1, -1, -1, -1]
]

// ROTATED SHAPES

export const shape_z_rotated = [
    [-1, -1, 1],
    [-1, 1, 1],
    [-1, 1, -1],
]

export const shape_s_rotated = [
    [-1, 1, -1],
    [-1, 1, 1],
    [-1, -1, 1],
]

export const shape_l_rotated1 = [
    [-1, 1, -1],
    [-1, 1, -1],
    [-1, 1, 1],
]

export const shape_l_rotated2 = [
    [-1, -1, 1],
    [1, 1, 1],
    [-1, -1, -1],
]

export const shape_l_rotated3 = [
    [1, 1],
    [-1, 1],
    [-1, 1],
]

export const shape_rev_l_rotated1 = [
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, 1, -1],
]

export const shape_rev_l_rotated2 = [
    [1, -1, -1],
    [1, 1, 1],
    [-1, -1, -1],
]

export const shape_rev_l_rotated3 = [
    [-1, 1],
    [-1, 1],
    [1, 1],
]

export const shape_t_rotated1 = [
    [-1, 1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
]

export const shape_t_rotated2 = [
    [-1, 1, -1],
    [1, 1, 1],
    [-1, -1, -1],
]

export const shape_t_rotated3 = [
    [-1, 1, -1],
    [1, 1, -1],
    [-1, 1, -1],
]

export const shape_4x1_rotated1 = [
    [-1, 1],
    [-1, 1],
    [-1, 1],
    [-1, 1],
]

export const shape_z_rotations = [
    shape_z,
    shape_z_rotated
]

export const shape_s_rotations = [
    shape_s,
    shape_s_rotated
]

export const shape_l_rotations = [
    shape_l,
    shape_l_rotated1,
    shape_l_rotated2,
    shape_l_rotated3,
]

export const shape_rev_l_rotations = [
    shape_rev_l,
    shape_rev_l_rotated1,
    shape_rev_l_rotated2,
    shape_rev_l_rotated3,
]

export const shape_2x2_rotations = [
    shape_2x2
]

export const shape_t_rotations = [
    shape_t,
    shape_t_rotated1,
    shape_t_rotated2,
    shape_t_rotated3,
]

export const shape_4x1_rotations = [
    shape_4x1,
    shape_4x1_rotated1,
]