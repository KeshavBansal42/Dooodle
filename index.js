const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let elements=[];
let undoneElements=[];
let isDrawing=false;
let currentTool = 'tool-brush';

function resizeCanvas() {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize',resizeCanvas);

const toolButtons = document.querySelectorAll('.tool-btn');

for (let index = 0; index < toolButtons.length; index++) {
    const element = toolButtons[index];
    element.addEventListener('click',()=> {
        currentTool=element.id;
        for (let i = 0; i < toolButtons.length; i++) {
            const tool = toolButtons[i];
            tool.classList.remove('tool-btn-selected');
        }
        element.classList.add('tool-btn-selected');
        console.log(currentTool);
    })
}

function drawAllElements() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if(element.type==='tool-rect')
        {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            ctx.strokeRect(element.startX,element.startY,width,height);
        }
        if(element.type==='tool-circle')
        {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let radius = Math.sqrt((width*width)+(height*height))/2;
            let centerX = (element.startX+element.lastX)/2;
            let centerY = (element.startY+element.lastY)/2;
            ctx.beginPath()
            ctx.arc(centerX,centerY,radius,0,2*Math.PI);
            ctx.stroke();
        }
        if(element.type==='tool-square')
        {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let endCord = Math.max(Math.abs(width),Math.abs(height));
            ctx.strokeRect(element.startX,element.startY,(Math.abs(width)/width)*endCord,Math.abs(height)/height*endCord);
        }
        if(element.type==='tool-triangle')
        {
            ctx.beginPath();
            ctx.moveTo(element.startX,element.startY);
            ctx.lineTo(element.lastX,element.lastY);
            ctx.lineTo(2*element.startX-element.lastX,element.lastY);
            ctx.lineTo(element.startX,element.startY);
            ctx.stroke();
        }
    }
    console.log(elements);
}

canvas.addEventListener('mousedown',(e)=>{
    isDrawing=true;
    let startX=e.offsetX;
    let startY=e.offsetY;
    elements.push({
        type: currentTool,
        startX: startX,
        startY: startY,
        // width: 0,
        // height: 0,
        // radius: 0
        lastX: 0,
        lastY: 0
    });
});

canvas.addEventListener('mousemove',(e)=>{
    if(!isDrawing) return;
    let currX=e.offsetX;
    let currY=e.offsetY;
    // elements[elements.length-1].width=currX-elements[elements.length-1].startX;
    // elements[elements.length-1].height=currY-elements[elements.length-1].startY;
    // elements[elements.length-1].radius=Math.sqrt((elements[elements.length-1].width*elements[elements.length-1].width)+(elements[elements.length-1].height*elements[elements.length-1].height));
    elements[elements.length-1].lastX=currX;
    elements[elements.length-1].lastY=currY;
    console.log(elements);
    drawAllElements();
})

canvas.addEventListener('mouseup',()=>{
    isDrawing=false;
})

function undo() {
    if(elements.length!==0)
    {
        undoneElements.push(elements[elements.length-1]);
        elements.pop();
        drawAllElements();
    }
}

function redo() {
    if(undoneElements.length!==0)
    {
        elements.push(undoneElements[undoneElements.length-1]);
        undoneElements.pop();
        drawAllElements();
    }
}

const undoBtn = document.getElementById('action-undo');
undoBtn.addEventListener('click',undo);

const redoBtn = document.getElementById('action-redo');
redoBtn.addEventListener('click',redo)

window.addEventListener('keydown',(e)=>{
    if(e.ctrlKey&&e.key==='z')
        undo();
    if(e.ctrlKey&&e.key==='y')
        redo();
})