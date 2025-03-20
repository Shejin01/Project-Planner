const nameInput = document.getElementById('name-input') as HTMLInputElement ;
const graphDiv = document.getElementById('graph') as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let drag = false;

interface Vec2 {
    x: number,
    y: number
};

// ------------------------ Nodes ------------------------

interface GraphNode {
    title: string,
    position: Vec2,
    description?: string,
    id?: number
}
let lastId = 0;
const nodeDivs = document.getElementsByClassName('node') as HTMLCollectionOf<HTMLDivElement>;
const nodes : GraphNode[] = [];
let trackedId : number | undefined = undefined;
//let prevTrackedId : number | undefined = undefined;

const camera: Vec2 = { x: 0, y: 0 };
function UpdateCamera() {
    document.documentElement.style.setProperty("--camera-x", `${camera.x}px`);
    document.documentElement.style.setProperty("--camera-y", `${camera.y}px`);
}

const nodeSize: Vec2 = { x: 174, y: 85 };
function CreateNode() {
    if (nameInput.value === '') return;
    let node : GraphNode = {
        title: nameInput.value,
        position: { x: 0, y: 0 },
        id: lastId++
    };
    //trackedNode = Create(node);
    Create(node);
    trackedId = node.id;
    drag = true;
}


function Create(node: GraphNode): HTMLDivElement | null {
    //console.log(node.title);
    if (node.title === '') return null;
    nodes.push(node);
    let nodeDiv = document.createElement("div");
    nodeDiv.classList.add('node');
    nodeDiv.style.left = `${node.position.x}px`;
    nodeDiv.style.top = `${node.position.y}px`;
    nodeDiv.dataset.id = node.id?.toString();
    nodeDiv.innerHTML = `
		<img src="close.svg" onclick="RemoveNode(this)">
		<p>${node.title}</p>
	`;
    graphDiv.append(nodeDiv);
    return nodeDiv;
}

function RemoveNode(button: HTMLImageElement) {
    const nodeDiv = button.parentNode as HTMLDivElement;
    const nodeId : number = +(nodeDiv.dataset.id as string);
    if (trackedId === nodeId) trackedId = undefined;
    nodes[nodeId] = nodes[nodes.length-1];
    nodes.pop();
    nodeDivs[nodeId] = nodeDivs[nodeDivs.length-1];
    nodeDivs.item(nodeDivs.length-1)?.remove();
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

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4]
    ];

    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;

    for (const edge of edges) {
        const x1 = nodes[edge[0]].position.x + camera.x + nodeSize.x / 2;
        const y1 = nodes[edge[0]].position.y + camera.y + nodeSize.y / 2;
        
		const x2 = nodes[edge[1]].position.x + camera.x + nodeSize.x / 2;
        const y2 = nodes[edge[1]].position.y + camera.y + nodeSize.y / 2;

		ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// ------------------------ Event Handlers ------------------------

window.onload = DrawGraph;
window.onresize = DrawGraph;

let prevMousePos: Vec2 = { x: 0, y: 0 };
document.onmousedown = e => {
    drag = true;

    const mousePos: Vec2 = { x: e.clientX, y: e.clientY };
    prevMousePos = mousePos;

    let closestDistance = Number.POSITIVE_INFINITY;

    // if (prevTrackedId !== undefined) {
    //     nodeDivs[prevTrackedId].style.zIndex = "0";
    // }
    for (const node of nodes) {
        const nodePos: Vec2 = { x: node.position.x + camera.x, y: node.position.y + camera.y };

        if (mousePos.x < nodePos.x || mousePos.x > nodePos.x + nodeSize.x ||
            mousePos.y < nodePos.y || mousePos.y > nodePos.y + nodeSize.y)
            continue;
		
        const distance = (nodePos.x - mousePos.x)**2 + (nodePos.y - mousePos.y)**2;

        if (distance < closestDistance) {
            closestDistance = distance;
            trackedId = node.id;
        }
    }
    if (trackedId !== undefined) {
        nodeDivs[trackedId].style.zIndex = "1";
    }
};

document.onmouseup = () => {
    drag = false;
    //prevTrackedId = trackedId;
    trackedId = undefined;
};

document.onmousemove = e => {
    if (!drag) return;
	
    const mousePos: Vec2 = { x: e.clientX, y: e.clientY };

    if (trackedId === undefined) {
        const offset: Vec2 = { x: mousePos.x - prevMousePos.x, y: mousePos.y - prevMousePos.y };
        prevMousePos = mousePos;

        camera.x += offset.x;
        camera.y += offset.y;
        UpdateCamera();
        
        DrawGraph();
        return;
    }
    
	let x = mousePos.x - nodeSize.x / 2;
    let y = mousePos.y - nodeSize.y / 2;
    
	x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - nodeSize.x) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - nodeSize.y) - camera.y;

    nodes[trackedId].position = { x, y };

	const keyframes = {
        left: `${x}px`,
        top: `${y}px`
    };
    const options : KeyframeAnimationOptions = {
        duration: 100,
        fill: "forwards"
    };
    //trackedNode.animate(keyframes, options);
    nodeDivs[trackedId].animate(keyframes, options);

	setTimeout(DrawGraph, 100);
};

Create({ title: "Project 1", position: { x: 200, y: 100}, id: lastId++ });
Create({ title: "Project 2", position: { x: 500, y: 100}, id: lastId++ });
Create({ title: "Project 3", position: { x: 500, y: 400}, id: lastId++ });
Create({ title: "Project 4", position: { x: 200, y: 400}, id: lastId++ });
Create({ title: "Project 5", position: { x: 350, y: 250}, id: lastId++ });