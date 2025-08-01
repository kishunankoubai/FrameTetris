class LoopManager implements MyEventListener {
    /**
     * 目標ループ頻度(ms)
     * requestAnimationFrameの頻度が最速
     * 0なら自動的に最速
     */
    loopFrequency: number = 0;
    private loopTimer: TimeManager | null = null;
    private lastLoopCount = 0;
    private loopId: number | null = null;
    private isLooping: boolean = false;
    /**
     * loop: ループをしたとき
     */
    readonly eventClassNames: string[] = ["loop"];
    eventIds: EventId[] = [];

    /**
     * @param startImmediately インスタンス生成後すぐに開始するかどうか
     */
    constructor(startImmediately: boolean = false) {
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
    start(): void {
        if (this.isLooping) {
            return;
        }
        this.loopId = requestAnimationFrame(this.loop.bind(this));
        if (this.loopTimer) {
            this.loopTimer.resume();
        } else {
            this.loopTimer = new TimeManager(true);
        }
        this.isLooping = true;
    }

    /**
     * ループを停止する
     */
    stop(): void {
        if (!this.isLooping) {
            return;
        }
        this.loopTimer!.pause();
        cancelAnimationFrame(this.loopId!);
    }

    /**
     * ループの中身
     */
    private loop() {
        const loopCount = this.loopTimer!.getGoalCount(this.loopFrequency);
        if (this.lastLoopCount != loopCount || loopCount == Infinity) {
            this.lastLoopCount = loopCount;
            EventManager.executeListeningEvents("loop", this.eventIds);
        }
        this.loopId = requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * @returns ループの合計駆動時間
     */
    getElapsedTime(): number {
        if (!this.loopTimer) {
            return 0;
        }
        return this.loopTimer.getElapsedTime()!;
    }
}
