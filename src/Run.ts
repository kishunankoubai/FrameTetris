let blockManager: BlockManager;
const gameModeManager = new GameModeManager();

document.addEventListener("DOMContentLoaded", async () => {
    await pageManager.init();
    BGM.init();
    // lockTitle();
});

document.getElementById("pageStart")!.onclick = () => {
    pageManager.setPage("title");
};

EventManager.addEvent({
    handler: () => {
        document.getElementById("play")!.appendChild(gameModeManager.g$element!);
        gameModeManager.start();
    },
    classNames: ["setPage-play"],
});

document.querySelectorAll("#gameModeSelect .options *").forEach((element) => {
    (element as HTMLElement).addEventListener("click", () => {
        try {
            const mode = parseInt((element as HTMLElement).dataset.mode!);
            gameModeManager.s$mode = mode;
        } catch (error) {
            console.error("モード選択画面のボタンの設定が不正です");
            gameModeManager.s$mode = 1;
        }
    });
});

document.querySelectorAll(".modeDescriptionButton").forEach((element) => {
    (element as HTMLElement).addEventListener("click", () => {
        pageManager.setPage("modeDescription" + gameModeManager.g$mode);
    });
});

document.querySelectorAll("#quitButton").forEach((element) => {
    (element as HTMLElement).addEventListener("click", () => {
        gameModeManager.reset();
    });
});

document.querySelectorAll(".retryButton").forEach((element) => {
    (element as HTMLElement).addEventListener("click", () => {
        pageManager.backPages(2);
        const mode = gameModeManager.g$mode;
        gameModeManager.reset();
        gameModeManager.s$mode = mode;
        pageManager.setPage("play");
    });
});

document.querySelectorAll("#resumeButton").forEach((element) => {
    (element as HTMLElement).addEventListener("click", () => {
        gameModeManager.start();
    });
});

const pauseKeyboardManager = new KeyboardManager();
const pauseOperate = (keyCode: string) => {
    if (!gameModeManager.isPlaying) {
        return;
    }
    if (keyCode == "KeyP") {
        if (pageManager.g$currentPage!.id == "pause") {
            pageManager.backPages(1);
            gameModeManager.start();
        } else {
            pageManager.setPage("pause");
        }
    }
    if (keyCode == "KeyR") {
        if (pageManager.g$currentPage!.id == "pause") {
        } else {
            pageManager.setPage("pause");
        }
        (document.querySelector("#retryButton") as HTMLElement).click();
    }
};

EventManager.addEvent({
    handler: () => {
        gameModeManager.stop();
    },
    classNames: ["setPage-pause"],
});

pauseKeyboardManager.eventIds.push(
    EventManager.addEvent({
        handler: () => {
            const latestKey = pauseKeyboardManager.g$latestPressingKey;
            pauseOperate(latestKey);
        },
        classNames: ["onKeydown"],
    })
);
pauseKeyboardManager.start();

//タイトル画面以降進めないようにする
// let lockTitle = () => {
//     const startKeyboardManager = new KeyboardManager();
//     startKeyboardManager.start();
//     EventManager.addEvent({
//         id: 100,
//         handler: async () => {
//             if (startKeyboardManager.g$isValid && startKeyboardManager.arePressing(["KeyC", "KeyB", "KeyV"])) {
//                 pageManager.setPage("title");
//             }
//         },
//         classNames: ["onKeydown"],
//     });
//     startKeyboardManager.eventIds.push(100);

//     EventManager.addEvent({
//         handler: () => {
//             startKeyboardManager.stop();
//         },
//         classNames: ["setPage-title"],
//     });
//     lockTitle = () => {};
// };

document.addEventListener("keydown", (e) => {
    if (e.code == "Tab") {
        e.preventDefault();
    }
});
