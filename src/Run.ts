let blockManager: BlockManager;
const panel = new MinoOperatePanel(12, 12);

document.addEventListener("DOMContentLoaded", async () => {
    await pageManager.init();
    document.getElementById("play")!.appendChild(panel.g$element);

    const startKeyboardManager = new KeyboardManager();
    startKeyboardManager.start();
    EventManager.addEvent({
        id: 100,
        handler: () => {
            if (startKeyboardManager.isValid && startKeyboardManager.arePressing(["KeyC", "KeyB", "KeyV"])) {
                pageManager.setPage("title");
            }
        },
        classNames: ["onKeydown"],
    });
    startKeyboardManager.eventIds.push(100);

    EventManager.addEvent({
        handler: () => {
            startKeyboardManager.stop();
        },
        classNames: ["setPage-title"],
    });
    EventManager.addEvent({
        handler: () => {
            panel.start();
        },
        classNames: ["setPage-play"],
    });
});

document.addEventListener("keydown", (e) => {
    if (e.code == "Tab") {
        e.preventDefault();
    }
    if (e.code == "ArrowLeft") {
        panel.move(-1, 0);
    }
    if (e.code == "ArrowRight") {
        panel.move(1, 0);
    }
    if (e.code == "ArrowDown") {
        panel.move(0, 1);
    }
    if (e.code == "ArrowUp") {
        panel.move(0, -1);
    }
    if (e.code == "KeyX") {
        panel.put();
    }
    if (e.code == "KeyC") {
        panel.spin(-1);
    }
    if (e.code == "KeyV") {
        panel.spin(1);
    }
    if (e.code == "KeyB") {
        panel.unput();
    }
});

// document.getElementById("pageStart")!.onclick = async () => {
//     BGM.init();
//     await SE.fetch(0, { path: "assets/SE/モンド移動音.m4a" });
//     SE.setVolume(0, 0.5);
//     await SE.fetch(1, { path: "assets/SE/通常ボタン.m4a" });
//     SE.setVolume(1, 0.5);
//     await SE.fetch(2, { path: "assets/SE/戻るボタン.m4a" });
//     SE.setVolume(2, 0.5);
// };
