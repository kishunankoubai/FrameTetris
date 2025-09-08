class MinoOperatePanel implements MyEventListener {
    private nowTetromino: Tetromino = new Tetromino();
    private holdTetromino: Tetromino | null = null;
    private prevTetromino: Tetromino | null = null;
    private next = [0, 1, 2, 3, 4, 5, 6];
    private next2 = [0, 1, 2, 3, 4, 5, 6];
    private putCount = -1;
    private blockManager: BlockManager;
    private operable: boolean = false;
    private isFinished: boolean = false;
    private spawnCoordinate: [number, number] = [0, 0];
    readonly eventClassNames: string[] = ["spawnMino", "move", "spin", "softDrop", "hardDrop", "put", "unput", "hold", "finish"];
    eventIds: EventId[] = [];

    constructor(width: number, height: number) {
        this.spawnCoordinate = [Math.floor(width / 2 - 1), Math.floor(height / 2 - 1)];
        this.blockManager = new BlockManager(width, height);
        mixArray(this.next);
    }

    start() {
        this.spawnMino();
        this.operable = true;
    }

    get g$element(): HTMLDivElement {
        return this.blockManager.g$element;
    }

    get g$width(): number {
        return this.blockManager.g$width;
    }

    get g$height(): number {
        return this.blockManager.g$height;
    }

    get g$spawnCoordinate(): number[] {
        return this.spawnCoordinate;
    }

    get g$nextKinds(): number[] {
        return structuredClone(this.next);
    }

    get g$blockManager(): BlockManager {
        return this.blockManager;
    }

    get g$minoCoordinate(): [number, number] {
        return [this.nowTetromino.g$x, this.nowTetromino.g$y];
    }

    get g$canFall(): boolean {
        const y = this.nowTetromino.g$y;
        this.blockManager.removeMino(this.nowTetromino);
        this.nowTetromino.s$y = y + 1;
        const result = this.blockManager.canDisplay(this.nowTetromino);
        this.nowTetromino.s$y = y;
        this.blockManager.displayMino(this.nowTetromino);
        return result;
    }

    set s$operable(operable: boolean) {
        this.operable = this.putCount != -1 && !this.isFinished && operable;
    }

    set s$spawnCoordinate(spawnCoordinate: [number, number]) {
        this.spawnCoordinate = window.structuredClone(spawnCoordinate);
    }

    /**
     * nextに従って新しいtetrominoをspawnCoordinateに出現させる
     * 出現できない場合はfinishする
     */
    spawnMino() {
        if (this.putCount == -1) {
            this.putCount++;
        } else {
            this.nowTetromino = new Tetromino();
        }
        if (this.putCount % 7 == 0) {
            mixArray(this.next2);
        }
        this.nowTetromino.s$kind = this.next.shift()!;
        this.next.push(this.next2.shift()!);
        this.next2.push(this.nowTetromino.g$kind);
        this.nowTetromino.setLocation(...this.spawnCoordinate);
        if (this.blockManager.canDisplay(this.nowTetromino)) {
            this.blockManager.displayMino(this.nowTetromino);
            EventManager.executeListeningEvents("spawnMino", this.eventIds);
            this.blockManager.paint();
        } else {
            this.finish();
        }
    }

    /**
     * 現在操作しているtetrominoを移動させる
     * @param dx 相対移動のx成分
     * @param dy 相対移動のy成分
     */
    move(dx: number, dy: number): void {
        if (!this.operable) {
            return;
        }
        this.blockManager.moveMino(this.nowTetromino, dx, dy);
        EventManager.executeListeningEvents("move", this.eventIds);
    }

    /**
     * 現在操作しているtetrominoをSRSに従って回転させる
     * @param dd 相対回転
     */
    spin(dd: number): void {
        if (!this.operable) {
            return;
        }
        this.blockManager.spinMino(this.nowTetromino, dd);
        EventManager.executeListeningEvents("spin", this.eventIds);
    }

    /**
     * 現在操作しているtetrominoを下に移動できるならして、できないなら設置する
     */
    softDrop(): void {
        if (!this.operable) {
            return;
        }
        const y = this.nowTetromino.g$y;
        this.move(0, 1);
        if (this.nowTetromino.g$y == y) {
            this.put();
        } else {
            EventManager.executeListeningEvents("softDrop", this.eventIds);
        }
    }

    /**
     * 現在操作しているtetrominoを下に移動できるまで移動した後、そこに設置する
     */
    hardDrop(): void {
        while (true) {
            const y = this.nowTetromino.g$y;
            this.move(0, 1);
            if (this.nowTetromino.g$y == y) {
                this.put();
                EventManager.executeListeningEvents("hardDrop", this.eventIds);
                return;
            }
        }
    }

    /**
     * 現在操作しているtetrominoをその場に設置する
     */
    put(): void {
        if (!this.operable) {
            return;
        }
        this.putCount++;
        this.prevTetromino = new Tetromino();
        this.prevTetromino.s$kind = this.nowTetromino.g$kind;
        this.prevTetromino.s$x = this.nowTetromino.g$x;
        this.prevTetromino.s$y = this.nowTetromino.g$y;
        this.prevTetromino.s$direction = this.nowTetromino.g$direction;
        this.prevTetromino.s$numbers = this.nowTetromino.g$numbers;
        this.prevTetromino.s$visible = true;
        EventManager.executeListeningEvents("put", this.eventIds);
        this.spawnMino();
    }

    /**
     * 設置を元に戻す　二手戻すことはできない
     */
    unput(): void {
        if (!this.operable) {
            return;
        }
        if (this.prevTetromino) {
            this.blockManager.removeMino(this.nowTetromino);

            this.next2.pop();
            this.next2.unshift(this.next.pop()!);
            this.next.unshift(this.nowTetromino.g$kind);
            this.nowTetromino = this.prevTetromino;
            this.prevTetromino = null;

            this.blockManager.removeMino(this.nowTetromino);
            this.nowTetromino.setLocation(...this.spawnCoordinate);
            this.nowTetromino.s$direction = 0;
            this.blockManager.displayMino(this.nowTetromino);

            this.putCount--;
            EventManager.executeListeningEvents("unput", this.eventIds);
            this.blockManager.paint();
        }
    }

    /**
     * 現在操作しているtetrominoとホールドしているtetrominoを入れ替える
     * まだホールドしていない場合はホールドした上で次のtetrominoを出現させる
     */
    hold(): void {
        if (!this.operable) {
            return;
        }

        if (this.holdTetromino == null) {
            this.holdTetromino = new Tetromino();
            this.nowTetromino.setLocation(...this.spawnCoordinate);
            this.holdTetromino.s$kind = this.nowTetromino.g$kind;
            this.holdTetromino.s$numbers = this.nowTetromino.g$numbers;
            this.holdTetromino.s$direction = 0;
            this.blockManager.removeMino(this.nowTetromino);
            this.spawnMino();
        } else {
            const holdKind = this.holdTetromino.g$kind;
            this.holdTetromino.s$kind = this.nowTetromino.g$kind;
            const numbers = this.holdTetromino.g$numbers;
            this.holdTetromino.s$numbers = this.nowTetromino.g$numbers;
            this.blockManager.removeMino(this.nowTetromino);

            this.nowTetromino.s$kind = holdKind;
            this.nowTetromino.s$numbers = numbers;
            this.nowTetromino.s$direction = 0;
            this.nowTetromino.setLocation(...this.spawnCoordinate);
            this.blockManager.displayMino(this.nowTetromino);
            this.blockManager.paint();
        }
        EventManager.executeListeningEvents("hold", this.eventIds);
    }

    forgetPrevMino() {
        this.prevTetromino = null;
        this.nowTetromino.s$visible = false;
    }

    setRandomNumbers(minNumber: number, maxNumber: number) {
        let numbers = [];
        for (let i = 0; i < 4; i++) {
            numbers.push(Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber));
        }
        if (this.nowTetromino.g$visible) {
            this.blockManager.removeMino(this.nowTetromino);
            this.nowTetromino.s$numbers = numbers;
            this.blockManager.displayMino(this.nowTetromino);
        } else {
            this.nowTetromino.s$numbers = numbers;
        }
    }
    increaseNowMinoNumbers(increaseNumber: number) {
        if (this.nowTetromino.g$visible) {
            this.blockManager.removeMino(this.nowTetromino);
            this.nowTetromino.s$numbers = this.nowTetromino.g$numbers.map((number) => (number == null ? null : number + increaseNumber));
            this.blockManager.displayMino(this.nowTetromino);
        } else {
            this.nowTetromino.s$numbers = this.nowTetromino.g$numbers.map((number) => (number == null ? null : number + increaseNumber));
        }
    }

    getNowMinoBlocks() {
        return this.g$blockManager.getMinoBlocks(this.nowTetromino);
    }

    /**
     * 操作を終了し、操作できなくする
     */
    finish() {
        this.isFinished = true;
        this.operable = false;
        EventManager.executeListeningEvents("finish", this.eventIds);
    }
}
