"use strict";
//BlockとBlockManager
/**
 * 仮想的にマインスイーパーのブロックを扱う
 */
class Block {
    element = document.createElement("div");
    /**
     * blockの内部的な表示状態
     * 実際に反映させるにはpaintする必要がある
     */
    visible = false;
    /**
     * blockの内部的な数字
     * 実際に反映させるにはpaintする必要がある
     */
    number = null;
    /**
     * blockの種類
     * 実際に反映させるにはpaintする必要がある
     */
    kind = -1;
    displayVisible = false;
    displayNumber = null;
    displayKind = -1;
    constructor() {
        this.element.classList.add("block");
        this.element.dataset.visible = "false";
    }
    /**
     * このBlockが管理するHTML要素
     */
    get g$element() {
        return this.element;
    }
    /**
     * elementの描画を行う
     * 変更がない場合はなるべく何もしない
     */
    paint() {
        if (this.visible != this.displayVisible) {
            this.element.dataset.visible = this.visible ? "true" : "false";
        }
        if (this.number != this.displayNumber) {
            if (this.number == null) {
                this.element.textContent = "";
            }
            else {
                this.element.textContent = this.number + "";
            }
        }
        if (this.kind != this.displayKind) {
            this.element.dataset.kind = this.kind + "";
        }
        this.displayVisible = this.visible;
        this.displayNumber = this.number;
        this.displayKind = this.kind;
    }
}
/**
 * tetrominoの形を表す
 * [kind][direction][ブロックのindex]でそのブロックの相対座標[x,y]を表す
 */
