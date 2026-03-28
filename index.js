const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let elements = [];
let undoneElements = [];
let clearedCanvas = [];
let isDrawing = false;
let isResizing = false;
let isErasing = false;
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
    if (currentTool !== 'tool-text')
        sliderTextVal.innerHTML = inputWidth;
    else
        sliderTextVal.innerHTML = inputWidth * 6;
    sessionStorage.setItem('width', inputWidth);
    if (selectedElementIndex !== null) {
        elements[selectedElementIndex].width = inputWidth;
        drawAllElements();
        saveDrawing();
    }
});

let degInput = '0';
document.getElementById('deg-input').addEventListener('input', () => {
    degInput = document.getElementById('deg-input').value;
    if (selectedElementIndex !== null) {
        elements[selectedElementIndex].deg = degInput;
        if (elements[selectedElementIndex].type.substr(elements[selectedElementIndex].type.length - 7) !== 'rotated')
            elements[selectedElementIndex].type += '-rotated';
    }
    drawAllElements();
    saveDrawing();
})

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
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (element.type === 'tool-triangle-temp') {
                elements.splice(index, 1);
                index--;
            }
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

    if (element.type === 'tool-brush' || element.type === 'tool-brush-rotated') {
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
    else if (element.type === 'tool-circle' || element.type === 'tool-circle-rotated') {

        let w = element.lastX - element.startX;
        let h = element.lastY - element.startY;
        let r = Math.sqrt(w * w + h * h) / 2;
        let cx = (element.startX + element.lastX) / 2;
        let cy = (element.startY + element.lastY) / 2;
        minX = cx - r; maxX = cx + r;
        minY = cy - r; maxY = cy + r;

    }
    else if (element.type === 'tool-triangle' || element.type === 'tool-triangle-rotated') {

        let x1 = element.p1X, y1 = element.p1Y;
        let x2 = element.p2X, y2 = element.p2Y;
        let x3 = element.p3X, y3 = element.p3Y;
        minX = Math.min(x1, x2, x3); maxX = Math.max(x1, x2, x3);
        minY = Math.min(y1, y2, y3); maxY = Math.max(y1, y2, y3);
        console.log(minX, minY);
    }
    else if (element.type === 'tool-square' || element.type === 'tool-square-rotated') {

        let w = element.lastX - element.startX;
        let h = element.lastY - element.startY;
        let endCord = Math.max(Math.abs(w), Math.abs(h));
        let trueLastX = element.startX + (Math.abs(w) / (w || 1)) * endCord;
        let trueLastY = element.startY + (Math.abs(h) / (h || 1)) * endCord;
        minX = Math.min(element.startX, trueLastX); maxX = Math.max(element.startX, trueLastX);
        minY = Math.min(element.startY, trueLastY); maxY = Math.max(element.startY, trueLastY);

    }
    else if (element.type === 'tool-text' || element.type === 'tool-text-rotated') {

        ctx.font = `${element.width * 6}px sans-serif`;
        let w = ctx.measureText(element.text).width;
        minX = element.startX; maxX = element.startX + w;
        minY = element.startY; maxY = element.startY + element.width * 6;

    }
    else if (element.type === 'tool-image' || element.type === 'tool-image-rotated') {

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

function drawRect(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    ctx.lineWidth = element.width;
    ctx.strokeStyle = element.color;
    ctx.strokeRect(element.startX, element.startY, width, height);
}

function drawCircle(element) {
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

function drawSquare(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    let endCord = Math.max(Math.abs(width), Math.abs(height));
    ctx.lineWidth = element.width;
    ctx.strokeStyle = element.color;
    ctx.strokeRect(element.startX, element.startY, (Math.abs(width) / width) * endCord, Math.abs(height) / height * endCord);
}

function drawTriangle(element) {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.width;
    ctx.beginPath();
    ctx.moveTo(element.p1X, element.p1Y);
    ctx.lineTo(element.p2X, element.p2Y);
    ctx.lineTo(element.p3X, element.p3Y);
    ctx.lineTo(element.p1X, element.p1Y);
    ctx.stroke();
}

function drawTempTriangle(index, element) {
    // if (index !== elements.length - 1) {
    //     elements.splice(index, 1);
    //     index--;
    //     // continue;
    //     return;
    // }
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.width;
    ctx.beginPath();
    ctx.moveTo(element.p1X, element.p1Y);
    if (element.p2X !== -1 && element.p2Y !== -1)
        ctx.lineTo(element.p2X, element.p2Y);
    if (element.p3X !== -1 && element.p3Y !== -1) {
        ctx.lineTo(element.p3X, element.p3Y);
    }
    ctx.stroke();

    if (element.p3X !== -1 && element.p3Y !== -1) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(element.p3X, element.p3Y);
        ctx.lineTo(element.p1X, element.p1Y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawBrush(element) {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.width;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (element.points.length < 3) {
        ctx.moveTo(element.points[0].X, element.points[0].Y);
        for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].X, element.points[i].Y);
        }
    }
    else {
        ctx.moveTo(element.points[0].X, element.points[0].Y);
        let i;
        for (i = 1; i < element.points.length - 1; i++) {
            let midX = (element.points[i].X + element.points[i + 1].X) / 2;
            let midY = (element.points[i].Y + element.points[i + 1].Y) / 2;
            ctx.quadraticCurveTo(element.points[i].X, element.points[i].Y, midX, midY);
        }
        ctx.lineTo(element.points[i].X, element.points[i].Y);
    }
    ctx.stroke();

    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
}

function drawText(element) {
    ctx.font = `${element.width * 6}px sans-serif`;
    ctx.fillStyle = element.color;
    ctx.textBaseline = 'top';
    ctx.fillText(element.text, element.startX, element.startY);
}

function drawImage(element) {
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

function drawTempImage(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(element.startX, element.startY, width, height);
    ctx.setLineDash([]);
}

function drawBoundingBox() {
    const selectedEl = elements[selectedElementIndex];
    const box = getBoundingBox(selectedEl);

    let centerX = box.x + box.w / 2;
    let centerY = box.y + box.h / 2;

    let currentStroke = ctx.strokeStyle;
    let currentFill = ctx.fillStyle;

    ctx.strokeStyle = 'black';

    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    if (selectedEl.type.substr(selectedEl.type.length - 7) === 'rotated') {

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate((Math.PI / 180) * selectedEl.deg);
        ctx.translate(-1 * centerX, -1 * centerY)
    }

    ctx.strokeRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20);
    ctx.setLineDash([]);

    ctx.fillStyle = 'white';

    let handleX = box.x + box.w + 10;
    let handleY = box.y + box.h + 10;

    ctx.fillRect(handleX - 5, handleY - 5, 10, 10);
    ctx.strokeRect(handleX - 5, handleY - 5, 10, 10);

    if (selectedEl.type.substr(selectedEl.type.length - 7) === 'rotated') {
        ctx.restore();
        ctx.setLineDash([]);
    }

    ctx.fillStyle = currentFill;
    ctx.strokeStyle = currentStroke;
}

function drawAllElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        const box = getBoundingBox(element);
        console.log(box);

        let centerX = box.x + box.w / 2;
        let centerY = box.y + box.h / 2;

        console.log(centerX, centerY);
        if (element.type.substr(element.type.length - 7) === 'rotated') {

            ctx.save();

            ctx.translate(centerX, centerY);
            ctx.rotate((Math.PI / 180) * element.deg);
            ctx.translate(-1 * centerX, -1 * centerY);
        }
        if (element.type === 'tool-rect' || element.type === 'tool-rect-rotated') {
            drawRect(element);
        }
        else if (element.type === 'tool-circle' || element.type === 'tool-circle-rotated') {
            drawCircle(element);
        }
        else if (element.type === 'tool-square' || element.type === 'tool-square-rotated') {
            drawSquare(element);
        }
        else if (element.type === 'tool-triangle' || element.type === 'tool-triangle-rotated') {
            drawTriangle(element);
        }
        else if (element.type === 'tool-triangle-temp') {
            drawTempTriangle(index, element);
        }
        else if (element.type === 'tool-brush' || element.type === 'tool-brush-rotated') {
            drawBrush(element);
        }
        else if (element.type === 'tool-text' || element.type === 'tool-text-rotated') {
            drawText(element);
        }
        else if (element.type === 'tool-image' || element.type === 'tool-image-rotated') {
            drawImage(element);
        }
        else if (element.type === 'tool-image-temp') {
            drawTempImage(element);
        }
        if (element.type.substr(element.type.length - 7) === 'rotated') {
            ctx.restore();
        }
        // console.log(elements);
    }
    if (selectedElementIndex !== null) {
        drawBoundingBox();
    }
}

function isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    return Math.abs(area1 + area2 + area3 - areaOrig) < 1;
}

function inverseRotatePoint(mouseX, mouseY, centerX, centerY, angleDeg) {
    let rad = (Math.PI / 180) * -angleDeg;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);

    let diffX = mouseX - centerX;
    let diffY = mouseY - centerY;

    return {
        x: (cos * diffX) - (sin * diffY) + centerX,
        y: (sin * diffX) + (cos * diffY) + centerY
    };
}

function isHit(x, y, element) {
    if (element.type === 'tool-rect' || element.type === 'tool-rect-rotated') {
        const minX = Math.min(element.startX, element.lastX);
        const maxX = Math.max(element.startX, element.lastX);
        const minY = Math.min(element.startY, element.lastY);
        const maxY = Math.max(element.startY, element.lastY);

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return true;
        }
    }
    else if (element.type === 'tool-circle' || element.type === 'tool-circle-rotated') {
        let w = element.lastX - element.startX;
        let h = element.lastY - element.startY;
        let radius = Math.sqrt((w * w) + (h * h)) / 2;
        let centerX = (element.startX + element.lastX) / 2;
        let centerY = (element.startY + element.lastY) / 2;

        let dis = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));

        if (dis < radius) {
            return true;
        }
    }
    else if (element.type === 'tool-image' || element.type === 'tool-image-rotated') {
        if (x >= element.startX && x <= element.lastX && y >= element.startY && y <= element.lastY) {
            return true;
        }
    }
    else if (element.type === 'tool-square' || element.type === 'tool-square-rotated') {
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
            return true;
        }
    }
    else if (element.type === 'tool-triangle' || element.type === 'tool-triangle-rotated') {
        let x1 = element.p1X, y1 = element.p1Y;
        let x2 = element.p2X, y2 = element.p2Y;
        let x3 = element.p3X, y3 = element.p3Y;

        if (isPointInTriangle(x, y, x1, y1, x2, y2, x3, y3)) {
            return true;
        }
    }
    else if (element.type === 'tool-brush' || element.type === 'tool-brush-rotated') {
        for (let j = 0; j < element.points.length; j++) {
            let pt = element.points[j];

            let dis = Math.sqrt((x - pt.X) * (x - pt.X) + (y - pt.Y) * (y - pt.Y));

            if (dis < 10) {
                return true;
            }
        }
    }
    else if (element.type === 'tool-text' || element.type === 'tool-text-rotated') {
        let width = ctx.measureText(element.text).width;
        if (x >= element.startX && x <= element.startX + width && y >= element.startY && y <= element.startY + element.width * 6) {
            return true;
        }
    }
    return false;
}

