class GameModeManager {
    private mode: number = 0;
    private modeSetting: unknown = null;
    private operatePanel: MinoOperatePanel | null = null;
    private keyboardManager: KeyboardManager = new KeyboardManager();
    loopManager: LoopManager = new LoopManager();
    isPlaying: boolean = false;
    constructor(modeSetting: unknown = null) {
        this.modeSetting = modeSetting;
    }

    /**
     * モードの設定
     * @param mode 設定するモード番号
     */
    set s$mode(mode: number) {
        if (this.isPlaying) {
            console.error("プレイ中のモード変更はしないでください");
            return;
        }
        this.mode = mode;
        this.loadGameMode();
    }

    /**
     * モードの詳細設定
     * @param modeSetting モードの詳細設定を反映させる用の情報
     */
    set s$modeSetting(modeSetting: unknown) {
        if (this.isPlaying) {
            console.error("プレイ中の設定変更は反映されません");
        }
        this.modeSetting = modeSetting;
    }

    /**
     * 表示用のdiv要素
     * モード変更やリセットごとに追加しなおす必要がある
     */
    get g$element(): HTMLDivElement | null {
        return this.operatePanel ? this.operatePanel.g$element : null;
    }

    /**
     * 現在設定されているモード
     */
    get g$mode(): number {
        return this.mode;
    }

    /**
     * 現在設定されているモードの詳細設定
     */
    get g$modeSetting() {
        return this.modeSetting;
    }