//prettier-ignore
const tetrominoShape = [
    [
        [[0, 0], [-1, -1], [0, -1], [1, 0]],
        [[0, 0], [1, -1], [1, 0], [0, 1]],
        [[0, 0], [1, 1], [0, 1], [-1, 0]],
        [[0, 0], [-1, 1], [-1, 0], [0, -1]],
    ],
    [
        [[0, 0], [0, -1], [1, -1], [-1, 0]],
        [[0, 0], [1, 0], [1, 1], [0, -1]],
        [[0, 0], [0, 1], [-1, 1], [1, 0]],
        [[0, 0], [-1, 0], [-1, -1], [0, 1]],
    ],
    [
        [[0, 0], [-1, -1], [-1, 0], [1, 0]],
        [[0, 0], [1, -1], [0, -1], [0, 1]],
        [[0, 0], [1, 1], [1, 0], [-1, 0]],
        [[0, 0], [-1, 1], [0, 1], [0, -1]],
    ],
    [
        [[0, 0], [1, -1], [-1, 0], [1, 0]],
        [[0, 0], [1, 1], [0, -1], [0, 1]],
        [[0, 0], [-1, 1], [1, 0], [-1, 0]],
        [[0, 0], [-1, -1], [0, -1], [0, 1]],
    ],
    [
        [[0, 0], [0, -1], [-1, 0], [1, 0]],
        [[0, 0], [1, 0], [0, -1], [0, 1]],
        [[0, 0], [0, 1], [1, 0], [-1, 0]],
        [[0, 0], [-1, 0], [0, 1], [0, -1]],
    ],
    [
        [[0, 0], [0, -1], [1, -1], [1, 0]],
        [[0, 0], [1, 0], [1, 1], [0, 1]],
        [[0, 0], [0, 1], [-1, 1], [-1, 0]],
        [[0, 0], [-1, 0], [-1, -1], [0, -1]],
    ],
    [
        [[0, 0], [-1, 0], [1, 0], [2, 0]],
        [[0, 0], [0, -1], [0, 1], [0, 2]],
        [[0, 0], [1, 0], [-1, 0], [-2, 0]],
        [[0, 0], [0, 1], [0, -1], [0, -2]],
    ],
];
// SRS
// [ミノの種類(0~6)][ミノの回転状態(0~3)][ミノの回転方向(0~1)][補正index][x, y]
// ミノの種類: ZSJLTOI (0:Z, 1:S, 2:J, 3:L, 4:T, 5:O, 6:I)
// 回転方向: 0=右回転, 1=左回転
//prettier-ignore
const placeCorrection = [
    // Z
    [
        // 右回転
        [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ],
        //左回転
        [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ]
    ],
    // S
    [
        [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ],
        [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ]
    ],
    // J
    [
        [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ],
        [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ]
    ],
    // L
    [
        [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ],
        [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ]
    ],
    // T
    [
        [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ],
        [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        ]
    ],
    // O
    [
        [
            [[0, -1]],
            [[1, 0]],
            [[0, 1]],
            [[-1, 0]],
        ],
        [
            [[1, 0]],
            [[0, 1]],
            [[-1, 0]],
            [[0, -1]],
        ]
    ],
    // I
    [
        [
            [[1, 0], [-1, 0], [2, 0], [-1, 1], [2, -2]], // 0->R
            [[0, 1], [-1, 1], [2, 1], [-2, 1], [2, 2]], // R->2
            [[-1, 0], [1, 0], [-2, 0], [1, -1], [-2, 2]], // 2->L
            [[0, -1], [-2, -1], [1, -1], [1, 1], [-2, -2]], // L->0
        ],
        [
            [[0, 1], [-1, 1], [2, 1], [-1, -1], [2, 2]], // 0->L
            [[-1, 0], [1, 0], [-2, 0], [1, -1], [-2, 2]], // R->0
            [[0, -1], [1, -1], [-2, -1], [1, 1], [-2, -2]], // 2->R
            [[1, 0], [2, 0], [-1, 0], [-1, 1], [2, -2]], // L->2
        ]
    ],
];
class Tetromino {
    /**
     * Tetrominoの中心のx座標
     */
    x = 0;
    /**
     * Tetrominoの中心のy座標
     */
    y = 0;
    /**
     * Tetrominoの種類
     */
    kind = 0;
    /**
     * Tetrominoの向き
     */
    direction = 0;
    /**
     * Tetrominoの表示状態
     */
    visible = false;
    /**
     * 各ブロックの数字
     */
    numbers = [null, null, null, null];
    /**
     * @returns 各ブロックの座標の配列
     */
    getBlockCoordinates() {
        let coordinates = [];
        for (let i = 0; i < 4; i++) {
            coordinates.push([this.x + tetrominoShape[this.kind][this.direction][i][0], this.y + tetrominoShape[this.kind][this.direction][i][1]]);
        }
        return coordinates;
    }
    get g$kind() {
        return this.kind;
    }
    get g$direction() {
        return this.direction;
    }
    get g$numbers() {
        return structuredClone(this.numbers);
    }
    get g$visible() {
        return this.visible;
    }
    get g$x() {
        return this.x;
    }
    get g$y() {
        return this.y;
    }
    set s$x(x) {
        if (this.visible || !Number.isSafeInteger(x)) {
            return;
        }
        this.x = x;
    }
    set s$y(y) {
        if (this.visible || !Number.isSafeInteger(y)) {
            return;
        }
        this.y = y;
    }
    setLocation(x, y) {
        if (this.visible || !Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
            return;
        }
        this.x = x;
        this.y = y;
    }
    move(dx, dy) {
        this.setLocation(this.x + dx, this.y + dy);
    }
    spin(dd) {
        this.s$direction = this.direction + dd;
    }
    set s$numbers(numbers) {
        if (this.visible) {
            return;
        }
        this.numbers = numbers;
    }
    set s$visible(visible) {
        this.visible = visible;
    }
    set s$direction(direction) {
        if (this.visible || !Number.isSafeInteger(direction)) {
            return;
        }
        this.direction = ((direction % 4) + 4) % 4;
    }
    set s$kind(kind) {
        if (this.visible || !Number.isSafeInteger(kind)) {
            return;
        }
        this.kind = ((kind % 7) + 7) % 7;
    }
}
/**
 * Blockからなる盤面を統括する
 */