function onMouseDown(e) {
    if (currentTool === 'tool-eraser') {
        isErasing = true;
    }
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
            lastY: Y,
            deg: 0
        });
    }
    else if (currentTool === 'tool-triangle') {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();

        let X = e.clientX - rect.left;
        let Y = e.clientY - rect.top;

        if (elements.length === 0 || elements[elements.length - 1].type !== 'tool-triangle-temp') {
            elements.push({
                type: 'tool-triangle-temp',
                p1X: X,
                p1Y: Y,
                p2X: -1,
                p2Y: -1,
                p3X: -1,
                p3Y: -1,
                color: inputColor,
                width: inputWidth,
                deg: 0
            });
        }
    }
    else if (currentTool === 'tool-text') {
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.left = (e.clientX - 1) + 'px';
        textarea.style.top = (e.clientY - 1) + 'px';
        textarea.style.background = 'transparent';
        textarea.style.border = '1px dashed';
        textarea.style.borderColor = 'black';
        textarea.style.color = inputColor;
        textarea.style.outline = 'none';
        textarea.style.lineHeight = '1';

        textarea.style.fontFamily = 'sans-serif';
        textarea.style.fontSize = `${inputWidth * 6}px`;
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
                    color: inputColor,
                    width: inputWidth,
                    deg: 0
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


        if (selectedElementIndex !== null) {
            let selectedEl = elements[selectedElementIndex];
            document.getElementById('deg-input').value = elements[selectedElementIndex].deg || 0;
            let box = getBoundingBox(elements[selectedElementIndex]);
            let handleX = box.x + box.w;
            let handleY = box.y + box.h;

            let rotatedX = x;
            let rotatedY = y;

            if (selectedEl.type.substr(selectedEl.type.length - 7) === 'rotated') {
                let centerX = box.x + box.w / 2;
                let centerY = box.y + box.h / 2;
                let inverted = inverseRotatePoint(x, y, centerX, centerY, selectedEl.deg);
                rotatedX = inverted.x;
                rotatedY = inverted.y;
            }

            if (Math.abs(rotatedX - handleX) <= 10 && Math.abs(rotatedY - handleY) <= 10) {
                isResizing = true;
                dragStartX = x;
                dragStartY = y;
                return;
            }
        }

        selectedElementIndex = null;

        for (let index = elements.length - 1; index >= 0; index--) {
            const element = elements[index];

            let rotatedX = x;
            let rotatedY = y;

            if (element.type.substr(element.type.length - 7) === 'rotated') {
                const box = getBoundingBox(element);
                let centerX = box.x + box.w / 2;
                let centerY = box.y + box.h / 2;
                let inverted = inverseRotatePoint(x, y, centerX, centerY, element.deg);
                rotatedX = inverted.x;
                rotatedY = inverted.y;
            }

            if (isHit(rotatedX, rotatedY, element)) {
                selectedElementIndex = index;
                isDrawing = true;
                dragStartX = x;
                dragStartY = y;

                let selectedEl = elements[selectedElementIndex];

                document.getElementById('deg-input').value = selectedEl.deg;

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
                width: inputWidth,
                deg: 0
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
                width: inputWidth,
                deg: 0
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

    if (currentTool === 'tool-eraser' && isErasing) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (isHit(currX, currY, element)) {
                element.type += ' ';
                elements.push({
                    type: 'erased',
                    index: i
                });
            }
        }
    }

    if (currentTool === 'tool-select' && isResizing && selectedElementIndex !== null) {
        let diffX = currX - dragStartX;
        let diffY = currY - dragStartY;
        let selectedEl = elements[selectedElementIndex];

        if (selectedEl.type !== 'tool-brush' && selectedEl.type !== 'tool-text' && selectedEl.type !== 'tool-triangle' && selectedEl.type !== 'tool-brush-rotated' && selectedEl.type !== 'tool-text-rotated' && selectedEl.type !== 'tool-triangle-rotated') {
            selectedEl.lastX += diffX;
            selectedEl.lastY += diffY;

            dragStartX = currX;
            dragStartY = currY;

            drawAllElements();
            saveDrawing();
            return;
        }

        else if (selectedEl.type === 'tool-triangle' || selectedEl.type === 'tool-triangle-rotated') {
            let box = getBoundingBox(selectedEl);
            let startX = box.x;
            let startY = box.y;
            let lastX = box.x + box.w;
            let lastY = box.y + box.h;
            let scaleX = (currX - startX) / (lastX - startX);
            let scaleY = (currY - startY) / (lastY - startY);

            selectedEl.p1X = startX + (selectedEl.p1X - startX) * scaleX;
            selectedEl.p2X = startX + (selectedEl.p2X - startX) * scaleX;
            selectedEl.p3X = startX + (selectedEl.p3X - startX) * scaleX;
            selectedEl.p1Y = startY + (selectedEl.p1Y - startY) * scaleY;
            selectedEl.p2Y = startY + (selectedEl.p2Y - startY) * scaleY;
            selectedEl.p3Y = startY + (selectedEl.p3Y - startY) * scaleY;

            drawAllElements();
            saveDrawing();
            return;
        }

        else if (selectedEl.type === 'tool-brush' || selectedEl.type === 'tool-brush-rotated') {
            let box = getBoundingBox(selectedEl);
            let startX = box.x;
            let startY = box.y;
            let lastX = box.x + box.w;
            let lastY = box.y + box.h;
            let scaleX = (currX - startX) / (lastX - startX);
            let scaleY = (currY - startY) / (lastY - startY);

            for (let i = 0; i < selectedEl.points.length; i++) {
                selectedEl.points[i].X = startX + (selectedEl.points[i].X - startX) * scaleX;
                selectedEl.points[i].Y = startY + (selectedEl.points[i].Y - startY) * scaleY;
            }
            drawAllElements();
            saveDrawing();
            return;
        }
    }

    if (currentTool === 'tool-select' && isDrawing && selectedElementIndex !== null) {
        let selectedElement = elements[selectedElementIndex];
        let diffX = currX - dragStartX;
        let diffY = currY - dragStartY;

        if (selectedElement.type === 'tool-brush' || selectedElement.type === 'tool-brush-rotated') {
            for (let i = 0; i < selectedElement.points.length; i++) {
                selectedElement.points[i].X += diffX;
                selectedElement.points[i].Y += diffY;
            }
        }
        else if (selectedElement.type === 'tool-text' || selectedElement.type === 'tool-text-rotated') {
            selectedElement.startX += diffX;
            selectedElement.startY += diffY;
        }
        else if (selectedElement.type === 'tool-triangle' || selectedElement.type === 'tool-triangle-rotated') {
            selectedElement.p1X += diffX;
            selectedElement.p2X += diffX;
            selectedElement.p3X += diffX;
            selectedElement.p1Y += diffY;
            selectedElement.p2Y += diffY;
            selectedElement.p3Y += diffY;
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
    else if (currentTool === 'tool-triangle') {
        const element = elements[elements.length - 1];
        if (element.p3X === -1 && element.p3Y === -1) {
            element.p2X = currX;
            element.p2Y = currY;
        }
        else {
            element.p3X = currX;
            element.p3Y = currY;
        }
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

function onMouseUp(e) {
    const rect = canvas.getBoundingClientRect();
    // document.getElementById('deg-input').value = 0;

    let currX = e.clientX - rect.left;
    let currY = e.clientY - rect.top;
    if (currentTool === 'tool-triangle') {
        const element = elements[elements.length - 1];
        if (element.p3X !== -1 && element.p3Y !== -1) {
            isDrawing = false;
            element.type = 'tool-triangle';
        }
        if (element.p2X !== -1 && element.p2Y !== -1) {
            element.p3X = currX;
            element.p3Y = currY;

        }
    }
    else {
        isDrawing = false;
        isResizing = false;
        isErasing = false;
        if (elements.length > 0) {
            let element = elements[elements.length - 1];
            if (element.type === 'tool-rect' || element.type === 'tool-circle' || element.type === 'tool-square' || element.type === 'tool-image-temp') {
                if (element.startX === element.lastX && element.startY === element.lastY) {
                    elements.pop();
                }
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
    }
    drawAllElements();
    saveDrawing();
}

// canvas.addEventListener('mouseup', () => {
//     onMouseUp();
// });
canvas.addEventListener('pointerup', (e) => {
    onMouseUp(e);
});

canvas.addEventListener('dblclick', (e) => {
    if (currentTool !== 'tool-select') return;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.type === 'tool-text'||element.type==='tool-text-rotated') {
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
                textarea.style.fontSize = `${element.width * 6}px`
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
    clearedCanvas.push(elements);
    elements = [];
    elements.push({ type: 'clear' });
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
        if (elements[elements.length - 1].type === 'erased') {
            undoneElements.push(elements[elements.length - 1]);
            elements[elements[elements.length - 1].index].type = elements[elements[elements.length - 1].index].type.trimEnd();
            elements.pop();
        }
        else if (elements[elements.length - 1].type === 'clear') {
            undoneElements.push(elements[elements.length - 1]);
            elements.pop();
            elements = [...elements, ...clearedCanvas[clearedCanvas.length - 1]];
        }
        else {
            undoneElements.push(elements[elements.length - 1]);
            elements.pop();
        }
        drawAllElements();
        saveDrawing();
    }
}

function redo() {
    if (undoneElements.length !== 0) {
        if (undoneElements[undoneElements.length - 1].type === 'erased') {
            elements[undoneElements[undoneElements.length - 1].index].type += ' ';
            elements.push(undoneElements[undoneElements.length - 1]);
            undoneElements.pop();
        }
        else if (undoneElements[undoneElements.length - 1].type === 'clear') {
            undoneElements.pop();
            clear.click();
        }
        else {
            elements.push(undoneElements[undoneElements.length - 1]);
            undoneElements.pop();
        }
        drawAllElements();
        saveDrawing();
    }
}

const undoBtn = document.getElementById('action-undo');
undoBtn.addEventListener('click', undo);

const redoBtn = document.getElementById('action-redo');
redoBtn.addEventListener('click', redo)

window.addEventListener('keydown', (e) => {
    // e.preventDefault();
    if (currentTool !== 'tool-text') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z')
                undo();
            else if (e.key === 'y')
                redo();
            else if (e.key === 'd')
                clear.click();
            else if (e.key === 'p')
                document.getElementById('action-download').click();
            else if (e.key === '1')
                document.getElementById('tool-select').click();
            else if (e.key === '2')
                document.getElementById('tool-rect').click();
            else if (e.key === '3')
                document.getElementById('tool-circle').click();
            else if (e.key === '4')
                document.getElementById('tool-square').click();
            else if (e.key === '5')
                document.getElementById('tool-triangle').click();
            else if (e.key === '6')
                document.getElementById('tool-brush').click();
            else if (e.key === '7')
                document.getElementById('tool-text').click();
            else if (e.key === '8')
                document.getElementById('tool-eraser').click();
            else if (e.key === '9')
                document.getElementById('tool-image').click();
            else if (e.key === 'm')
                document.getElementById('theme-toggle').click();
        }
    }
})