    /**
     * 現在のモードを読み込む
     */
    loadGameMode() {
        this.reset();
        switch (this.mode) {
            case 1:
                if (this.modeSetting) {
                } else {
                    this.operatePanel = new MinoOperatePanel(10, 10);
                }
                if (this.operatePanel) {
                    repaintLabels(["score", "remove"]);
                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeFrames();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                }
                                console.log(removeCount);
                                data.remove += removeCount;
                                data.score += removeCount ** 2;
                                repaintLabels(["score", "remove"]);
                            },
                            classNames: ["put"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                this.isPlaying = false;
                                writeResult(["score", "remove"]);
                                pageManager.setPage("result");
                            },
                            classNames: ["finish"],
                        })
                    );
                    const operate = (keyCode: string) => {
                        if (keyCode == "ArrowLeft") {
                            this.operatePanel!.move(-1, 0);
                        }
                        if (keyCode == "ArrowRight") {
                            this.operatePanel!.move(1, 0);
                        }
                        if (keyCode == "ArrowDown") {
                            this.operatePanel!.move(0, 1);
                        }
                        if (keyCode == "ArrowUp") {
                            this.operatePanel!.move(0, -1);
                        }
                        if (keyCode == "KeyX") {
                            this.operatePanel!.put();
                        }
                        if (keyCode == "KeyC") {
                            this.operatePanel!.spin(-1);
                        }
                        if (keyCode == "KeyV") {
                            this.operatePanel!.spin(1);
                        }
                        if (keyCode == "KeyB") {
                            this.operatePanel!.unput();
                        }
                        if (keyCode == "Space") {
                            this.operatePanel!.hold();
                        }
                    };
                    this.keyboardManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                operate(latestKey);
                            },
                            classNames: ["onKeydown"],
                        })
                    );
                    let lastOperateTime = 0;
                    this.loopManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 300 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(latestKey)) {
                                    if (pressTime - lastOperateTime >= 50) {
                                        operate(latestKey);
                                        lastOperateTime = pressTime;
                                    }
                                } else {
                                    lastOperateTime = 0;
                                }
                            },
                            classNames: ["loop"],
                        })
                    );
                }
                break;
            case 2:
                if (this.modeSetting) {
                } else {
                    this.operatePanel = new MinoOperatePanel(10, 20);
                }
                if (this.operatePanel) {
                    this.operatePanel.s$spawnCoordinate = [4, 1];
                    repaintLabels(["score", "remove"]);
                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeLines();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                }
                                data.remove += removeCount;
                                data.score += (removeCount * (removeCount + 1)) / 2;
                                repaintLabels(["score", "remove"]);
                            },
                            classNames: ["put"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                this.isPlaying = false;
                                writeResult(["score", "remove"]);
                                pageManager.setPage("result");
                            },
                            classNames: ["finish"],
                        })
                    );
                    const operate = (keyCode: string) => {
                        if (keyCode == "ArrowLeft") {
                            this.operatePanel!.move(-1, 0);
                        }
                        if (keyCode == "ArrowRight") {
                            this.operatePanel!.move(1, 0);
                        }
                        if (keyCode == "ArrowDown") {
                            this.operatePanel!.softDrop();
                        }
                        if (keyCode == "ArrowUp") {
                            this.operatePanel!.hardDrop();
                        }
                        if (keyCode == "KeyC") {
                            this.operatePanel!.spin(-1);
                        }
                        if (keyCode == "KeyV") {
                            this.operatePanel!.spin(1);
                        }
                        if (keyCode == "KeyB") {
                            this.operatePanel!.unput();
                        }
                        if (keyCode == "Space") {
                            this.operatePanel!.hold();
                        }
                    };
                    this.keyboardManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                operate(latestKey);
                            },
                            classNames: ["onKeydown"],
                        })
                    );
                    let lastOperateTime = 0;
                    this.loopManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 300 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(latestKey)) {
                                    if (pressTime - lastOperateTime >= 50) {
                                        operate(latestKey);
                                        lastOperateTime = pressTime;
                                    }
                                } else {
                                    lastOperateTime = 0;
                                }
                            },
                            classNames: ["loop"],
                        })
                    );
                }
                break;
            case 3:
                if (this.modeSetting) {
                } else {
                    this.operatePanel = new MinoOperatePanel(10, 20);
                }
                if (this.operatePanel) {
                    this.operatePanel.s$spawnCoordinate = [4, 1];
                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeLines();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                }
                            },
                            classNames: ["put"],
                        })
                    );
                    const operate = (keyCode: string) => {
                        if (keyCode == "ArrowLeft") {
                            this.operatePanel!.move(-1, 0);
                        }
                        if (keyCode == "ArrowRight") {
                            this.operatePanel!.move(1, 0);
                        }
                        if (keyCode == "ArrowDown") {
                            this.operatePanel!.softDrop();
                        }
                        if (keyCode == "ArrowUp") {
                            this.operatePanel!.hardDrop();
                        }
                        if (keyCode == "KeyX") {
                            this.operatePanel!.put();
                        }
                        if (keyCode == "KeyC") {
                            this.operatePanel!.spin(-1);
                        }
                        if (keyCode == "KeyV") {
                            this.operatePanel!.spin(1);
                        }
                        if (keyCode == "KeyB") {
                            this.operatePanel!.unput();
                        }
                        if (keyCode == "Space") {
                            this.operatePanel!.hold();
                        }
                    };
                    this.keyboardManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                operate(latestKey);
                            },
                            classNames: ["onKeydown"],
                        })
                    );
                    let lastOperateTime = 0;
                    this.loopManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.g$latestPressingKey;
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 300 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(latestKey)) {
                                    if (pressTime - lastOperateTime >= 50) {
                                        operate(latestKey);
                                        lastOperateTime = pressTime;
                                    }
                                } else {
                                    lastOperateTime = 0;
                                }
                            },
                            classNames: ["loop"],
                        })
                    );
                }
                break;
        }
        if (!this.operatePanel) {
            console.error("モードが正常に設定されていません");
        }
    }

    start() {
        this.loopManager.start();
        this.keyboardManager.start();
        if (!this.isPlaying) {
            if (this.operatePanel) {
                this.operatePanel.start();
            } else {
                throw new Error("モードが正しく設定されていない状態で開始することはできません");
            }
            this.isPlaying = true;
        }
    }

    stop() {
        this.loopManager.stop();
        this.keyboardManager.stop();
    }

    /**
     * モードの設定によって読み込まれた情報をリセットする
     */
    reset() {
        if (this.operatePanel) {
            this.operatePanel.g$element.remove();
            EventManager.removeEvents(this.operatePanel.eventIds);
            this.operatePanel = null;
        }
        this.keyboardManager.stop();
        EventManager.removeEvents(this.keyboardManager.eventIds);
        this.keyboardManager = new KeyboardManager();
        this.loopManager.stop();
        EventManager.removeEvents(this.loopManager.eventIds);
        this.loopManager = new LoopManager();
        this.isPlaying = false;
        data = structuredClone(initialData);
        repaintLabels([]);
    }
}
