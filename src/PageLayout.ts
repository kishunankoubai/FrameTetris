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
    count: 50,
};

let data = structuredClone(initialData);

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
    if (labelNames.includes("count")) {
        getElement("#count").style.display = "block";
        getElement("#count").innerHTML = "Count : " + data.count;
    } else {
        getElement("#count").style.display = "none";
    }
}

function writeResult(resultNames: string[]) {
    let resultHTML = "";
    if (resultNames.includes("score")) {
        resultHTML += "Score : " + data.score + "<br>";
    }
    if (resultNames.includes("remove")) {
        resultHTML += "Remove : " + data.remove + "<br>";
    }
    getElement("#resultText").innerHTML = resultHTML;
}

function shake(millisecond: number) {
    const element: HTMLElement = document.getElementsByClassName("blockBase")[0] as HTMLElement;
    if (!element.onanimationend) {
        element.classList.add("shake");
        element.style.animationDuration = millisecond + "ms";
        element.onanimationend = () => {
            element.classList.remove("shake");
            element.onanimationend = null;
        };
    }
}

function brighten(elements: HTMLElement[]) {
    elements.forEach((element) => {
        if (!element.onanimationend) {
            element.classList.add("brighten");
            element.onanimationend = () => {
                element.classList.remove("brighten");
                element.onanimationend = null;
            };
        }
    });
}
