import * as shapes from './shapes.js'

let spawn = [4, 0, 0]

export class Block {
    constructor(rotations, blockIndex, type) {

        this._rotations = JSON.parse(JSON.stringify(rotations));
        this._blockIndex = blockIndex;
        this._location = JSON.parse(JSON.stringify(spawn));
        this._rotationIndex = 0;
        this._visualPosition = [0, 0, 0];
        this._timesPressed;
        this._timesRotated;
        this._indicatorBlock;
        this._type = type;
        if (this._type == 2) {
            for (let z = 0; z < this._rotations.length; z++) {
                for (let y = 0; y < this._rotations[z].length; y++) {
                    for (let x = 0; x < this._rotations[z][y].length; x++) {
                        if (this._rotations[z][y][x] != -1) this._rotations[z][y][x] = type;
                    }
                }
            }
        }
        this._activeShape = this._rotations[0];
        this._color = this.setColor();
    }

    setColor() {
        switch (this._blockIndex) {
            case 0:
                return [0.89, 0.482, 0]
            case 1:
                return [0.749, 0.051, 0.024]
            case 2:
                return [0.404, 0.89, 0]
            case 3:
                return [0.067, 0.502, 0.071]
            case 4:
                return [0, 0.49, 0.89]
            case 5:
                return [0.137, 0, 0.89]
            case 6:
                return [0.741, 0, 0.494]

        }
    }

    get color() {
        return this._color;
    }

    get rotationIndex() {
        return this._rotationIndex;
    }

    get blockIndex() {
        return this._blockIndex;
    }

    get activeShape() {
        return this._activeShape;
    }

    get location() {
        return this._location;
    }

    get startIndex() {
        return this._startIndex;
    }

    get rotations() {
        return this._rotations;
    }

    get visualPosition() {
        return this._visualPosition;
    }

    get timesPressed() {
        return this._timesPressed;
    }

    get timesRotated() {
        return this._timesRotated;
    }

    get indicatorBlock() {
        return this._indicatorBlock;
    }

    set setVisualPosition(value) {
        for (let i = 1; i <= value; i++) {
            if (this._visualPosition[1] != -12) this._visualPosition[1] -= i;
        }
    }

    set setLocation(value) {
        this._location = value;
    }

    set rotationIndex(value) {
        this._rotationIndex = value;
    }

    set activeShape(value) {
        this._activeShape = value;
    }

    setIndicator(value) {
        this._indicatorBlock = value;
    }

    rotate() {
        this._rotationIndex = (this._rotationIndex + 1) % this._rotations.length
        this._activeShape = this._rotations[this._rotationIndex]

        if (this._indicatorBlock != undefined) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
            this._indicatorBlock.rotationIndex = (this._rotationIndex + 1) % this._rotations.length
            this._indicatorBlock.activeShape = this._indicatorBlock.rotations[this._rotationIndex];
        }
    }

    moveUp() {
        this._location[1]--;
        if (this._indicatorBlock) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
        }
    }

    moveDown() {
        this._location[1]++;
        if (this._indicatorBlock) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
        }
    }

    moveLeft() {
        this._location[0]--;
        if (this._indicatorBlock) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
        }
    }

    moveRight() {
        this._location[0]++;
        if (this._indicatorBlock) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
        }
    }

    changeField() {
        spawn[2] = (this._location[2] + 1) % 2;
        this._location[2] = (this._location[2] + 1) % 2
        if (this._indicatorBlock) {
            this._indicatorBlock.setLocation(JSON.parse(JSON.stringify(this._location)));
        }
    }

    setVisualValues(visualPosition, timesPressed, timesRotated) {
        this._visualPosition = visualPosition;
        this._timesPressed = timesPressed;
        this._timesRotated = timesRotated;
    }

    getNextRotation(idx) {
        return this._rotations[(idx + 1) % this._rotations.length];
    }

    setLocation(value) {
        this._location = value;
    }
}

export function createBlock(blockIndex, type) {
    switch (blockIndex) {
        case 0:
            return new Block(shapes.shape_z_rotations, 0, type);
        case 1:
            return new Block(shapes.shape_s_rotations, 1, type);
        case 2:
            return new Block(shapes.shape_l_rotations, 2, type);
        case 3:
            return new Block(shapes.shape_rev_l_rotations, 3, type);
        case 4:
            return new Block(shapes.shape_2x2_rotations, 4, type);
        case 5:
            return new Block(shapes.shape_t_rotations, 5, type);
        case 6:
            return new Block(shapes.shape_4x1_rotations, 6, type);
    }
}

//placeBlockOnMatrix(0, 0)