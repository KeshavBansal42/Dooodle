const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let elements = [];
let undoneElements = [];
let isDrawing = false;
let currentTool = 'tool-brush';
let sliderTextVal = document.getElementById('slider-value-text'); //display for the selected width
let selectedElementIndex = null;
let dragStartX = null;
let dragStartY = null;

//input stroke color
let inputColor = '#000000';
document.getElementById('color-input').addEventListener('input', () => {
    inputColor = document.getElementById('color-input').value;
    sessionStorage.setItem('color', inputColor);
    if (selectedElementIndex !== null) {
        elements[selectedElementIndex].color = inputColor;
        drawAllElements();
        saveDrawing();
    }
    console.log(inputColor);
})

//input stroke width
let inputWidth = '1';
document.getElementById('width-input').addEventListener('input', () => {
    inputWidth = document.getElementById('width-input').value;
    sliderTextVal.innerHTML = inputWidth;
    sessionStorage.setItem('width', inputWidth);
    if (selectedElementIndex !== null) {
        elements[selectedElementIndex].width = inputWidth;
        drawAllElements();
        saveDrawing();
    }
});

let bgcolor = '#ffffff';
// document.getElementById('bg-color-picker').value = '#ffffff';
document.getElementById('bg-color-picker').addEventListener('input', () => {
    bgcolor = document.getElementById('bg-color-picker').value;
    sessionStorage.setItem('bgcolor', bgcolor);
    drawAllElements();
})

window.addEventListener('load', () => {
    console.log(sessionStorage);
    if (sessionStorage.getItem('last-tool')) {
        currentTool = sessionStorage.getItem('last-tool');
        document.getElementById(currentTool).click();
    }
    if (sessionStorage.getItem('myDooodle')) {
        elements = JSON.parse(sessionStorage.getItem('myDooodle'));
        if (sessionStorage.getItem('theme')) {
            console.log(sessionStorage.getItem('theme'))
            if (sessionStorage.getItem('theme') === 'dark') {
                document.body.classList.toggle('dark-mode')
            }
        }
    }
    if (sessionStorage.getItem('color')) {
        inputColor = sessionStorage.getItem('color');
        document.getElementById('color-input').value = sessionStorage.getItem('color');
    }
    if (sessionStorage.getItem('width')) {
        inputWidth = sessionStorage.getItem('width');
        sliderTextVal.innerHTML = inputWidth;
        document.getElementById('width-input').value = sessionStorage.getItem('width');
    }
    if (sessionStorage.getItem('bgcolor')) {
        bgcolor = sessionStorage.getItem('bgcolor');
        document.getElementById('bg-color-picker').value = sessionStorage.getItem('bgcolor');
    }
    drawAllElements();
})

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAllElements();
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const darkModeToggle = document.getElementById('theme-toggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (sessionStorage.getItem('theme')) {
        if (sessionStorage.getItem('theme') === 'dark')
            sessionStorage.setItem('theme', 'light');
        else
            sessionStorage.setItem('theme', 'dark');
    }
    else
        sessionStorage.setItem('theme', 'dark');
    console.log(sessionStorage);
    drawAllElements();
})

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
        sessionStorage.setItem('last-tool', currentTool);
        console.log(currentTool);

        selectedElementIndex = null;
        drawAllElements();
    })
}

