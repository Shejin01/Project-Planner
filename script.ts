const nameInput = document.getElementById('name-input') as HTMLInputElement ;
const colorInput = document.getElementById('color-input') as HTMLInputElement ;
const statusInput = document.getElementById('status-input') as HTMLInputElement ;
const graphDiv = document.getElementById('graph') as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const linkModeButton = document.getElementById('link-mode') as HTMLInputElement;

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
    status?: string,
    color?: string,
    id?: number
}
const nodeDivs = document.getElementsByClassName('node') as HTMLCollectionOf<HTMLDivElement>;
let nodes = new Map<number, GraphNode>();
let edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4]
];
let linkSelectID1 : number | undefined = undefined;
let linkSelectID2 : number | undefined = undefined;
let lastId = 0;

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
        status: statusInput.value,
        color: colorInput.value,
        id: lastId++
    };
    Create(node);
    drag = true;
    trackedId = node.id;
}

function SetProperty() {
    const selectedNode = nodes.get(selectedId as number) as GraphNode;
    selectedNode.title = nameInput.value as string;
    selectedNode.status = statusInput.value || '';
    selectedNode.color = colorInput.value || "#333333";
    nodeDivs[selectedId as number].children[1].innerHTML = selectedNode.title;
    nodeDivs[selectedId as number].children[2].innerHTML = (selectedNode.status === undefined) ? '' : `(${selectedNode.status})`;
    nodeDivs[selectedId as number].style.borderBottomColor = selectedNode.color;
}

function Create(node: GraphNode) {
    if (node.title === '') return null;
    if (nodes == null) nodes = new Map<number, GraphNode>();
    nodes.set(node.id as number, node);
    DrawNode(node);
}

function DrawNode(node: GraphNode) {
    let nodeDiv = document.createElement("div");
    nodeDiv.classList.add('node');
    nodeDiv.style.left = `${node.position.x}px`;
    nodeDiv.style.top = `${node.position.y}px`;
    nodeDiv.style.borderBottomColor = node.color || "#333333";
    nodeDiv.dataset.id = node.id?.toString();
    const status = (node.status === undefined) ? '' : `(${node.status})`;
    nodeDiv.innerHTML = `
		<img src="icons/close.svg" onclick="RemoveNode(this)">
		<p class="title">${node.title}</p>
        <p class="status">${status}</p>
	`;
    graphDiv.append(nodeDiv);
}

