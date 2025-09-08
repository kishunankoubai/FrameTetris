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
                    this.operatePanel = new MinoOperatePanel(12, 12);
                }
                if (this.operatePanel) {
                    repaintLabels(["score", "remove"]);
                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeFrames();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                    shake(Math.max(removeCount * 100, 300));
                                } else {
                                    brighten(this.operatePanel!.getNowMinoBlocks().map((block) => block.g$element));
                                }
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
                                const latestKey = this.keyboardManager.getLatestPressingKey(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 300) {
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

                    let lastY = this.operatePanel.g$minoCoordinate[1];
                    let lastFallTime = this.loopManager.getElapsedTime();
                    let lastMaxY = lastY;
                    let lastMaxFallTime = lastFallTime;
                    let fallibleStartTime = lastFallTime;
                    let fallibleFinishTime = -Infinity;
                    let level = 1;
                    const updateFallTime = () => {
                        const nowY = this.operatePanel!.g$minoCoordinate[1];
                        if (nowY == lastY) {
                            return;
                        }
                        lastY = nowY;
                        lastFallTime = this.loopManager.getElapsedTime();
                        if (lastY > lastMaxY) {
                            lastMaxY = lastY;
                            lastMaxFallTime = lastFallTime;
                        }
                    };
                    const resetFallTime = () => {
                        lastY = this.operatePanel!.g$minoCoordinate[1];
                        lastFallTime = this.loopManager.getElapsedTime();
                        lastMaxY = lastY;
                        lastMaxFallTime = lastFallTime;
                        fallibleStartTime = lastFallTime;
                        fallibleFinishTime = -Infinity;
                    };

                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeLines();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                    shake(Math.max(removeCount ** 2 * 12.5, 40));
                                } else {
                                    brighten(this.operatePanel!.getNowMinoBlocks().map((block) => block.g$element));
                                }
                                data.remove += removeCount;
                                data.score += (removeCount * (removeCount + 1)) / 2;
                                if (this.operatePanel!.g$blockManager.isCleared()) {
                                    data.score += 25;
                                }
                                level = Math.floor(data.remove / 10) + 1;
                                repaintLabels(["score", "remove"]);
                            },
                            classNames: ["put"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                resetFallTime();
                            },
                            classNames: ["spawnMino"],
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
                                if (["ArrowLeft", "ArrowRight", "ArrowDown", "KeyC", "KeyV"].includes(latestKey)) {
                                    updateFallTime();
                                }
                                if (["KeyB", "Space"].includes(latestKey)) {
                                    resetFallTime();
                                }
                            },
                            classNames: ["onKeydown"],
                        })
                    );
                    let lastOperateTime = 0;
                    this.loopManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.getLatestPressingKey(["ArrowLeft", "ArrowRight", "ArrowDown"]);
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 250) {
                                    if (pressTime - lastOperateTime >= 25) {
                                        if (latestKey == "ArrowDown") {
                                            this.operatePanel!.move(0, 1);
                                        } else {
                                            operate(latestKey);
                                        }
                                        lastOperateTime = pressTime;
                                        updateFallTime();
                                    }
                                } else {
                                    lastOperateTime = 0;
                                }

                                const fallible = this.operatePanel!.g$canFall;
                                if (fallibleStartTime <= fallibleFinishTime) {
                                    if (fallible) {
                                        fallibleStartTime = this.loopManager.getElapsedTime();
                                    }
                                } else if (!fallible) {
                                    fallibleFinishTime = this.loopManager.getElapsedTime();
                                }

                                const elapsedTime = this.loopManager.getElapsedTime();
                                if (1000 - level ** 0.9 * 100 >= -100) {
                                    if (elapsedTime - Math.max(lastFallTime, fallibleStartTime) >= Math.max(1000 - level ** 0.9 * 100, 0)) {
                                        this.operatePanel!.move(0, 1);
                                        updateFallTime();
                                    }
                                } else {
                                    while (this.operatePanel!.g$canFall) {
                                        this.operatePanel!.move(0, 1);
                                    }
                                }
                                if (elapsedTime - Math.max(lastFallTime, fallibleFinishTime, fallibleStartTime) >= Math.max(1000 * level ** -0.25, 300)) {
                                    this.operatePanel!.hardDrop();
                                }
                                if (elapsedTime - lastMaxFallTime >= Math.max(10000 * level ** -0.25, 3000)) {
                                    this.operatePanel!.hardDrop();
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
                    this.operatePanel = new MinoOperatePanel(10, 15);
                }
                if (this.operatePanel) {
                    this.operatePanel.s$spawnCoordinate = [4, 1];
                    repaintLabels(["score", "remove", "count"]);
                    let level = 0;
                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const removeCount = this.operatePanel!.g$blockManager.removeLines();
                                if (removeCount) {
                                    this.operatePanel!.forgetPrevMino();
                                    shake(Math.max(removeCount * 100, 300));
                                    data.count += Math.max(Math.max(removeCount ** 2 * 10 - level, 3) - Math.max(removeCount - 1, 0) * Math.max(level - 7, 0), 2 * removeCount);
                                } else {
                                    brighten(this.operatePanel!.getNowMinoBlocks().map((block) => block.g$element));
                                    data.count--;
                                }
                                data.remove += removeCount;
                                data.score += removeCount ** 2;
                                level = Math.floor(data.remove / 5);
                                if (this.operatePanel!.g$blockManager.isCleared()) {
                                    data.score += 50;
                                }
                                repaintLabels(["score", "remove", "count"]);
                                this.operatePanel!.increaseNowMinoNumbers(1);
                                this.operatePanel!.g$blockManager.decreaseBlockNumbers();
                                this.operatePanel!.g$blockManager.removeNonPositiveNumbers();
                                if (!data.count) {
                                    this.isPlaying = false;
                                    writeResult(["score", "remove"]);
                                    pageManager.setPage("result");
                                }
                            },
                            classNames: ["put"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                if (level <= 4) {
                                    this.operatePanel!.setRandomNumbers(2, 9);
                                } else if (level <= 7) {
                                    this.operatePanel!.setRandomNumbers(3, 9);
                                } else if (level <= 14) {
                                    this.operatePanel!.setRandomNumbers(2, 12);
                                } else if (level <= 20) {
                                    this.operatePanel!.setRandomNumbers(6, 15);
                                } else if (level <= 30) {
                                    this.operatePanel!.setRandomNumbers(10, 20);
                                } else if (level <= 40) {
                                    this.operatePanel!.setRandomNumbers(2, 25);
                                } else {
                                    this.operatePanel!.setRandomNumbers(0, 18);
                                }
                            },
                            classNames: ["spawnMino"],
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
                        if (keyCode == "KeyX") {
                            this.operatePanel!.put();
                        }
                        if (keyCode == "KeyC") {
                            this.operatePanel!.spin(-1);
                        }
                        if (keyCode == "KeyV") {
                            this.operatePanel!.spin(1);
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
                                const latestKey = this.keyboardManager.getLatestPressingKey(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 250) {
                                    if (pressTime - lastOperateTime >= 25) {
                                        if (latestKey == "ArrowDown") {
                                            this.operatePanel!.move(0, 1);
                                        } else {
                                            operate(latestKey);
                                        }
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
            case 4:
                if (this.modeSetting) {
                } else {
                    this.operatePanel = new MinoOperatePanel(10, 20);
                }
                if (this.operatePanel) {
                    this.operatePanel.s$spawnCoordinate = [4, 1];
                    data.count = 10;
                    repaintLabels(["score", "remove", "count"]);
                    let lastY = this.operatePanel.g$minoCoordinate[1];
                    let lastFallTime = this.loopManager.getElapsedTime();
                    let lastMaxY = lastY;
                    let lastMaxFallTime = lastFallTime;
                    let fallibleStartTime = lastFallTime;
                    let fallibleFinishTime = -Infinity;
                    let level = 1;
                    const updateFallTime = () => {
                        const nowY = this.operatePanel!.g$minoCoordinate[1];
                        if (nowY == lastY) {
                            return;
                        }
                        lastY = nowY;
                        lastFallTime = this.loopManager.getElapsedTime();
                        if (lastY > lastMaxY) {
                            lastMaxY = lastY;
                            lastMaxFallTime = lastFallTime;
                        }
                    };
                    const resetFallTime = () => {
                        lastY = this.operatePanel!.g$minoCoordinate[1];
                        lastFallTime = this.loopManager.getElapsedTime();
                        lastMaxY = lastY;
                        lastMaxFallTime = lastFallTime;
                        fallibleStartTime = lastFallTime;
                        fallibleFinishTime = -Infinity;
                    };

                    this.operatePanel.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                data.count--;
                                if (data.count == 0) {
                                    const removeCount = this.operatePanel!.g$blockManager.removeLines();
                                    if (removeCount) {
                                        shake(Math.max(removeCount * 50, 400));
                                    } else {
                                        brighten(this.operatePanel!.getNowMinoBlocks().map((block) => block.g$element));
                                    }
                                    data.remove += removeCount;
                                    data.score += (removeCount * (removeCount + 1)) / 2;
                                    data.count = 10;
                                    this.operatePanel!.forgetPrevMino();
                                } else {
                                    brighten(this.operatePanel!.getNowMinoBlocks().map((block) => block.g$element));
                                }
                                if (this.operatePanel!.g$blockManager.isCleared()) {
                                    data.score += 25;
                                }
                                level = Math.floor(data.remove / 10) + 1;
                                repaintLabels(["score", "remove", "count"]);
                            },
                            classNames: ["put"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                data.count++;
                                repaintLabels(["score", "remove", "count"]);
                            },
                            classNames: ["unput"],
                        }),
                        EventManager.addEvent({
                            handler: () => {
                                resetFallTime();
                            },
                            classNames: ["spawnMino"],
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
                                if (["ArrowLeft", "ArrowRight", "ArrowDown", "KeyC", "KeyV"].includes(latestKey)) {
                                    updateFallTime();
                                }
                                if (["KeyB", "Space"].includes(latestKey)) {
                                    resetFallTime();
                                }
                            },
                            classNames: ["onKeydown"],
                        })
                    );
                    let lastOperateTime = 0;
                    this.loopManager.eventIds.push(
                        EventManager.addEvent({
                            handler: () => {
                                const latestKey = this.keyboardManager.getLatestPressingKey(["ArrowLeft", "ArrowRight", "ArrowDown"]);
                                const pressTime = Date.now() - this.keyboardManager.getPressTime(latestKey);
                                if (pressTime >= 250) {
                                    if (pressTime - lastOperateTime >= 25) {
                                        if (latestKey == "ArrowDown") {
                                            this.operatePanel!.move(0, 1);
                                        } else {
                                            operate(latestKey);
                                        }
                                        lastOperateTime = pressTime;
                                        updateFallTime();
                                    }
                                } else {
                                    lastOperateTime = 0;
                                }

                                const fallible = this.operatePanel!.g$canFall;
                                if (fallibleStartTime <= fallibleFinishTime) {
                                    if (fallible) {
                                        fallibleStartTime = this.loopManager.getElapsedTime();
                                    }
                                } else if (!fallible) {
                                    fallibleFinishTime = this.loopManager.getElapsedTime();
                                }

                                const elapsedTime = this.loopManager.getElapsedTime();
                                if (1000 - level ** 0.9 * 100 >= -100) {
                                    if (elapsedTime - Math.max(lastFallTime, fallibleStartTime) >= Math.max(1000 - level ** 0.9 * 100, 0)) {
                                        this.operatePanel!.move(0, 1);
                                        updateFallTime();
                                    }
                                } else {
                                    while (this.operatePanel!.g$canFall) {
                                        this.operatePanel!.move(0, 1);
                                    }
                                }
                                if (elapsedTime - Math.max(lastFallTime, fallibleFinishTime, fallibleStartTime) >= Math.max(1000 * level ** -0.25, 300)) {
                                    this.operatePanel!.hardDrop();
                                }
                                if (elapsedTime - lastMaxFallTime >= Math.max(10000 * level ** -0.25, 3000)) {
                                    this.operatePanel!.hardDrop();
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
