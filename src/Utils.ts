/**
 * 簡易的スリープ
 * @param ms 処理を止めるミリ秒数
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function printDot(left: number, top: number, color?: string) {
    const printDots = document.getElementsByClassName("printDot");
    if (printDots.length != 0) {
        [...printDots].forEach((element) => {
            element.remove();
        });
    }
    const dot = document.createElement("div");
    dot.className = "printDot";
    dot.style.width = "3px";
    dot.style.height = "3px";
    dot.style.position = "absolute";
    dot.style.top = top - 1 + "px";
    dot.style.left = left - 1 + "px";
    dot.style.backgroundColor = color || "#ff0000";
    let dotZIndex = 100;
    dot.style.zIndex = dotZIndex + "";
    document.body.appendChild(dot);
}

function mixArray(array: any[]) {
    const mixCount = (array.length * Math.log(array.length)) / 2;
    let a, b;
    let i, j;
    for (let k = 0; k < mixCount; k++) {
        i = Math.floor(Math.random() * array.length);
        j = Math.floor(Math.random() * array.length);
        a = array[i];
        b = array[j];
        array[i] = b;
        array[j] = a;
    }
}
