function getElements(query: string): HTMLElement[] {
    return [...document.querySelectorAll(query)] as HTMLElement[];
}

function getElement(query: string): HTMLElement {
    return document.querySelector(query) as HTMLElement;
}

getElements(".label[data-size]").forEach((label) => {
    const size = parseInt(label.dataset.size || "1");
    label.style.fontSize = 3 * size + "vh";
});

const initialData = {
    score: 0,
    remove: 0,
};

let data = {
    score: 0,
    remove: 0,
};

function repaintLabels(labelNames: string[]) {
    if (labelNames.includes("score")) {
        getElement("#score").style.display = "block";
        getElement("#score").innerHTML = "Score : " + data.score;
    } else {
        getElement("#score").style.display = "none";
    }
    if (labelNames.includes("remove")) {
        getElement("#remove").style.display = "block";
        getElement("#remove").innerHTML = "Remove : " + data.remove;
    } else {
        getElement("#remove").style.display = "none";
    }
}

function writeResult(resultNames: string[]) {
    let resultHTML = "";
    if (resultNames.includes("score")) {
        resultHTML += "<br>Score : " + data.score;
    }
    if (resultNames.includes("remove")) {
        resultHTML += "<br>Remove : " + data.remove;
    }
    resultHTML += "<br>";
    getElement("#resultText").innerHTML = resultHTML;
}
