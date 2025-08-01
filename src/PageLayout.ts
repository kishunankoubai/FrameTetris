function getElements(query: string): HTMLElement[] {
    return [...document.querySelectorAll(query)] as HTMLElement[];
}

getElements(".label[data-size]").forEach((label) => {
    const size = parseInt(label.dataset.size || "1");
    label.style.fontSize = 3 * size + "vh";
});
