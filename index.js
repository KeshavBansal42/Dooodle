const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let elements = [];
let undoneElements = [];
let isDrawing = false;
let currentTool = 'tool-brush';

// if(!sessionStorage.getItem('myDoodle'))
// {
//     elements=JSON.parse(sessionStorage.getItem('myDooodle'));
// }

window.addEventListener('load', () => {
    if (sessionStorage.getItem('myDooodle')) {
        elements = JSON.parse(sessionStorage.getItem('myDooodle'));
        drawAllElements();
    }
})

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAllElements();
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const toolButtons = document.querySelectorAll('.tool-btn');

for (let index = 0; index < toolButtons.length; index++) {
    const element = toolButtons[index];
    element.addEventListener('click', () => {
        currentTool = element.id;
        for (let i = 0; i < toolButtons.length; i++) {
            const tool = toolButtons[i];
            tool.classList.remove('tool-btn-selected');
        }
        element.classList.add('tool-btn-selected');
        console.log(currentTool);
    })
}

function drawAllElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.type === 'tool-rect') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            ctx.strokeRect(element.startX, element.startY, width, height);
        }
        if (element.type === 'tool-circle') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let radius = Math.sqrt((width * width) + (height * height)) / 2;
            let centerX = (element.startX + element.lastX) / 2;
            let centerY = (element.startY + element.lastY) / 2;
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (element.type === 'tool-square') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let endCord = Math.max(Math.abs(width), Math.abs(height));
            ctx.strokeRect(element.startX, element.startY, (Math.abs(width) / width) * endCord, Math.abs(height) / height * endCord);
        }
        if (element.type === 'tool-triangle') {
            ctx.beginPath();
            ctx.moveTo(element.startX, element.startY);
            ctx.lineTo(element.lastX, element.lastY);
            ctx.lineTo(2 * element.startX - element.lastX, element.lastY);
            ctx.lineTo(element.startX, element.startY);
            ctx.stroke();
        }
        if (element.type === 'tool-brush') {
            ctx.beginPath();
            ctx.moveTo(element.points[0].X, element.points[0].Y);
            for (let i = 1; i < element.points.length; i++) {
                const cords = element.points[i];
                ctx.lineTo(cords.X, cords.Y);
            }
            ctx.stroke();
        }
        else if (element.type === 'tool-text') {
            ctx.font = "24px sans-serif";
            ctx.textBaseline = 'top';
            ctx.fillText(element.text, element.startX, element.startY);
        }
        if (element.type === 'tool-image') {
            const renderImg = new Image();
            renderImg.crossOrigin = 'anonymous';
            renderImg.src = element.url;
            if (renderImg.complete) {
                ctx.drawImage(renderImg, element.startX, element.startY, 200, 200);
            }
            else {
                renderImg.onload = () => {
                    ctx.drawImage(renderImg, element.startX, element.startY, 200, 200);
                }
            }
        }
    }
    // console.log(elements);
}

canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'tool-image') {
        // const img = new Image();
        // img.crossOrigin='anonymous';
        // img.src = 'https://picsum.photos/200/200?random=' + Math.random();
        // img.onload = () => {
        //     elements.push({
        //         type: 'image',
        //         url: img.src,
        //         startX: e.offsetX,
        //         startY: e.offsetY
        //     });
        //     drawAllElements();
        //     saveDrawing();
        // }
        elements.push({
            type: 'tool-image',
            url: 'https://picsum.photos/seed/' + Math.random() + '/200/200',
            startX: e.offsetX,
            startY: e.offsetY
        });
        drawAllElements();
        saveDrawing();
    }
    if (currentTool === 'tool-text') {
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.left = (e.clientX - 1) + 'px';
        textarea.style.top = (e.clientY - 1) + 'px';
        textarea.style.background = 'transparent';
        textarea.style.border = '1px dashed black';
        textarea.style.outline = 'none';
        textarea.style.lineHeight = '1';

        textarea.style.fontFamily = 'sans-serif';
        textarea.style.fontSize = '24px';
        textarea.style.margin = '0';
        textarea.style.padding = '0';

        document.body.appendChild(textarea);

        // textarea.focus();
        setTimeout(() => {
            textarea.focus();
        }, 0)

        textarea.addEventListener('blur', () => {
            if (textarea.value !== "") {
                elements.push({
                    type: 'tool-text',
                    text: textarea.value,
                    startX: e.offsetX,
                    startY: e.offsetY
                });
                drawAllElements();
                saveDrawing();
            }
            textarea.remove();
        })
    }
    else {
        isDrawing = true;
        undoneElements = [];
        let startX = e.offsetX;
        let startY = e.offsetY;
        if (currentTool === 'tool-brush') {
            elements.push({
                type: currentTool,
                points: [{ X: startX, Y: startY }]
            });
        }
        else {
            elements.push({
                type: currentTool,
                startX: startX,
                startY: startY,
                lastX: startX,
                lastY: startY
            });
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    let currX = e.offsetX;
    let currY = e.offsetY;
    if (currentTool === 'tool-brush') {
        elements[elements.length - 1].points.push({ X: currX, Y: currY });
    }
    else {
        elements[elements.length - 1].lastX = currX;
        elements[elements.length - 1].lastY = currY;
    }
    // console.log(elements);
    drawAllElements();
})

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveDrawing();
})

function undo() {
    if (elements.length !== 0) {
        undoneElements.push(elements[elements.length - 1]);
        elements.pop();
        drawAllElements();
        saveDrawing();
    }
}

function redo() {
    if (undoneElements.length !== 0) {
        elements.push(undoneElements[undoneElements.length - 1]);
        undoneElements.pop();
        drawAllElements();
        saveDrawing();
    }
}

const undoBtn = document.getElementById('action-undo');
undoBtn.addEventListener('click', undo);

const redoBtn = document.getElementById('action-redo');
redoBtn.addEventListener('click', redo)

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z')
        undo();
    if (e.ctrlKey && e.key === 'y')
        redo();
})

canvas.addEventListener('dblclick', (e) => {
    if (currentTool !== 'tool-select') return;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.type === 'tool-text') {
            let width = ctx.measureText(element.text).width;
            if ((e.offsetX >= element.startX && e.offsetX <= element.startX + width) && (e.offsetY >= element.startY && e.offsetY <= element.startY + 24)) {
                const textarea = document.createElement('textarea');
                textarea.style.position = 'fixed';
                textarea.style.left = element.startX - 1 + 'px';
                textarea.style.top = element.startY - 2 + 'px';
                textarea.style.background = 'transparent';
                textarea.style.border = '1px dashed black';
                textarea.style.outline = 'none';
                textarea.style.lineHeight = '1';

                textarea.style.fontFamily = 'sans-serif';
                textarea.style.fontSize = '24px'
                textarea.style.margin = '0';
                textarea.style.padding = '0';

                textarea.value = element.text;

                element.text = "";
                drawAllElements();

                document.body.appendChild(textarea);

                textarea.focus();

                textarea.addEventListener('blur', () => {
                    element.text = textarea.value;
                    drawAllElements();
                    saveDrawing();
                    textarea.remove();
                })
                break;
            }
        }
    }
})

function saveDrawing() {
    let saveData = JSON.stringify(elements);
    sessionStorage.setItem('myDooodle', saveData);
}

const clear = document.getElementById('action-clear');
clear.addEventListener('click',()=>{
    elements=[];
    undoneElements=[];
    drawAllElements();
    saveDrawing();
})

const downloadPNG = document.getElementById('action-download');
downloadPNG.addEventListener('click',()=>{
    let url = canvas.toDataURL('image/png');
    let link = document.createElement('a');
    link.href=url;
    link.download='myDooodle.png';
    link.click();
})