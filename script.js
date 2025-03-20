var nameInput = document.getElementById('name-input');
var graphDiv = document.getElementById('graph');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var drag = false;
;
var lastId = 0;
var nodeDivs = document.getElementsByClassName('node');
var nodes = [];
var trackedId = undefined;
//let prevTrackedId : number | undefined = undefined;
var camera = { x: 0, y: 0 };
function UpdateCamera() {
    document.documentElement.style.setProperty("--camera-x", "".concat(camera.x, "px"));
    document.documentElement.style.setProperty("--camera-y", "".concat(camera.y, "px"));
}
var nodeSize = { x: 174, y: 85 };
function CreateNode() {
    if (nameInput.value === '')
        return;
    var node = {
        title: nameInput.value,
        position: { x: 0, y: 0 },
        id: lastId++
    };
    //trackedNode = Create(node);
    Create(node);
    trackedId = node.id;
    drag = true;
}
function Create(node) {
    var _a;
    //console.log(node.title);
    if (node.title === '')
        return null;
    nodes.push(node);
    var nodeDiv = document.createElement("div");
    nodeDiv.classList.add('node');
    nodeDiv.style.left = "".concat(node.position.x, "px");
    nodeDiv.style.top = "".concat(node.position.y, "px");
    nodeDiv.dataset.id = (_a = node.id) === null || _a === void 0 ? void 0 : _a.toString();
    nodeDiv.innerHTML = "\n\t\t<img src=\"close.svg\" onclick=\"RemoveNode(this)\">\n\t\t<p>".concat(node.title, "</p>\n\t");
    graphDiv.append(nodeDiv);
    return nodeDiv;
}
function RemoveNode(button) {
    var _a;
    var nodeDiv = button.parentNode;
    var nodeId = +nodeDiv.dataset.id;
    if (trackedId === nodeId)
        trackedId = undefined;
    nodes[nodeId] = nodes[nodes.length - 1];
    nodes.pop();
    nodeDivs[nodeId] = nodeDivs[nodeDivs.length - 1];
    (_a = nodeDivs.item(nodeDivs.length - 1)) === null || _a === void 0 ? void 0 : _a.remove();
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
    var canvasWidth = document.documentElement.clientWidth;
    var canvasHeight = document.documentElement.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    var edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4]
    ];
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var edge = edges_1[_i];
        var x1 = nodes[edge[0]].position.x + camera.x + nodeSize.x / 2;
        var y1 = nodes[edge[0]].position.y + camera.y + nodeSize.y / 2;
        var x2 = nodes[edge[1]].position.x + camera.x + nodeSize.x / 2;
        var y2 = nodes[edge[1]].position.y + camera.y + nodeSize.y / 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}
// ------------------------ Event Handlers ------------------------
window.onload = DrawGraph;
window.onresize = DrawGraph;
var prevMousePos = { x: 0, y: 0 };
document.onmousedown = function (e) {
    drag = true;
    var mousePos = { x: e.clientX, y: e.clientY };
    prevMousePos = mousePos;
    var closestDistance = Number.POSITIVE_INFINITY;
    // if (prevTrackedId !== undefined) {
    //     nodeDivs[prevTrackedId].style.zIndex = "0";
    // }
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        var nodePos = { x: node.position.x + camera.x, y: node.position.y + camera.y };
        if (mousePos.x < nodePos.x || mousePos.x > nodePos.x + nodeSize.x ||
            mousePos.y < nodePos.y || mousePos.y > nodePos.y + nodeSize.y)
            continue;
        var distance = Math.pow((nodePos.x - mousePos.x), 2) + Math.pow((nodePos.y - mousePos.y), 2);
        if (distance < closestDistance) {
            closestDistance = distance;
            trackedId = node.id;
        }
    }
    if (trackedId !== undefined) {
        nodeDivs[trackedId].style.zIndex = "1";
    }
};
document.onmouseup = function () {
    drag = false;
    //prevTrackedId = trackedId;
    trackedId = undefined;
};
document.onmousemove = function (e) {
    if (!drag)
        return;
    var mousePos = { x: e.clientX, y: e.clientY };
    if (trackedId === undefined) {
        var offset = { x: mousePos.x - prevMousePos.x, y: mousePos.y - prevMousePos.y };
        prevMousePos = mousePos;
        camera.x += offset.x;
        camera.y += offset.y;
        UpdateCamera();
        DrawGraph();
        return;
    }
    var x = mousePos.x - nodeSize.x / 2;
    var y = mousePos.y - nodeSize.y / 2;
    x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - nodeSize.x) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - nodeSize.y) - camera.y;
    nodes[trackedId].position = { x: x, y: y };
    var keyframes = {
        left: "".concat(x, "px"),
        top: "".concat(y, "px")
    };
    var options = {
        duration: 100,
        fill: "forwards"
    };
    //trackedNode.animate(keyframes, options);
    nodeDivs[trackedId].animate(keyframes, options);
    setTimeout(DrawGraph, 100);
};
Create({ title: "Project 1", position: { x: 200, y: 100 }, id: lastId++ });
Create({ title: "Project 2", position: { x: 500, y: 100 }, id: lastId++ });
Create({ title: "Project 3", position: { x: 500, y: 400 }, id: lastId++ });
Create({ title: "Project 4", position: { x: 200, y: 400 }, id: lastId++ });
Create({ title: "Project 5", position: { x: 350, y: 250 }, id: lastId++ });
