"use strict";
const nodes = document.getElementsByClassName('node');
const nameInput = document.getElementById('name-input');
const graphDiv = document.getElementById('graph');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drag = false;
let trackedNode;
const camera = {
    x: 0,
    y: 0
};
function CreateNode() {
    if (nameInput.value === '')
        return;
    const node = document.createElement("div");
    node.classList.add('node');
    node.innerHTML = `
		<img src="close.svg" onclick="RemoveNode(this)">
		<p>${nameInput.value}</p>
	`;
    trackedNode = node;
    drag = true;
    graphDiv.append(node);
}
function RemoveNode(button) {
    const node = button.parentNode;
    node.remove();
}
function ResetCamera() {
    camera.x = 0;
    camera.y = 0;
    Draw();
}
function DrawGrid() {
    document.body.classList.toggle("grid");
}
function DrawGraph() {
    const canvasWidth = document.documentElement.clientWidth;
    const canvasHeight = document.documentElement.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
    ];
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    for (const edge of edges) {
        const x1 = nodes[edge[0]].getBoundingClientRect().x + nodes[edge[0]].getBoundingClientRect().width / 2;
        const y1 = nodes[edge[0]].getBoundingClientRect().y + nodes[edge[0]].getBoundingClientRect().height / 2;
        const x2 = nodes[edge[1]].getBoundingClientRect().x + nodes[edge[1]].getBoundingClientRect().width / 2;
        const y2 = nodes[edge[1]].getBoundingClientRect().y + nodes[edge[1]].getBoundingClientRect().height / 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}
function Draw() {
    DrawGraph();
}
window.onload = Draw;
window.onresize = Draw;
document.onmousedown = e => {
    drag = true;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    let closestDistance = Number.POSITIVE_INFINITY;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    for (const node of nodes) {
        const nodeX = node.getBoundingClientRect().x;
        const nodeY = node.getBoundingClientRect().y;
        if (mouseX < nodeX || mouseX > nodeX + nodes[0].clientWidth ||
            mouseY < nodeY || mouseY > nodeY + nodes[0].clientHeight)
            continue;
        const distance = (nodeX - mouseX) ** 2 + (nodeY - mouseY) ** 2;
        if (distance < closestDistance) {
            closestDistance = distance;
            trackedNode = node;
        }
    }
};
let firstMouse = true;
document.onmouseup = () => {
    drag = false;
    trackedNode = null;
    firstMouse = true;
};
let prevX = 0;
let prevY = 0;
document.onmousemove = e => {
    if (!drag)
        return;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    if (trackedNode == null) {
        if (firstMouse) {
            prevX = mouseX;
            prevY = mouseY;
            firstMouse = false;
        }
        const xOffset = mouseX - prevX;
        const yOffset = mouseY - prevY;
        prevX = mouseX;
        prevY = mouseY;
        camera.x += xOffset;
        camera.y += yOffset;
        document.documentElement.style.setProperty("--camera-x", `${camera.x}px`);
        ;
        document.documentElement.style.setProperty("--camera-y", `${camera.y}px`);
        ;
        DrawGraph();
        return;
    }
    let x = mouseX - trackedNode.clientWidth / 2;
    let y = mouseY - trackedNode.clientHeight / 2;
    x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - trackedNode.clientWidth) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - trackedNode.clientHeight) - camera.y;
    const keyframes = {
        left: `${x}px`,
        top: `${y}px`
    };
    const options = {
        duration: 100,
        fill: "forwards"
    };
    trackedNode.animate(keyframes, options);
    setTimeout(Draw, 100);
};
