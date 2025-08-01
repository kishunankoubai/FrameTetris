"use strict";
/**
 * 実際の時間に即したタイマー
 */
class TimeManager {
    //時間はすべてmsで管理される
    startTime = null;
    lastPauseTime = null;
    pauseSpan = 0;
    hasStarted = false;
    isPausing = false;
    /**
     * @param startImmediately インスタンス生成後すぐに開始するかどうか
     */
    constructor(startImmediately = false) {
        if (startImmediately) {
            this.start();
        }
    }
    /**
     * 開始時間
     * まだ開始していない場合はnull
     */
    get g$startTime() {
        return this.startTime;
    }
    /**
     * 最後に中断した時間
     * まだ中断したことがない場合はnull
     */
    get g$lastPauseTime() {
        return this.lastPauseTime;
    }
    /**
     * 開始されているかどうか
     */
    get g$hasStarted() {
        return this.hasStarted;
    }
    /**
     * 中断中かどうか
     */
    get g$isPausing() {
        return this.isPausing;
    }
    /**
     * 中断時間の合計
     */
    get g$pauseSpan() {
        return this.pauseSpan;
    }
    /**
     * 時間の計測を開始する
     */
    start() {
        if (this.hasStarted) {
            return;
        }
        this.startTime = Date.now();
        this.hasStarted = true;
        this.isPausing = false;
    }
    /**
     * 時間の計測を中断する
     */
    pause() {
        if (!this.hasStarted || this.isPausing) {
            return;
        }
        this.lastPauseTime = Date.now();
        this.isPausing = true;
    }
    /**
     * 時間の計測を再開する
     */
    resume() {
        if (!this.hasStarted || !this.isPausing) {
            return;
        }
        this.pauseSpan += Date.now() - this.lastPauseTime;
    }
    /**
     * 開始していなければnullを返す
     * @returns 経過時間
     */
    getElapsedTime() {
        if (!this.hasStarted) {
            return null;
        }
        if (this.isPausing) {
            return this.lastPauseTime - this.pauseSpan - this.startTime;
        }
        return Date.now() - this.pauseSpan - this.startTime;
    }
    /**
     * @param goal 目標経過時間
     * @returns 目標経過時間の達成回数
     */
    getGoalCount(goal) {
        if (!this.hasStarted) {
            return 0;
        }
        return Math.floor(this.getElapsedTime() / goal);
    }
}
