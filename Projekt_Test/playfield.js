export class Playfield {
    constructor() {
        this._boards = [[], []]
        // Playfield is 11x12, but to add a spawning area it gets extendet to be 15 blocks tall.
        // Also fill with -1, as block indices start at 0.
        for (let i = 0; i < 18; i++) {
            this._boards[0].push([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
            this._boards[1].push([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
        }
    }

    placeBlock(block, debug) {
        let pos = block.location
        if (debug) console.log(block)
        for (let y = 0; y < block.activeShape.length; y++) {
            for (let x = 0; x < block.activeShape[y].length; x++) {
                if (block.activeShape[y][x] != -1) {
                    this._boards[pos[2]][y + pos[1]][x + pos[0]] = block.activeShape[y][x];
                }
            }
        }
    }

    placeIndicator(block) {
        let pos = block.location
        for (let y = 0; y < block.activeShape.length; y++) {
            for (let x = 0; x < block.activeShape[y].length; x++) {
                if (block.activeShape[y][x] != -1 && this._boards[pos[2]][y + pos[1]][x + pos[0]] != 1) {
                    this._boards[pos[2]][y + pos[1]][x + pos[0]] = block.activeShape[y][x];
                }
            }
        }
    }

    moveBlockLeft(block) {
        let shape = block.activeShape;
        let pos = block.location;
        this.clearBlock(block);
        let bound = this.getLeftBounding(block.activeShape);

        for (let i = 0; i < bound.length; i++) {
            if (bound[i] != -1) {
                if (pos[0] + bound[i] - 1 < 0) {
                    this.placeBlock(block);
                    return false;
                }
                if (this._boards[pos[2]][pos[1] + i][pos[0] + bound[i] - 1] != -1 &&
                    this._boards[pos[2]][pos[1] + i][pos[0] + bound[i] + 1] != 2) {
                    this.placeBlock(block);
                    return false;
                }
            }
        }

        block.moveLeft();
        this.setIndicator(block);
        this.placeBlock(block);
        return true;
    }

    moveBlockRight(block) {
        let shape = block.activeShape;
        let pos = block.location;

        let bound = this.getRightBounding(block.activeShape);

        for (let i = 0; i < bound.length; i++) {
            if (bound[i] != -1) {
                if (pos[0] + bound[i] + 1 > 11) {
                    return false;
                }
                if (this._boards[pos[2]][pos[1] + i][pos[0] + bound[i] + 1] != -1 &&
                    this._boards[pos[2]][pos[1] + i][pos[0] + bound[i] + 1] != 2) {
                    return false;
                }
            }
        }
        this.clearBlock(block)
        block.moveRight();
        this.placeBlock(block);
        return true;
    }

    moveBlockDown(block, debug) {
        let shape = block.activeShape;
        let pos = block.location;

        let bound = this.getBottomBounding(block.activeShape)

        for (let i = 0; i < bound.length; i++) {
            if (bound[i] != -1) {
                if (pos[1] + bound[i] + 1 > 17) {
                    return false;
                }
                if (this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != -1 &&
                    this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != 2) {
                    return false;
                }
            }
        }

        this.clearBlock(block)
        block.moveDown();
        if (debug) console.log(block.location)
        this.placeBlock(block, debug);
        return true;
    }

    moveBlockDownFast(block) {
        
        let pos = block.location;
        let bound = this.getBottomBounding(block.activeShape)
        let finished = false;
        this.clearBlock(block)
        while (!finished) {
            for (let i = 0; i < bound.length; i++) {
                if (bound[i] != -1) {
                    if (pos[1] + bound[i] + 1 > 17) {
                        finished = true;
                        block.moveUp();
                        break;
                    }
                    if (this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != -1 &&
                        this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != 2) {
                        finished = true;
                        block.moveUp();
                        break;
                    }
                }
            }
            block.moveDown();
        }
        this.placeBlock(block, true);
        return true;
    }

    moveIndicatorDown(block) {
        let shape = block.activeShape;
        let pos = block.location;

        let bound = this.getBottomBounding(block.activeShape, false)

        for (let i = 0; i < bound.length; i++) {
            if (bound[i] != -1) {
                if (pos[1] + bound[i] + 1 > 17) {
                    return false;
                }
                if (this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != -1 &&
                    this._boards[pos[2]][pos[1] + bound[i] + 1][pos[0] + i] != 2) {
                    return false;
                }
            }
        }
        this.clearIndicator(block)
        block.moveDown();
        this.placeIndicator(block);
        return true;
    }

    clearBlock(block) {
        let shape = block.activeShape;
        let pos = block.location;
        // Clear the current position of the shape on the grid
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] != -1 && (pos[0] + x < 11 || pos[0] + x >= 0) && pos[1] + y < 18) {
                    this._boards[pos[2]][pos[1] + y][pos[0] + x] = -1;
                }
            }
        }
    }

    clearIndicator(block) {
        let shape = block.activeShape;
        let pos = block.location;
        // Clear the current position of the shape on the grid
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] != -1 && (pos[0] + x < 11 || pos[0] + x >= 0) && pos[1] + y < 18 && this._boards[pos[2]][pos[1] + y][pos[0] + x] != 1) {
                    this._boards[pos[2]][pos[1] + y][pos[0] + x] = -1;
                }
            }
        }
    }

    rotateBlock(block, debug) {
        this.clearBlock(block);
        let nextShape = block.getNextRotation(block.rotationIndex)
        //block.rotate();
        let pos = block.location;
        let counter = [0, 0]

        let rightBound = this.getRightBounding(nextShape);
        let leftBound = this.getLeftBounding(nextShape);
        for (let i = 0; i < rightBound.length; i++) {
            if (rightBound[i] != -1) {
                if (pos[0] + rightBound[i] + 1 > 11) {
                    while (pos[0] + rightBound[i] + 1 > 11) {
                        counter[0]++;
                        pos[0]--;
                    }
                } else if (pos[0] + leftBound[i] < 0) {
                    while (pos[0] + leftBound[i] < 0) {
                        counter[1]++;
                        pos[0]++;
                    }
                }
            }
        }

        if (this.isFree(nextShape, [pos[0] - counter[0] + counter[1], pos[1], pos[2]])) {
            block.setLocation(pos);
            block.rotate();
        }
        this.placeBlock(block, debug);
    }

    isFree(shape, pos) {
        for (let y = shape.length - 1; y >= 0; y--) {
            for (let x = 0; x < shape[0].length; x++) {
                if (pos[1] + y > 17 || pos[0] + x > 17 || pos[0] + x < 0) {
                    return false;
                }
                let value = this._boards[pos[2]][pos[1] + y][pos[0] + x];
                if (shape[y][x] != -1 && value != -1 && value != 2) return false;
            }
        }
        return true;
    }

    getLeftBounding(shape, debug) {
        let bound = Array(shape.length).fill(0)
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[0].length; x++) {
                if (shape[y][x] != -1) {
                    bound[y] = x;
                    break;
                }
                if (x == shape[0].length - 1) {
                    bound[y] = -1;
                }
            }
        }
        if (debug) console.log("CALCULATED LEFT BOUND: ", bound)
        return bound;
    }

    getRightBounding(shape, debug) {
        let bound = [0, 0]
        for (let y = 0; y < shape.length; y++) {
            for (let x = shape[0].length - 1; x >= 0; x--) {
                if (shape[y][x] != -1) {
                    bound[y] = x;
                    break;
                }
                if (x == 0) {
                    bound[y] = -1;
                }
            }
        }
        if (debug) console.log("CALCULATED RIGHT BOUND: ", bound)
        return bound;
    }

    getBottomBounding(shape, debug) {
        let bound = [0, 0]
        for (let x = 0; x < shape[0].length; x++) {
            for (let y = shape.length - 1; y >= 0; y--) {
                if (shape[y][x] != -1) {
                    bound[x] = y;
                    break;
                }
                if (y == 0) {
                    bound[x] = -1;
                }
            }
        }
        if (debug) console.log("CALCULATED BOT BOUND: ", bound)
        return bound;
    }

    setIndicator(block) {
        //this.clearIndicator(block.indicatorBlock)

        while (this.moveIndicatorDown(block.indicatorBlock)) { }
        this.placeIndicator(block.indicatorBlock);
    }

    rotateField(block) {
        this.clearBlock(block)
        let boardIdx = block.location[2];

        let pos = JSON.parse(JSON.stringify(block.location));
        pos[2] = (boardIdx + 1) % 2;
        if (this.isFree(block.activeShape, pos)) {
            this.applyIntersection(boardIdx, (boardIdx + 1) % 2);
            block.changeField();
            this.placeBlock(block);
            return true;
        }
        this.placeBlock(block);
        return false;
    }

    rotationPossible(block) {
        let boardIdx = block.location[2];
        let pos = JSON.parse(JSON.stringify(block.location));
        pos[2] = (boardIdx + 1) % 2;
        return (this.isFree(block.activeShape, pos))
    }

    applyIntersection(from, to) {
        for (let y = 0; y < this._boards[0].length; y++) {
            this._boards[to][y][5] = this._boards[from][y][5];
        }
    }

    mirrorBoard1(block) {
        this.clearBlock(block)
        for (let i = 0; i < this._boards[0].length; i++) {
            this._boards[0][i].reverse();
        }
        this.placeBlock(block)
    }

    mirrorBoard2(block) {
        this.clearBlock(block)
        for (let i = 0; i < this._boards[0].length; i++) {
            this._boards[1][i].reverse();
        }
        this.placeBlock(block)
    }

    clear() {
        let clearedLines = 0;
        for (let j = 0; j < this._boards[0].length; j++) {
            if (!this._boards[0][j].includes(-1) && !this._boards[1][j].includes(-1)) {
                clearedLines++;
                this._boards[0].splice(j, 1);
                this._boards[1].splice(j, 1);
                this._boards[0].unshift([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1])
                this._boards[1].unshift([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1])
            }
        }
        return clearedLines;
    }
}