function RemoveNode(button: HTMLImageElement) {
    const nodeDiv = button.parentNode as HTMLDivElement;
    const nodeId : number = +(nodeDiv.dataset.id as string);
    nodes.delete(nodeId);
    for (const element of nodeDivs) {
        if (element.dataset.id === nodeId.toString()) {
            element.remove();
            break;
        }
    }
    for (let i = edges.length-1; i >= 0; i--) {
        const edge = edges[i];
        if (edge[0] === nodeId || edge[1] === nodeId) {
            edges.splice(edges.indexOf(edge), 1);
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
    if (edges == null) return;

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

        if (!node1 || !node2) continue;

        const x1 = node1.position.x + camera.x + nodeSize.x / 2;
        const y1 = node1.position.y + camera.y + nodeSize.y / 2;
        
		const x2 = node2.position.x + camera.x + nodeSize.x / 2;
        const y2 = node2.position.y + camera.y + nodeSize.y / 2;

		ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// ------------------------ Save & Load ------------------------

function replacer(key: any, value: any) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: [...value], // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}
function reviver(key: any, value: any) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

function Save() {
    const newNodes = new Map<number, GraphNode>();

    let index = 0;
    for (const element of nodes) {
        if (element[1].id !== index) {
            for (const edge of edges) {
                if (edge[0] === element[1].id) edge[0] = index;
                if (edge[1] === element[1].id) edge[1] = index;
            }
        }
        index++;
    }
    index = 0;
    for (const element of nodes) {
        if (element[1].id === index) {
            newNodes.set(element[1].id, element[1]);
        }
        else {
            element[1].id = index;
            newNodes.set(index, element[1]);
        }
        index++;
    }

    localStorage.setItem("nodes", JSON.stringify(newNodes, replacer));
    localStorage.setItem("edges", JSON.stringify(edges, replacer));
    localStorage.setItem("lastId", lastId.toString());
}

function Load() {
    nodes = JSON.parse(localStorage.getItem("nodes") as string, reviver);
    edges = JSON.parse(localStorage.getItem("edges") as string, reviver);
    lastId = +(localStorage.getItem("lastId") as string);
    graphDiv.innerHTML = '';
    for (const pair of nodes) {
        const node = pair[1];
        DrawNode(node);
    }
    DrawGraph();
}

// ------------------------ Event Handlers ------------------------

window.onload = Load;
window.onbeforeunload = Save;
window.onresize = DrawGraph;

let trackedId : number | undefined = undefined;
let selectedId  : number | undefined = undefined;
let selected = false;
let prevMousePos: Vec2 = { x: 0, y: 0 };
document.onmousedown = e => {
    drag = true;

    const mousePos: Vec2 = { x: e.clientX, y: e.clientY };
    prevMousePos = mousePos;

    let closestDistance = Number.POSITIVE_INFINITY;

    if (nodes == null) return;
    for (const pair of nodes) {
        const node = pair[1];
        const nodePos: Vec2 = { x: node.position.x + camera.x, y: node.position.y + camera.y };

        if (mousePos.x < nodePos.x || mousePos.x > nodePos.x + nodeSize.x ||
            mousePos.y < nodePos.y || mousePos.y > nodePos.y + nodeSize.y) {
            continue;
        }
		
        const distance = (nodePos.x - mousePos.x)**2 + (nodePos.y - mousePos.y)**2;

        if (distance < closestDistance) {
            closestDistance = distance;
            trackedId = node.id;
            selected = true;
            selectedId = node.id;
        }
    }

    if (linkModeButton.checked && trackedId !== undefined) {
        if (linkSelectID1 === undefined) {
            linkSelectID1 = trackedId;
        } else if (linkSelectID2 === undefined && linkSelectID1 !== trackedId) {
            linkSelectID2 = trackedId;

            if (edges == null) edges = new Array<number[]>();
            let newEdge = [linkSelectID1, linkSelectID2];
            const edgeExistsIndex = edges.findIndex(edge => Compare(edge, newEdge));

            if (edgeExistsIndex !== -1) {
                edges.splice(edgeExistsIndex, 1);
            }
            else edges.push([linkSelectID1, linkSelectID2]);

            linkSelectID1 = undefined;
            linkSelectID2 = undefined;
            DrawGraph();
        }
    }

    if (selected) {
        const trackedNode = nodes.get(selectedId as number);
        nameInput.value = trackedNode?.title || '';
        colorInput.value = trackedNode?.color || '#333333';
        statusInput.value = trackedNode?.status || '';
    }
    selected = false;
};

function Compare(a: number[], b: number[]) {
    return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

document.onmouseup = () => {
    drag = false;
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
    
    const node = nodes.get(trackedId);
    if (!node) return;

	let x = mousePos.x - nodeSize.x / 2;
    let y = mousePos.y - nodeSize.y / 2;
    
	x = Math.min(Math.max(x, 0), document.documentElement.clientWidth - nodeSize.x) - camera.x;
    y = Math.min(Math.max(y, 0), document.documentElement.clientHeight - nodeSize.y) - camera.y;

    node.position = { x, y };

	const keyframes = {
        left: `${x}px`,
        top: `${y}px`
    };
    const options : KeyframeAnimationOptions = {
        duration: 100,
        fill: "forwards"
    };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        for (const nodeDiv of nodeDivs as any) {
        const nodeId = +(nodeDiv.dataset.id as string);
        if (nodeId === trackedId) {
            nodeDiv.animate(keyframes, options);
            break;
        }
    }

	setTimeout(DrawGraph, 100);
};

function DebugCreate() {
    Create({ title: "Project 1", position: { x: 200, y: 100}, id: lastId++ });
    Create({ title: "Project 2", position: { x: 500, y: 100}, id: lastId++ });
    Create({ title: "Project 3", position: { x: 500, y: 400}, id: lastId++ });
    Create({ title: "Project 4", position: { x: 200, y: 400}, id: lastId++ });
    Create({ title: "Project 5", position: { x: 350, y: 250}, id: lastId++ });
    edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4]];
    DrawGraph();
}

function DebugColor() {
    Create({ title: "Project 5", position: { x: 350, y: 250}, color: "#DE1A1A", id: lastId++});
    DrawGraph();
}