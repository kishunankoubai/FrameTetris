"use strict";
let blockManager;
const gameModeManager = new GameModeManager();
document.addEventListener("DOMContentLoaded", async () => {
    await pageManager.init();
    BGM.init();
    // lockTitle();
});
document.getElementById("pageStart").onclick = () => {
    pageManager.setPage("title");
};
EventManager.addEvent({
    handler: () => {
        document.getElementById("play").appendChild(gameModeManager.g$element);
        gameModeManager.start();
    },
    classNames: ["setPage-play"],
});
document.querySelectorAll("#gameModeSelect .options *").forEach((element) => {
    element.addEventListener("click", () => {
        try {
            const mode = parseInt(element.dataset.mode);
            gameModeManager.s$mode = mode;
        }
        catch (error) {
            console.error("モード選択画面のボタンの設定が不正です");
            gameModeManager.s$mode = 1;
        }
    });
});
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
