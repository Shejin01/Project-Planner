var nodes = document.getElementsByClassName('node');
var nameInput = document.getElementById('name-input');
var graphArea = document.getElementById('graph-area');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var drag = false;
var trackedNode;
var camera = {
    x: 0,
    y: 0
};
function CreateNode() {
    if (nameInput.value === '')
        return;
    var node = document.createElement("div");
    node.classList.add('node');
    node.innerHTML = "\n\t\t<img src=\"close.svg\" onclick=\"RemoveNode(this)\">\n\t\t<p>".concat(nameInput.value, "</p>\n\t");
    trackedNode = node;
    drag = true;
    graphArea.append(node);
}
function RemoveNode(button) {
    var node = button.parentNode;
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
    var canvasWidth = document.documentElement.clientWidth;
    var canvasHeight = document.documentElement.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    var edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
    ];
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var edge = edges_1[_i];
        var x1 = nodes[edge[0]].getBoundingClientRect().x + nodes[edge[0]].getBoundingClientRect().width / 2;
        var y1 = nodes[edge[0]].getBoundingClientRect().y + nodes[edge[0]].getBoundingClientRect().height / 2;
        var x2 = nodes[edge[1]].getBoundingClientRect().x + nodes[edge[1]].getBoundingClientRect().width / 2;
        var y2 = nodes[edge[1]].getBoundingClientRect().y + nodes[edge[1]].getBoundingClientRect().height / 2;
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
document.onmousedown = function (e) {
    drag = true;
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    var closestDistance = Number.POSITIVE_INFINITY;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    for (var _i = 0, _a = nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        var nodeX = node.getBoundingClientRect().x;
        var nodeY = node.getBoundingClientRect().y;
        if (mouseX < nodeX || mouseX > nodeX + nodes[0].clientWidth ||
            mouseY < nodeY || mouseY > nodeY + nodes[0].clientHeight)
            continue;
        var distance = Math.pow((nodeX - mouseX), 2) + Math.pow((nodeY - mouseY), 2);
        if (distance < closestDistance) {
            closestDistance = distance;
            trackedNode = node;
        }
    }
};
var firstMouse = true;
document.onmouseup = function () {
    drag = false;
    trackedNode = null;
    firstMouse = true;
};
var prevX = 0;
var prevY = 0;
function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}
document.onmousemove = function (e) {
    if (!drag)
        return;
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    if (trackedNode == null) {
        if (firstMouse) {
            prevX = mouseX;
            prevY = mouseY;
            firstMouse = false;
        }
        var xOffset = mouseX - prevX;
        var yOffset = mouseY - prevY;
        prevX = mouseX;
        prevY = mouseY;
        camera.x += xOffset;
        camera.y += yOffset;
        document.documentElement.style.setProperty("--camera-x", "".concat(camera.x, "px"));
        document.documentElement.style.setProperty("--camera-y", "".concat(camera.y, "px"));
        DrawGraph();
        return;
    }
    var x = mouseX - trackedNode.clientWidth / 2;
    var y = mouseY - trackedNode.clientHeight / 2;
    x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - trackedNode.clientWidth) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - trackedNode.clientHeight) - camera.y;
    var keyframes = {
        left: "".concat(x, "px"),
        top: "".concat(y, "px")
    };
    var options = {
        duration: 100,
        fill: "forwards"
    };
    trackedNode.animate(keyframes, options);
    setTimeout(Draw, 100);
};
