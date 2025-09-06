"use strict";
class MinoOperatePanel {
    nowTetromino = new Tetromino();
    holdTetromino = null;
    prevTetromino = null;
    next = [0, 1, 2, 3, 4, 5, 6];
    next2 = [0, 1, 2, 3, 4, 5, 6];
    putCount = -1;
    blockManager;
    operable = false;
    isFinished = false;
    spawnCoordinate = [0, 0];
    eventClassNames = ["spawnMino", "move", "spin", "softDrop", "hardDrop", "put", "unput", "hold", "finish"];
    eventIds = [];
    constructor(width, height) {
        this.spawnCoordinate = [Math.floor(width / 2 - 1), Math.floor(height / 2 - 1)];
        this.blockManager = new BlockManager(width, height);
        mixArray(this.next);
    }
    start() {
        this.spawnMino();
        this.operable = true;
    }
    get g$element() {
        return this.blockManager.g$element;
    }
    get g$width() {
        return this.blockManager.g$width;
    }
    get g$height() {
        return this.blockManager.g$height;
    }
    get g$spawnCoordinate() {
        return this.spawnCoordinate;
    }
    get g$nextKinds() {
        return structuredClone(this.next);
    }
    get g$blockManager() {
        return this.blockManager;
    }
    set s$operable(operable) {
        this.operable = this.putCount != -1 && !this.isFinished && operable;
    }
    set s$spawnCoordinate(spawnCoordinate) {
        this.spawnCoordinate = window.structuredClone(spawnCoordinate);
    }
    /**
     * nextに従って新しいtetrominoをspawnCoordinateに出現させる
     * 出現できない場合はfinishする
     */
    spawnMino() {
        if (this.putCount == -1) {
            this.putCount++;
        }
        else {
            this.nowTetromino = new Tetromino();
        }
        if (this.putCount % 7 == 0) {
            mixArray(this.next2);
        }
        this.nowTetromino.s$kind = this.next.shift();
        this.next.push(this.next2.shift());
        this.next2.push(this.nowTetromino.g$kind);
        this.nowTetromino.setLocation(...this.spawnCoordinate);
        if (this.blockManager.canDisplay(this.nowTetromino)) {
            this.blockManager.displayMino(this.nowTetromino);
            EventManager.executeListeningEvents("spawnMino", this.eventIds);
            this.blockManager.paint();
        }
        else {
            this.finish();
        }
    }
    /**
     * 現在操作しているtetrominoを移動させる
     * @param dx 相対移動のx成分
     * @param dy 相対移動のy成分
     */
    move(dx, dy) {
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
    spin(dd) {
        if (!this.operable) {
            return;
        }
        this.blockManager.spinMino(this.nowTetromino, dd);
        EventManager.executeListeningEvents("spin", this.eventIds);
    }
    /**
     * 現在操作しているtetrominoを下に移動できるならして、できないなら設置する
     */
    softDrop() {
        if (!this.operable) {
            return;
        }
        const y = this.nowTetromino.g$y;
        this.move(0, 1);
        if (this.nowTetromino.g$y == y) {
            this.put();
        }
        else {
            EventManager.executeListeningEvents("softDrop", this.eventIds);
        }
    }
    /**
     * 現在操作しているtetrominoを下に移動できるまで移動した後、そこに設置する
     */
    hardDrop() {
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
    put() {
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
    unput() {
        if (!this.operable) {
            return;
        }
        if (this.prevTetromino) {
            this.blockManager.removeMino(this.nowTetromino);
            this.next2.pop();
            this.next2.unshift(this.next.pop());
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
    hold() {
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
        }
        else {
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
