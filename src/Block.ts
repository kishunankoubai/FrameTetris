//BlockとBlockManager

/**
 * 仮想的にマインスイーパーのブロックを扱う
 */
class Block {
    private element: HTMLDivElement = document.createElement("div");
    /**
     * blockの内部的な表示状態
     * 実際に反映させるにはpaintする必要がある
     */
    visible: boolean = false;
    /**
     * blockの内部的な数字
     * 実際に反映させるにはpaintする必要がある
     */
    number: number | null = null;
    /**
     * blockの種類
     * 実際に反映させるにはpaintする必要がある
     */
    kind: number = -1;
    private displayVisible: boolean = false;
    private displayNumber: number | null = null;
    private displayKind: number = -1;
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
    paint(): void {
        if (this.visible != this.displayVisible) {
            this.element.dataset.visible = this.visible ? "true" : "false";
        }
        if (this.number != this.displayNumber) {
            if (this.number == null) {
                this.element.textContent = "";
            } else {
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
    [ //Z
        [[0, 0],[-1, -1],[0, -1],[1, 0]],
        [[0, 0],[1, -1],[1, 0],[0, 1]],
        [[0, 0],[1, 1],[0, 1],[-1, 0]],
        [[0, 0],[-1, 1],[-1, 0],[0, -1]],
    ],
    [ //S
        [[0, 0],[0, -1],[1, -1],[-1, 0]],
        [[0, 0],[1, 0],[1, 1],[0, -1]],
        [[0, 0],[0, 1],[-1, 1],[1, 0]],
        [[0, 0],[-1, 0],[-1, -1],[0, 1]],
    ],
    [ //J
        [[0, 0],[-1, -1],[-1, 0],[1, 0]],
        [[0, 0],[1, -1],[0, -1],[0, 1]],
        [[0, 0],[1, 1],[1, 0],[-1, 0]],
        [[0, 0],[-1, 1],[0, 1],[0, -1]],
    ],
    [ //L
        [[0, 0],[1, -1],[-1, 0],[1, 0]],
        [[0, 0],[1, 1],[0, -1],[0, 1]],
        [[0, 0],[-1, 1],[1, 0],[-1, 0]],
        [[0, 0],[-1, -1],[0, 1],[0, -1]],
    ],
    [ //T
        [[0, 0],[0, -1],[-1, 0],[1, 0]],
        [[0, 0],[1, 0],[0, -1],[0, 1]],
        [[0, 0],[0, 1],[1, 0],[-1, 0]],
        [[0, 0],[-1, 0],[0, 1],[0, -1]],
    ],
    [ //O
        [[0, 0],[0, -1],[1, -1],[1, 0]],
        [[0, 0],[1, 0],[1, 1],[0, 1]],
        [[0, 0],[0, 1],[-1, 1],[-1, 0]],
        [[0, 0],[-1, 0],[-1, -1],[0, -1]],
    ],
    [ //I
        [[0, 0],[-1, 0],[1, 0],[2, 0]],
        [[0, 0],[0, -1],[0, 1],[0, 2]],
        [[0, 0],[1, 0],[-1, 0],[-2, 0]],
        [[0, 0],[0, 1],[0, -1],[0, -2]],
    ],
]
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
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ],
        //左回転
        [
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ]
    ],
    // S
    [
        [
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ],
        [
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ]
    ],
    // J
    [
        [
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ],
        [
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ]
    ],
    // L
    [
        [
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ],
        [
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ]
    ],
    // T
    [
        [
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ],
        [
            [[0, 0],[1, 0],[1, -1],[0, 2],[1, 2]],
            [[0, 0],[1, 0],[1, 1],[0, -2],[1, -2]],
            [[0, 0],[-1, 0],[-1, -1],[0, 2],[-1, 2]],
            [[0, 0],[-1, 0],[-1, 1],[0, -2],[-1, -2]],
        ]
    ],
    // O
    [
        [
            [[0,-1]],
            [[1,0]],
            [[0,1]],
            [[-1,0]],
        ],
        [
            [[1,0]],
            [[0,1]],
            [[-1,0]],
            [[0,-1]],
        ]
    ],
    // I
    [
        [
            [[1, 0],[-1, 0],[2, 0],[-1, 1],[2, -2]], // 0->R
            [[0,1],[-1, 1],[2, 1],[-2, 1],[2, 2]], // R->2
            [[-1, 0],[1, 0],[-2, 0],[1, -1],[-2, 2]], // 2->L
            [[0,-1],[-2,-1],[1, -1],[1, 1],[-2, -2]], // L->0
        ],
        [
            [[0, 1],[ -1,1],[ 2,1],[ -1,-1],[2, 2]], // 0->L
            [[-1, 0],[1, 0],[-2, 0],[1, -1],[-2, 2]], // R->0
            [[0, -1],[1, -1],[-2, -1],[1, 1],[-2, -2]], // 2->R
            [[1, 0],[2, 0],[-1, 0],[-1, 1],[2, -2]], // L->2
        ]
    ],
];

class Tetromino {
    /**
     * Tetrominoの中心のx座標
     */
    private x: number = 0;
    /**
     * Tetrominoの中心のy座標
     */
    private y: number = 0;
    /**
     * Tetrominoの種類
     */
    private kind: number = 0;
    /**
     * Tetrominoの向き
     */
    private direction: number = 0;
    /**
     * Tetrominoの表示状態
     */
    private visible: boolean = false;
    /**
     * 各ブロックの数字
     */
    private numbers: (number | null)[] = [null, null, null, null];

