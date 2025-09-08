"use strict";
class LoopManager {
    /**
     * 目標ループ頻度(ms)
     * requestAnimationFrameの頻度が最速
     * 0なら自動的に最速
     */
    loopFrequency = 0;
    loopTimer = null;
    lastLoopCount = 0;
    loopId = null;
    isLooping = false;
    /**
     * loop: ループをしたとき
     */
    eventClassNames = ["loop"];
    eventIds = [];
    /**
     * @param startImmediately インスタンス生成後すぐに開始するかどうか
     */
    constructor(startImmediately = false) {
        if (startImmediately) {
            this.start();
        }
    }
    /**
     * ループ中かどうか
     */
    get g$isLooping() {
        return this.isLooping;
    }
    /**
     * ループを開始する
     */
    start() {
        if (this.isLooping) {
            return;
        }
        this.loopId = requestAnimationFrame(this.loop.bind(this));
        if (this.loopTimer) {
            this.loopTimer.resume();
        }
        else {
            this.loopTimer = new TimeManager(true);
        }
        this.isLooping = true;
    }
    /**
     * ループを停止する
     */
    stop() {
        if (!this.isLooping) {
            return;
        }
        this.loopTimer.pause();
        cancelAnimationFrame(this.loopId);
        this.isLooping = false;
    }
    /**
     * ループの中身
     */
    loop() {
        const loopCount = this.loopTimer.getGoalCount(this.loopFrequency);
        if (this.lastLoopCount != loopCount || loopCount == Infinity) {
            this.lastLoopCount = loopCount;
            EventManager.executeListeningEvents("loop", this.eventIds);
        }
        this.loopId = requestAnimationFrame(this.loop.bind(this));
    }
    /**
     * @returns ループの合計駆動時間
     */
    getElapsedTime() {
        if (!this.loopTimer) {
            return 0;
        }
        return this.loopTimer.getElapsedTime();
    }
}
