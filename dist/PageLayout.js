"use strict";
function getElements(query) {
    return [...document.querySelectorAll(query)];
}
getElements(".label[data-size]").forEach((label) => {
    const size = parseInt(label.dataset.size || "1");
    label.style.fontSize = 3 * size + "vh";
});