    /**
     * @returns 各ブロックの座標の配列
     */
    getBlockCoordinates(): [number, number][] {
        let coordinates = [];
        for (let i = 0; i < 4; i++) {
            coordinates.push([this.x + tetrominoShape[this.kind][this.direction][i][0], this.y + tetrominoShape[this.kind][this.direction][i][1]]);
        }
        return coordinates as [number, number][];
    }

    get g$kind(): number {
        return this.kind;
    }

    get g$direction(): number {
        return this.direction;
    }

    get g$numbers(): (number | null)[] {
        return structuredClone(this.numbers);
    }

    get g$visible(): boolean {
        return this.visible;
    }

    get g$x(): number {
        return this.x;
    }

    get g$y(): number {
        return this.y;
    }

    set s$x(x: number) {
        if (this.visible || !Number.isSafeInteger(x)) {
            return;
        }
        this.x = x;
    }

    set s$y(y: number) {
        if (this.visible || !Number.isSafeInteger(y)) {
            return;
        }
        this.y = y;
    }

    setLocation(x: number, y: number): void {
        if (this.visible || !Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
            return;
        }
        this.x = x;
        this.y = y;
    }

    move(dx: number, dy: number): void {
        this.setLocation(this.x + dx, this.y + dy);
    }

    spin(dd: number): void {
        this.s$direction = this.direction + dd;
    }

    set s$numbers(numbers: (number | null)[]) {
        if (this.visible) {
            return;
        }
        this.numbers = numbers;
    }

    set s$visible(visible: boolean) {
        this.visible = visible;
    }

    set s$direction(direction: number) {
        if (this.visible || !Number.isSafeInteger(direction)) {
            return;
        }
        this.direction = ((direction % 4) + 4) % 4;
    }

    set s$kind(kind: number) {
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
    private element: HTMLDivElement = document.createElement("div");
    private blocks: Block[][] = [];
    private width: number;
    private height: number;
    /**
     * @param width 盤面の横幅　正の整数
     * @param height 盤面の縦幅　正の整数
     */
    constructor(width: number, height: number) {
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
    get g$element(): HTMLDivElement {
        return this.element;
    }

    get g$height(): number {
        return this.height;
    }

    get g$width(): number {
        return this.width;
    }

    /**
     * @param tetromino 表示できるかどうかを確かめる状態を持ったtetromino
     * @returns 表示できるか
     */
    canDisplay(tetromino: Tetromino): boolean {
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
    canDisplayBlock(x: number, y: number): boolean {
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
    displayMino(tetromino: Tetromino): void {
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
    removeMino(tetromino: Tetromino): void {
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
    moveMino(tetromino: Tetromino, dx: number, dy: number): void {
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
    spinMino(tetromino: Tetromino, dd: number): void {
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
            } else {
                tetromino.move(-correction[i][0], -correction[i][1]);
            }
        }

        if (!spinSuccess) {
            tetromino.spin(-dd);
        }
        this.displayMino(tetromino);
        this.paint();
    }

    getMinoBlocks(tetromino: Tetromino) {
        return tetromino.getBlockCoordinates().map((coordinate) => this.blocks[coordinate[0]][coordinate[1]]);
    }

    shiftBlock([fromX, fromY]: [number, number], [toX, toY]: [number, number]) {
        this.blocks[toX][toY].visible = this.blocks[fromX][fromY].visible;
        this.blocks[toX][toY].kind = this.blocks[fromX][fromY].kind;
        this.blocks[toX][toY].number = this.blocks[fromX][fromY].number;
        this.blocks[fromX][fromY].visible = false;
    }

    decreaseBlockNumbers() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (this.blocks[w][h].visible && this.blocks[w][h].number) {
                    this.blocks[w][h].number!--;
                }
            }
        }
    }

    removeNonPositiveNumbers() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (this.blocks[w][h].visible && this.blocks[w][h].number != null && this.blocks[w][h].number! <= 0) {
                    this.blocks[w][h].visible = false;
                }
            }
        }
        this.paint();
    }

    isCleared(): boolean {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (this.blocks[w][h].visible) {
                    return false;
                }
            }
        }
        return true;
    }

    lineIsFilled(height: number): boolean {
        for (let w = 0; w < this.width; w++) {
            if (!this.blocks[w][height].visible) {
                return false;
            }
        }
        return true;
    }

    shiftLine(height: number) {
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

    frameIsFilled(depth: number) {
        const oldBorder = Math.floor(this.width / 2) + depth;
        if (this.width <= oldBorder) {
            return;
        }
        const youngBorder = this.width - oldBorder - 1;
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                if (
                    (((w == youngBorder || w == oldBorder) && youngBorder <= h && h <= oldBorder) || ((h == youngBorder || h == oldBorder) && youngBorder <= w && w <= oldBorder)) &&
                    !this.blocks[w][h].visible
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    removeFrame(depth: number) {
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

    shiftFrame(depth: number) {
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
        //角の両隣にブロックが存在するなら角も埋める
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
                this.removeFrame(d);
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
    paint(): void {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                this.blocks[w][h].paint();
            }
        }
    }
}