function getBoundingBox(element) {
    let minX, minY, maxX, maxY;

    if (element.type === 'tool-brush') {
        minX = element.points[0].X; maxX = element.points[0].X;
        minY = element.points[0].Y; maxY = element.points[0].Y;
        for (let i = 1; i < element.points.length; i++) {
            let pt = element.points[i];
            if (pt.X < minX) minX = pt.X;
            if (pt.X > maxX) maxX = pt.X;
            if (pt.Y < minY) minY = pt.Y;
            if (pt.Y > maxY) maxY = pt.Y;
        }
    }
    else if (element.type === 'tool-circle') {

        let w = element.lastX - element.startX;
        let h = element.lastY - element.startY;
        let r = Math.sqrt(w * w + h * h) / 2;
        let cx = (element.startX + element.lastX) / 2;
        let cy = (element.startY + element.lastY) / 2;
        minX = cx - r; maxX = cx + r;
        minY = cy - r; maxY = cy + r;

    }
    else if (element.type === 'tool-triangle') {

        let x1 = element.startX, y1 = element.startY;
        let x2 = element.lastX, y2 = element.lastY;
        let x3 = 2 * element.startX - element.lastX, y3 = element.lastY;
        minX = Math.min(x1, x2, x3); maxX = Math.max(x1, x2, x3);
        minY = Math.min(y1, y2, y3); maxY = Math.max(y1, y2, y3);

    }
    else if (element.type === 'tool-square') {

        let w = element.lastX - element.startX;
        let h = element.lastY - element.startY;
        let endCord = Math.max(Math.abs(w), Math.abs(h));
        let trueLastX = element.startX + (Math.abs(w) / (w || 1)) * endCord;
        let trueLastY = element.startY + (Math.abs(h) / (h || 1)) * endCord;
        minX = Math.min(element.startX, trueLastX); maxX = Math.max(element.startX, trueLastX);
        minY = Math.min(element.startY, trueLastY); maxY = Math.max(element.startY, trueLastY);

    }
    // else if (element.type === 'tool-text') {

    //     ctx.font = "24px sans-serif";
    //     let w = ctx.measureText(element.text).width;
    //     minX = element.startX; maxX = element.startX + w;
    //     minY = element.startY; maxY = element.startY + 24;

    // }
    else if (element.type === 'tool-image') {

        minX = element.startX; maxX = element.lastX;
        minY = element.startY; maxY = element.lastY;

    }
    else {

        minX = Math.min(element.startX, element.lastX);
        maxX = Math.max(element.startX, element.lastX);
        minY = Math.min(element.startY, element.lastY);
        maxY = Math.max(element.startY, element.lastY);

    }

    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function drawAllElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.type === 'tool-rect') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            ctx.lineWidth = element.width;
            ctx.strokeStyle = element.color;
            ctx.strokeRect(element.startX, element.startY, width, height);
        }
        else if (element.type === 'tool-circle') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let radius = Math.sqrt((width * width) + (height * height)) / 2;
            let centerX = (element.startX + element.lastX) / 2;
            let centerY = (element.startY + element.lastY) / 2;
            ctx.lineWidth = element.width;
            ctx.strokeStyle = element.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (element.type === 'tool-square') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            let endCord = Math.max(Math.abs(width), Math.abs(height));
            ctx.lineWidth = element.width;
            ctx.strokeStyle = element.color;
            ctx.strokeRect(element.startX, element.startY, (Math.abs(width) / width) * endCord, Math.abs(height) / height * endCord);
        }
        else if (element.type === 'tool-triangle') {
            ctx.strokeStyle = element.color;
            ctx.lineWidth = element.width;
            ctx.beginPath();
            ctx.moveTo(element.startX, element.startY);
            ctx.lineTo(element.lastX, element.lastY);
            ctx.lineTo(2 * element.startX - element.lastX, element.lastY);
            ctx.lineTo(element.startX, element.startY);
            ctx.stroke();
        }
        else if (element.type === 'tool-brush') {
            ctx.strokeStyle = element.color;
            ctx.lineWidth = element.width;
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
            ctx.fillStyle = element.color;
            ctx.textBaseline = 'top';
            ctx.fillText(element.text, element.startX, element.startY);
        }
        else if (element.type === 'tool-image') {
            const renderImg = new Image();
            renderImg.crossOrigin = 'anonymous';
            renderImg.src = element.url;
            if (renderImg.complete) {
                let width = element.lastX - element.startX;
                let height = element.lastY - element.startY;
                ctx.drawImage(renderImg, element.startX, element.startY, width, height);
            }
            else {
                renderImg.onload = () => {
                    let width = element.lastX - element.startX;
                    let height = element.lastY - element.startY;
                    ctx.drawImage(renderImg, element.startX, element.startY, width, height);
                    // ctx.drawImage(renderImg, element.startX, element.startY, 200, 200);
                }
            }
        }
        else if (element.type === 'tool-image-temp') {
            let width = element.lastX - element.startX;
            let height = element.lastY - element.startY;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(element.startX, element.startY, width, height);
            ctx.setLineDash([]);
        }
        console.log(elements);
    }
    if (selectedElementIndex !== null) {
        const selectedEl = elements[selectedElementIndex];
        const box = getBoundingBox(selectedEl);

        let currentStroke = ctx.strokeStyle;
        ctx.strokeStyle = 'black';

        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        ctx.strokeRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8);

        ctx.setLineDash([]);
        ctx.strokeStyle = currentStroke;
    }
}

function isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    return Math.abs(area1 + area2 + area3 - areaOrig) < 1;
}

