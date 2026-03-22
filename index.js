const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let elements=[];
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
            ctx.strokeRect(element.startX,element.startY,element.width,element.height);
        }
        if(element.type==='tool-circle')
        {
            ctx.beginPath()
            ctx.arc(element.startX,element.startY,element.radius,0,2*Math.PI);
            ctx.stroke();
        }
        if(element.type==='tool-square')
        {
            endCord = Math.max(Math.abs(element.width),Math.abs(element.height));
            ctx.strokeRect(element.startX,element.startY,(Math.abs(element.width)/element.width)*endCord,Math.abs(element.height)/element.height*endCord);
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
        width: 0,
        height: 0,
        radius: 0
    });
});

canvas.addEventListener('mousemove',(e)=>{
    if(!isDrawing) return;
    let currX=e.offsetX;
    let currY=e.offsetY;
    elements[elements.length-1].width=currX-elements[elements.length-1].startX;
    elements[elements.length-1].height=currY-elements[elements.length-1].startY;
    elements[elements.length-1].radius=Math.sqrt((elements[elements.length-1].width*elements[elements.length-1].width)+(elements[elements.length-1].height*elements[elements.length-1].height));
    console.log(elements);
    drawAllElements();
})

canvas.addEventListener('mouseup',()=>{
    isDrawing=false;
})