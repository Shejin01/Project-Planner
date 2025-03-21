"use strict";
const nameInput = document.getElementById('name-input');
const graphDiv = document.getElementById('graph');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drag = false;
;
const nodeDivs = document.getElementsByClassName('node');
//const nodes : GraphNode[] = [];
const nodes = new Map();
const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4]
];
let lastId = 0;
const camera = { x: 0, y: 0 };
function UpdateCamera() {
    document.documentElement.style.setProperty("--camera-x", `${camera.x}px`);
    document.documentElement.style.setProperty("--camera-y", `${camera.y}px`);
}
const nodeSize = { x: 174, y: 85 };
function CreateNode() {
    if (nameInput.value === '')
        return;
    let node = {
        title: nameInput.value,
        position: { x: 0, y: 0 },
        id: lastId++
    };
    Create(node);
    drag = true;
    trackedId = node.id;
}
function Create(node) {
    var _a;
    if (node.title === '')
        return null;
    nodes.set(node.id, node);
    let nodeDiv = document.createElement("div");
    nodeDiv.classList.add('node');
    nodeDiv.style.left = `${node.position.x}px`;
    nodeDiv.style.top = `${node.position.y}px`;
    nodeDiv.dataset.id = (_a = node.id) === null || _a === void 0 ? void 0 : _a.toString();
    nodeDiv.innerHTML = `
		<img src="close.svg" onclick="RemoveNode(this)">
		<p>${node.title}</p>
	`;
    graphDiv.append(nodeDiv);
    return nodeDiv;
}
function RemoveNode(button) {
    const nodeDiv = button.parentNode;
    const nodeId = +nodeDiv.dataset.id;
    nodes.delete(nodeId);
    for (const element of nodeDivs) {
        if (element.dataset.id === nodeId.toString()) {
            element.remove();
            break;
        }
    }
    for (const edge of edges) {
        if (edge[0] === nodeId || edge[1] === nodeId) {
            edges.splice(edges.indexOf(edge));
        }
    }
    DrawGraph();
}
function ResetCamera() {
    camera.x = 0;
    camera.y = 0;
    UpdateCamera();
    DrawGraph();
}
// ------------------------ Graphics ------------------------
function ToggleGrid() {
    document.body.classList.toggle("grid");
}
function DrawGraph() {
    const canvasWidth = document.documentElement.clientWidth;
    const canvasHeight = document.documentElement.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    for (const edge of edges) {
        const node1 = nodes.get(edge[0]);
        const node2 = nodes.get(edge[1]);
        if (!node1 || !node2)
            continue;
        const x1 = node1.position.x + camera.x + nodeSize.x / 2;
        const y1 = node1.position.y + camera.y + nodeSize.y / 2;
        const x2 = node2.position.x + camera.x + nodeSize.x / 2;
        const y2 = node2.position.y + camera.y + nodeSize.y / 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}
// ------------------------ Event Handlers ------------------------
window.onload = DrawGraph;
window.onresize = DrawGraph;
let trackedId = undefined;
let prevMousePos = { x: 0, y: 0 };
document.onmousedown = e => {
    drag = true;
    const mousePos = { x: e.clientX, y: e.clientY };
    prevMousePos = mousePos;
    let closestDistance = Number.POSITIVE_INFINITY;
    // if (prevTrackedId !== undefined) {
    //     nodeDivs[prevTrackedId].style.zIndex = "0";
    // }
    for (const pair of nodes) {
        const node = pair[1];
        const nodePos = { x: node.position.x + camera.x, y: node.position.y + camera.y };
        if (mousePos.x < nodePos.x || mousePos.x > nodePos.x + nodeSize.x ||
            mousePos.y < nodePos.y || mousePos.y > nodePos.y + nodeSize.y)
            continue;
        const distance = (nodePos.x - mousePos.x) ** 2 + (nodePos.y - mousePos.y) ** 2;
        if (distance < closestDistance) {
            closestDistance = distance;
            trackedId = node.id;
        }
    }
};
document.onmouseup = () => {
    drag = false;
    trackedId = undefined;
};
document.onmousemove = e => {
    if (!drag)
        return;
    const mousePos = { x: e.clientX, y: e.clientY };
    if (trackedId === undefined) {
        const offset = { x: mousePos.x - prevMousePos.x, y: mousePos.y - prevMousePos.y };
        prevMousePos = mousePos;
        camera.x += offset.x;
        camera.y += offset.y;
        UpdateCamera();
        DrawGraph();
        return;
    }
    const node = nodes.get(trackedId);
    if (!node)
        return;
    let x = mousePos.x - nodeSize.x / 2;
    let y = mousePos.y - nodeSize.y / 2;
    x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - nodeSize.x) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - nodeSize.y) - camera.y;
    node.position = { x, y };
    const keyframes = {
        left: `${x}px`,
        top: `${y}px`
    };
    const options = {
        duration: 100,
        fill: "forwards"
    };
    //trackedNode.animate(keyframes, options);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    for (const nodeDiv of nodeDivs) {
        const nodeId = +nodeDiv.dataset.id;
        if (nodeId === trackedId) {
            nodeDiv.animate(keyframes, options);
            break;
        }
    }
    setTimeout(DrawGraph, 100);
};
Create({ title: "Project 1", position: { x: 200, y: 100 }, id: lastId++ });
Create({ title: "Project 2", position: { x: 500, y: 100 }, id: lastId++ });
Create({ title: "Project 3", position: { x: 500, y: 400 }, id: lastId++ });
Create({ title: "Project 4", position: { x: 200, y: 400 }, id: lastId++ });
Create({ title: "Project 5", position: { x: 350, y: 250 }, id: lastId++ });
