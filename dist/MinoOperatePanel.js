"use strict";
class MinoOperatePanel {
    nowTetromino = new Tetromino();
    holdTetromino = new Tetromino();
    prevTetromino = null;
    next = [0, 1, 2, 3, 4, 5, 6];
    next2 = [0, 1, 2, 3, 4, 5, 6];
    putCount = -1;
    blockManager;
    operable = false;
    isFinished = false;
    constructor(width, height) {
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
    set s$operable(operable) {
        this.operable = this.putCount != -1 && !this.isFinished && operable;
    }
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
        this.nowTetromino.setLocation(Math.floor(this.blockManager.g$width / 2 - 1), Math.floor(this.blockManager.g$height / 2 - 1));
        if (this.blockManager.canDisplay(this.nowTetromino)) {
            this.blockManager.display(this.nowTetromino);
            this.blockManager.paint();
        }
        else {
            this.finish();
        }
    }
    move(dx, dy) {
        if (!this.operable) {
            return;
        }
        this.blockManager.move(this.nowTetromino, dx, dy);
    }
    spin(dd) {
        if (!this.operable) {
            return;
        }
        this.blockManager.spin(this.nowTetromino, dd);
    }
    fall() {
        if (!this.operable) {
            return;
        }
        const y = this.nowTetromino.g$y;
        this.move(0, 1);
        if (this.nowTetromino.g$y == y) {
            this.put();
        }
    }
    put() {
        if (!this.operable) {
            return;
        }
        this.putCount++;
        const removeCount = this.blockManager.removeFrames();
        if (removeCount == 0) {
            this.prevTetromino = new Tetromino();
            this.prevTetromino.s$kind = this.nowTetromino.g$kind;
            this.prevTetromino.s$x = this.nowTetromino.g$x;
            this.prevTetromino.s$y = this.nowTetromino.g$y;
            this.prevTetromino.s$direction = this.nowTetromino.g$direction;
            this.prevTetromino.s$visible = true;
        }
        else {
            this.prevTetromino = null;
        }
        this.spawnMino();
    }
    unput() {
        if (!this.operable) {
            return;
        }
        if (this.prevTetromino) {
            this.blockManager.remove(this.nowTetromino);
            this.next2.pop();
            this.next2.unshift(this.next.pop());
            this.next.unshift(this.nowTetromino.g$kind);
            this.nowTetromino = this.prevTetromino;
            this.prevTetromino = null;
            this.blockManager.remove(this.nowTetromino);
            this.nowTetromino.setLocation(Math.floor(this.blockManager.g$width / 2 - 1), Math.floor(this.blockManager.g$height / 2 - 1));
            this.nowTetromino.s$direction = 0;
            this.blockManager.display(this.nowTetromino);
            this.putCount--;
            this.blockManager.paint();
        }
    }
    finish() {
        this.isFinished = true;
        this.operable = false;
    }
}