function onMouseDown(e) {
    if (currentTool === 'tool-image') {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();

        let X = e.clientX - rect.left;
        let Y = e.clientY - rect.top;

        elements.push({
            type: 'tool-image-temp',
            url: '',
            startX: X,
            startY: Y,
            lastX: X,
            lastY: Y
        });
    }
    else if (currentTool === 'tool-text') {
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.left = (e.clientX - 1) + 'px';
        textarea.style.top = (e.clientY - 1) + 'px';
        textarea.style.background = 'transparent';
        textarea.style.border = '1px dashed';
        if (sessionStorage.getItem('theme')) {
            if (sessionStorage.getItem('theme') === 'light') {
                textarea.style.borderColor = 'black';
                textarea.style.color = inputColor;
            } else {
                textarea.style.borderColor = 'white';
                textarea.style.color = inputColor;
            }
        }
        textarea.style.outline = 'none';
        textarea.style.lineHeight = '1';

        textarea.style.fontFamily = 'sans-serif';
        textarea.style.fontSize = '24px';
        textarea.style.margin = '0';
        textarea.style.padding = '0';

        document.body.appendChild(textarea);

        setTimeout(() => {
            textarea.focus();
        }, 0)

        textarea.addEventListener('blur', () => {
            if (textarea.value !== "") {

                const rect = canvas.getBoundingClientRect();

                let X = e.clientX - rect.left;
                let Y = e.clientY - rect.top;

                elements.push({
                    type: 'tool-text',
                    text: textarea.value,
                    startX: X,
                    startY: Y,
                    color: inputColor
                });
                drawAllElements();
                saveDrawing();
            }
            textarea.remove();
        })
    }
    else if (currentTool === 'tool-select') {

        const rect = canvas.getBoundingClientRect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        selectedElementIndex = null;

        for (let index = elements.length - 1; index >= 0; index--) {
            const element = elements[index];

            let isHit = false;

            if (element.type === 'tool-rect') {
                const minX = Math.min(element.startX, element.lastX);
                const maxX = Math.max(element.startX, element.lastX);
                const minY = Math.min(element.startY, element.lastY);
                const maxY = Math.max(element.startY, element.lastY);

                if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                    isHit = true;
                }
            }
            else if (element.type === 'tool-circle') {
                let w = element.lastX - element.startX;
                let h = element.lastY - element.startY;
                let radius = Math.sqrt((w * w) + (h * h)) / 2;
                let centerX = (element.startX + element.lastX) / 2;
                let centerY = (element.startY + element.lastY) / 2;

                let dis = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));

                if (dis < radius) {
                    isHit = true;
                }
            }
            else if (element.type === 'tool-image') {
                if (x >= element.startX && x <= element.lastX && y >= element.startY && y <= element.lastY) {
                    isHit = true;
                }
            }
            else if (element.type === 'tool-square') {
                let w = element.lastX - element.startX;
                let h = element.lastY - element.startY;
                let endCord = Math.max(Math.abs(w), Math.abs(h));

                let trueLastX = element.startX + (Math.abs(w) / w) * endCord;
                let trueLastY = element.startY + (Math.abs(h) / h) * endCord;

                const minX = Math.min(element.startX, trueLastX);
                const maxX = Math.max(element.startX, trueLastX);
                const minY = Math.min(element.startY, trueLastY);
                const maxY = Math.max(element.startY, trueLastY);

                if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                    isHit = true;
                }
            }
            else if (element.type === 'tool-triangle') {
                let x1 = element.startX, y1 = element.startY;
                let x2 = element.lastX, y2 = element.lastY;
                let x3 = 2 * element.startX - element.lastX, y3 = element.lastY;

                if (isPointInTriangle(x, y, x1, y1, x2, y2, x3, y3)) {
                    isHit = true;
                }
            }
            else if (element.type === 'tool-brush') {
                for (let j = 0; j < element.points.length; j++) {
                    let pt = element.points[j];

                    let dis = Math.sqrt((x - pt.X) * (x - pt.X) + (y - pt.Y) * (y - pt.Y));

                    if (dis < 10) {
                        isHit = true;
                        break;
                    }
                }
            }
            else if (element.type === 'tool-text') {
                let width = ctx.measureText(element.text).width;
                if (x >= element.startX && x <= element.startX + width && y >= element.startY && y <= element.startY + 24) {
                    isHit = true;
                }
            }
            if (isHit) {
                selectedElementIndex = index;
                isDrawing = true;
                dragStartX = x;
                dragStartY = y;

                let selectedEl = elements[selectedElementIndex];

                if (selectedEl.color) {
                    inputColor = selectedEl.color;
                    document.getElementById('color-input').value = inputColor;
                }

                if (selectedEl.width) {
                    inputWidth = selectedEl.width;
                    document.getElementById('width-input').value = inputWidth;
                    sliderTextVal.innerHTML = inputWidth;
                }

                break;
            }
        }
        drawAllElements();
    }
    else {
        isDrawing = true;
        undoneElements = [];
        const rect = canvas.getBoundingClientRect();
        let startX = e.clientX - rect.left;
        let startY = e.clientY - rect.top;
        if (currentTool === 'tool-brush') {
            elements.push({
                type: currentTool,
                points: [{ X: startX, Y: startY }],
                color: inputColor,
                width: inputWidth
            });
        }
        else {
            elements.push({
                type: currentTool,
                startX: startX,
                startY: startY,
                lastX: startX,
                lastY: startY,
                color: inputColor,
                width: inputWidth
            });
        }
    }
}

