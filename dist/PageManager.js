"use strict";
class PageManager {
    currentPage = null;
    displayingPages = [];
    pageMemory = [];
    static instance;
    eventClassNames = ["pageIsReady", "pageChanged", "setPage", "backPages", "pageBecomeValid", "pageBecomeInvalid"];
    //setPage-ページ名、pageChanged-ページ名
    //シングルトン
    constructor() {
        if (PageManager.instance) {
            return PageManager.instance;
        }
        PageManager.instance = this;
    }
    get g$currentPage() {
        return this.currentPage;
    }
    get g$displayingPages() {
        return [...this.displayingPages];
    }
    get g$pageMemory() {
        return structuredClone(this.pageMemory);
    }
    //DOMが読み込まれてから読み込んでね
    async init() {
        //最初に開くページ
        const initialPageId = document.body.dataset.initialPage || "title";
        await this.setPage(initialPageId);
        //page遷移処理
        document.querySelectorAll("[data-page]").forEach((element) => {
            element.addEventListener("click", async () => {
                const pageId = element.dataset.page;
                if (pageId) {
                    await this.setPage(pageId);
                }
            });
        });
        //pageを戻る処理
        document.querySelectorAll(".back, [data-back]").forEach((element) => {
            element.addEventListener("click", async () => {
                const back = parseInt(element.dataset.back || "1");
                await this.backPages(back);
            });
        });
        //layerの反映
        document.querySelectorAll("[data-layer]").forEach((element) => {
            const layer = element.dataset.layer;
            element.style.zIndex = layer || "0";
        });
        EventManager.executeEventsByClassName("pageIsReady");
    }
    //すべてのページの表示状態を設定する
    async setPages(pageIds) {
        // 新しいページを取得
        const nextPages = pageIds.map((pageId) => document.getElementById(pageId) || null);
        if (nextPages.includes(null)) {
            console.error("指定されたpageIdsに存在しないページが含まれていました");
            return;
        }
        this.displayingPages.forEach((page) => {
            page.style.display = "none";
        });
        nextPages.forEach((page) => {
            page.style.display = "flex";
        });
        let preliminaryCurrentPage = null;
        nextPages.forEach((page) => {
            const layer = parseInt(page.dataset.layer || "0");
            let preliminaryMaxLayer = preliminaryCurrentPage ? parseInt(preliminaryCurrentPage.dataset.layer || "0") : 0;
            if (preliminaryMaxLayer < layer || preliminaryCurrentPage == null) {
                preliminaryCurrentPage = page;
                preliminaryMaxLayer = layer;
            }
            else if (preliminaryMaxLayer == layer && preliminaryCurrentPage != null) {
                console.error("最大layerが一意になっていません");
            }
        });
        this.currentPage = preliminaryCurrentPage;
        this.displayingPages = nextPages;
        this.pageMemory.push(pageIds);
        EventManager.executeEventsByClassName("pageChanged");
        EventManager.executeEventsByClassName("pageChanged-" + (this.currentPage ? this.currentPage.id : ""));
    }
    //指定したpageIdのページを開く
    //現在のページと同じlayerを開く場合は現在のページは閉じ、上のlayerを開く場合は開いたままにする
    async setPage(pageId) {
        // 新しいページを取得
        const nextPage = document.getElementById(pageId);
        if (!nextPage) {
            console.error("指定されたpageIdのページは存在しません");
            return;
        }
        let nextDisplayingPages = [...this.displayingPages];
        // 現在のページを非表示にする
        if (this.currentPage) {
            const currentLayer = parseInt(this.currentPage.dataset.layer || "0");
            const nextLayer = parseInt(nextPage.dataset.layer || "0");
            //同じlayerなら元のページは非表示
            if (nextLayer == currentLayer) {
                nextDisplayingPages = nextDisplayingPages.filter((page) => page.id != this.currentPage.id);
            }
            else if (nextLayer < currentLayer) {
                throw new Error("現在のlayerを下回るlayerのページには遷移できません");
            }
        }
        nextDisplayingPages.push(nextPage);
        await this.setPages(nextDisplayingPages.map((page) => page.id));
        EventManager.executeEventsByClassName("setPage");
        EventManager.executeEventsByClassName("setPage-" + pageId);
    }
    //numberの数だけ前のページの状態に戻る
    async backPages(number) {
        if (number == -1) {
            this.pageMemory = [];
            const initialPageId = document.body.dataset.initialPage || "title";
            await this.setPage(initialPageId);
        }
        if (this.pageMemory.length < number + 1 || number < -1) {
            console.log("ページ遷移の記録がないため戻ることはできません");
            return;
        }
        await this.setPages(this.pageMemory[this.pageMemory.length - number - 1]);
        this.pageMemory = this.pageMemory.slice(0, -number - 1);
        EventManager.executeEventsByClassName("backPages");
    }
    //すべてのページを非表示にする
    //invalidPanelが存在する場合は表示する
    setValid(valid) {
        this.displayingPages.forEach((page) => {
            page.style.display = valid ? "flex" : "none";
        });
        const invalidPanel = document.getElementById("invalidPanel");
        if (invalidPanel) {
            invalidPanel.style.display = valid ? "none" : "flex";
        }
        EventManager.executeEventsByClassName(valid ? "pageBecomeValid" : "pageBecomeInvalid");
    }
}
const pageManager = new PageManager();