class BlockManager {
    element = document.createElement("div");
    blocks = [];
    width;
    height;
    /**
     * @param width 盤面の横幅　正の整数
     * @param height 盤面の縦幅　正の整数
     */
    constructor(width, height) {
        this.element.classList.add("blockBase");
        if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
            throw new Error("width、heightに不正な値が入力されました");
        }
        this.width = width;
        this.height = height;
        this.element.style.gridTemplateColumns = `repeat(${this.width}, ${90 / this.height}vh)`;
        this.element.style.gridTemplateRows = `repeat(${this.height}, ${90 / this.height}vh)`;
        this.blocks = new Array(this.width);
        for (let w = 0; w < this.width; w++) {
            this.blocks[w] = new Array(this.height);
            for (let h = 0; h < this.height; h++) {
                this.blocks[w][h] = new Block();
            }
        }
        for (let h = 0; h < this.height; h++) {
            for (let w = 0; w < this.width; w++) {
                this.element.appendChild(this.blocks[w][h].g$element);
            }
        }
    }
    /**
     * このBlockManagerが管理する盤面のHTML要素
     */
    get g$element() {
        return this.element;
    }
    get g$height() {
        return this.height;
    }
    get g$width() {
        return this.width;
    }
    /**
     * @param tetromino 表示できるかどうかを確かめる状態を持ったtetromino
     * @returns 表示できるか
     */
    canDisplay(tetromino) {
        let result = true;
        tetromino.getBlockCoordinates().forEach((coordinate) => {
            result = result && this.canDisplayBlock(...coordinate);
        });
        return result;
    }
    /**
     * @param x x座標
     * @param y y座標
     * @returns 指定した座標に表示できるか
     */
    canDisplayBlock(x, y) {
        if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y) || x < 0 || y < 0 || this.width <= x || this.height <= y) {
            return false;
        }
        if (this.blocks[x][y].visible) {
            return false;
        }
        return true;
    }
    /**
     * まだ表示されていないtetrominoを表示する　すでに表示されている場合は何もしない
     * @param tetromino 表示させるtetromino
     */
    displayMino(tetromino) {
        if (tetromino.g$visible) {
            return;
        }
        if (this.canDisplay(tetromino)) {
            tetromino.s$visible = true;
            const numbers = tetromino.g$numbers;
            tetromino.getBlockCoordinates().forEach((coordinate, i) => {
                this.blocks[coordinate[0]][coordinate[1]].number = numbers[i];
                this.blocks[coordinate[0]][coordinate[1]].visible = true;
                this.blocks[coordinate[0]][coordinate[1]].kind = tetromino.g$kind;
            });
        }
    }
    /**
     * すでに表示されているtetrominoを非表示にする　すでに表示されていない場合は何もしない
     * @param tetromino
     */
    removeMino(tetromino) {
        if (!tetromino.g$visible) {
            return;
        }
        tetromino.s$visible = false;
        tetromino.getBlockCoordinates().forEach((coordinate) => {
            this.blocks[coordinate[0]][coordinate[1]].visible = false;
        });
    }
    /**
     * @param tetromino 移動させるtetromino
     * @param dx 相対移動のx成分
     * @param dy 相対移動のy成分
     */
    moveMino(tetromino, dx, dy) {
        if (!tetromino.g$visible) {
            return;
        }
        this.removeMino(tetromino);
        tetromino.move(dx, dy);
        if (!this.canDisplay(tetromino)) {
            tetromino.move(-dx, -dy);
        }
        this.displayMino(tetromino);
        this.paint();
    }
    /**
     * @param tetromino 回転させるtetromino
     * @param dd 相対回転
     */
    spinMino(tetromino, dd) {
        if (!tetromino.g$visible) {
            return;
        }
        const direction = tetromino.g$direction;
        const rightRotation = dd == 1 ? 0 : 1;
        const correction = placeCorrection[tetromino.g$kind][rightRotation][direction];
        let spinSuccess = false;
        this.removeMino(tetromino);
        tetromino.spin(dd);
        for (let i = 0; i < correction.length; i++) {
            tetromino.move(correction[i][0], correction[i][1]);
            if (this.canDisplay(tetromino)) {
                spinSuccess = true;
                break;
            }
            else {
                tetromino.move(-correction[i][0], -correction[i][1]);
            }
        }
        if (!spinSuccess) {
            tetromino.spin(-dd);
        }
        this.displayMino(tetromino);
        this.paint();
    }
    shiftBlock([fromX, fromY], [toX, toY]) {
        this.blocks[toX][toY].visible = this.blocks[fromX][fromY].visible;
        this.blocks[toX][toY].kind = this.blocks[fromX][fromY].kind;
        this.blocks[toX][toY].number = this.blocks[fromX][fromY].number;
        this.blocks[fromX][fromY].visible = false;
    }
    lineIsFilled(height) {
        for (let w = 0; w < this.width; w++) {
            if (!this.blocks[w][height].visible) {
                return false;
            }
        }
        return true;
    }
    shiftLine(height) {
        for (let h = height; h > 0; h--) {
            for (let w = 0; w < this.width; w++) {
                this.shiftBlock([w, h - 1], [w, h]);
            }
        }
        for (let w = 0; w < this.width; w++) {
            this.blocks[w][0].visible = false;
        }
    }
    removeLines() {
        let removeCount = 0;
        for (let h = this.height - 1; h >= 0; h--) {
            if (this.lineIsFilled(h)) {
                this.shiftLine(h);
                h++;
                removeCount++;
            }
        }
        this.paint();
        return removeCount;
    }
    frameIsFilled(depth) {
        const oldBorder = Math.floor(this.width / 2) + depth;
        if (this.width <= oldBorder) {
            return;
        }
        const youngBorder = this.width - oldBorder - 1;
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if ((((w == youngBorder || w == oldBorder) && youngBorder <= h && h <= oldBorder) || ((h == youngBorder || h == oldBorder) && youngBorder <= w && w <= oldBorder)) &&
                    !this.blocks[w][h].visible) {
                    return false;
                }
            }
        }
        return true;
    }
    removeFrame(depth) {
        const oldBorder = Math.floor(this.width / 2) + depth;
        if (this.width <= oldBorder) {
            return;
        }
        const youngBorder = this.width - oldBorder - 1;
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (((w == youngBorder || w == oldBorder) && youngBorder <= h && h <= oldBorder) || ((h == youngBorder || h == oldBorder) && youngBorder <= w && w <= oldBorder)) {
                    this.blocks[w][h].visible = false;
                }
            }
        }
    }
    shiftFrame(depth) {
        const oldBorder = Math.floor(this.width / 2) + depth;
        if (this.width <= oldBorder || depth <= 0) {
            return;
        }
        const youngBorder = this.width - oldBorder - 1;
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (w == youngBorder + 1 && youngBorder + 1 <= h && h < oldBorder - 1) {
                    this.shiftBlock([w, h], [w - 1, h - 1]);
                }
                if (youngBorder + 1 <= w && w < oldBorder - 1 && h == oldBorder - 1) {
                    this.shiftBlock([w, h], [w - 1, h + 1]);
                }
                if (w == oldBorder - 1 && youngBorder + 1 < h && h <= oldBorder - 1) {
                    this.shiftBlock([w, h], [w + 1, h + 1]);
                }
                if (youngBorder + 1 < w && w <= oldBorder - 1 && h == youngBorder + 1) {
                    this.shiftBlock([w, h], [w + 1, h - 1]);
                }
            }
        }
        if (this.blocks[youngBorder + 1][youngBorder].visible && this.blocks[youngBorder][youngBorder + 1].visible) {
            this.blocks[youngBorder][youngBorder].visible = true;
        }
        if (this.blocks[youngBorder + 1][oldBorder].visible && this.blocks[youngBorder][oldBorder - 1].visible) {
            this.blocks[youngBorder][oldBorder].visible = true;
        }
        if (this.blocks[oldBorder - 1][youngBorder].visible && this.blocks[oldBorder][youngBorder + 1].visible) {
            this.blocks[oldBorder][youngBorder].visible = true;
        }
        if (this.blocks[oldBorder - 1][oldBorder].visible && this.blocks[oldBorder - 1][oldBorder].visible) {
            this.blocks[oldBorder][oldBorder].visible = true;
        }
        this.shiftFrame(depth - 1);
    }
    removeFrames() {
        let removeCount = 0;
        for (let d = 0; d < Math.floor(this.width / 2); d++) {
            if (this.frameIsFilled(d)) {
                this.shiftFrame(d);
                d--;
                removeCount++;
            }
        }
        this.paint();
        return removeCount;
    }
    /**
     * すべてのblockの描画を行う
     */
    paint() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                this.blocks[w][h].paint();
            }
        }
    }
}