// canvas.addEventListener('mousedown', (e) => {
//     onMouseDown(e);
// });
canvas.addEventListener('pointerdown', (e) => {
    onMouseDown(e);
});

function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();

    let currX = e.clientX - rect.left;
    let currY = e.clientY - rect.top;

    if (currentTool === 'tool-select' && isDrawing && selectedElementIndex !== null) {
        let selectedElement = elements[selectedElementIndex];
        let diffX = currX - dragStartX;
        let diffY = currY - dragStartY;

        if (selectedElement.type === 'tool-brush') {
            for (let i = 0; i < selectedElement.points.length; i++) {
                selectedElement.points[i].X += diffX;
                selectedElement.points[i].Y += diffY;
            }
        }
        else if (selectedElement.type === 'tool-text') {
            selectedElement.startX += diffX;
            selectedElement.startY += diffY;
        }
        else {
            selectedElement.startX += diffX;
            selectedElement.startY += diffY;
            selectedElement.lastX += diffX;
            selectedElement.lastY += diffY;
        }

        dragStartX = currX;
        dragStartY = currY;

        drawAllElements();
        return;
    }

    if (currentTool === 'tool-select') return;
    else if (!isDrawing) return;
    else if (currentTool === 'tool-brush') {
        elements[elements.length - 1].points.push({ X: currX, Y: currY });
    }
    else {
        elements[elements.length - 1].lastX = currX;
        elements[elements.length - 1].lastY = currY;
    }
    drawAllElements();
}

// canvas.addEventListener('mousemove', (e) => {
//     onMouseMove(e);
// });
canvas.addEventListener('pointermove', (e) => {
    onMouseMove(e);
});

function onMouseUp() {
    isDrawing = false;
    if (elements.length > 0) {
        let element = elements[elements.length - 1];
        if (element.type !== 'tool-brush' && element.startX === element.lastX && element.startY === element.lastY) {
            elements.pop();
        }
    }
    if (elements.length > 0) {
        if (elements[elements.length - 1].type === 'tool-image-temp') {
            elements[elements.length - 1].type = 'tool-image';
            elements[elements.length - 1].startX = Math.min(elements[elements.length - 1].startX, elements[elements.length - 1].lastX);
            elements[elements.length - 1].lastX = Math.max(elements[elements.length - 1].startX, elements[elements.length - 1].lastX);
            elements[elements.length - 1].startY = Math.min(elements[elements.length - 1].startY, elements[elements.length - 1].lastY);
            elements[elements.length - 1].lastY = Math.max(elements[elements.length - 1].startY, elements[elements.length - 1].lastY);
            let width = Math.round(elements[elements.length - 1].lastX - elements[elements.length - 1].startX);
            let height = Math.round(elements[elements.length - 1].lastY - elements[elements.length - 1].startY);
            elements[elements.length - 1].url = 'https://picsum.photos/seed/' + Math.random() + '/' + width + '/' + height;
        }
    }
    drawAllElements();
    saveDrawing();
}

// canvas.addEventListener('mouseup', () => {
//     onMouseUp();
// });
canvas.addEventListener('pointerup', () => {
    onMouseUp();
});

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
                textarea.style.border = '1px dashed';
                textarea.style.borderColor = 'black';
                textarea.style.color = element.color;
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
clear.addEventListener('click', () => {
    undoneElements.push({
        type: 'list',
        list: elements
    });
    elements = [];
    // undoneElements = [];
    drawAllElements();
    saveDrawing();
})

const downloadPNG = document.getElementById('action-download');
downloadPNG.addEventListener('click', () => {
    let url = canvas.toDataURL('image/png');
    let link = document.createElement('a');
    link.href = url;
    link.download = 'myDooodle.png';
    link.click();
});

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
        if (undoneElements[undoneElements.length - 1].type === 'list')
            elements = undoneElements[undoneElements.length - 1].list;
        else
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'z')
        undo();
    if ((e.ctrlKey || e.metaKey) && e.key === 'y')
        redo();
})