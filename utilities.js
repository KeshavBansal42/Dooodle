import { variables, canvas, ctx } from './index.js';
import * as draw from './draw.js';

export function getBoundingBox(element) {
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

export function isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    return Math.abs(area1 + area2 + area3 - areaOrig) < 1;
}

export function inverseRotatePoint(mouseX, mouseY, centerX, centerY, angleDeg) {
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

export function isHit(x, y, element) {
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

export function onMouseDown(e) {
    if (variables.currentTool === 'tool-eraser') {
        variables.isErasing = true;
    }
    if (variables.currentTool === 'tool-image') {
        variables.isDrawing = true;
        const rect = canvas.getBoundingClientRect();

        let X = e.clientX - rect.left;
        let Y = e.clientY - rect.top;

        variables.elements.push({
            type: 'tool-image-temp',
            url: '',
            startX: X,
            startY: Y,
            lastX: X,
            lastY: Y,
            deg: 0
        });
    }
    else if (variables.currentTool === 'tool-triangle') {
        variables.isDrawing = true;
        const rect = canvas.getBoundingClientRect();

        let X = e.clientX - rect.left;
        let Y = e.clientY - rect.top;

        if (variables.elements.length === 0 || variables.elements[variables.elements.length - 1].type !== 'tool-triangle-temp') {
            variables.elements.push({
                type: 'tool-triangle-temp',
                p1X: X,
                p1Y: Y,
                p2X: -1,
                p2Y: -1,
                p3X: -1,
                p3Y: -1,
                color: variables.inputColor,
                width: variables.inputWidth,
                deg: 0
            });
        }
    }
    else if (variables.currentTool === 'tool-text') {
        const textarea = document.createElement('textarea');

        textarea.classList.add('text-tool-input');

        textarea.style.left = (e.clientX - 1) + 'px';
        textarea.style.top = (e.clientY - 1) + 'px';
        textarea.style.color = variables.inputColor;
        textarea.style.fontSize = `${variables.inputWidth * 6}px`;

        document.body.appendChild(textarea);

        setTimeout(() => {
            textarea.focus();
        }, 0)

        textarea.addEventListener('blur', () => {
            if (textarea.value !== "") {

                const rect = canvas.getBoundingClientRect();

                let X = e.clientX - rect.left;
                let Y = e.clientY - rect.top;

                variables.elements.push({
                    type: 'tool-text',
                    text: textarea.value,
                    startX: X,
                    startY: Y,
                    color: variables.inputColor,
                    width: variables.inputWidth,
                    deg: 0
                });
                draw.drawAllElements();
                saveDrawing();
            }
            textarea.remove();
        })
    }
    else if (variables.currentTool === 'tool-select') {
        const rect = canvas.getBoundingClientRect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;


        if (variables.selectedElementIndex !== null) {
            let selectedEl = variables.elements[variables.selectedElementIndex];
            let box = getBoundingBox(variables.elements[variables.selectedElementIndex]);
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
                variables.isResizing = true;
                variables.dragStartX = x;
                variables.dragStartY = y;
                return;
            }
        }

        variables.selectedElementIndex = null;

        for (let index = variables.elements.length - 1; index >= 0; index--) {
            const element = variables.elements[index];

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
                variables.selectedElementIndex = index;
                variables.isDrawing = true;
                variables.dragStartX = x;
                variables.dragStartY = y;

                let selectedEl = variables.elements[variables.selectedElementIndex];

                if (selectedEl.color) {
                    variables.inputColor = selectedEl.color;
                    document.getElementById('color-input').value = variables.inputColor;
                }

                if (selectedEl.width) {
                    variables.inputWidth = selectedEl.width;
                    document.getElementById('width-input').value = variables.inputWidth;
                    sliderTextVal.innerHTML = variables.inputWidth;
                }

                break;
            }
        }
        draw.drawAllElements();
    }
    else {
        variables.isDrawing = true;
        variables.undoneElements = [];
        const rect = canvas.getBoundingClientRect();
        let startX = e.clientX - rect.left;
        let startY = e.clientY - rect.top;
        if (variables.currentTool === 'tool-brush') {
            variables.elements.push({
                type: variables.currentTool,
                points: [{ X: startX, Y: startY }],
                color: variables.inputColor,
                width: variables.inputWidth,
                deg: 0
            });
        }
        else {
            variables.elements.push({
                type: variables.currentTool,
                startX: startX,
                startY: startY,
                lastX: startX,
                lastY: startY,
                color: variables.inputColor,
                width: variables.inputWidth,
                deg: 0
            });
        }
    }
}

export function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();

    let currX = e.clientX - rect.left;
    let currY = e.clientY - rect.top;

    if (variables.currentTool === 'tool-eraser' && variables.isErasing) {
        for (let i = 0; i < variables.elements.length; i++) {
            const element = variables.elements[i];
            if (isHit(currX, currY, element)) {
                element.type += ' ';
                variables.elements.push({
                    type: 'erased',
                    index: i
                });
            }
        }
    }

    if (variables.currentTool === 'tool-select' && variables.isResizing && variables.selectedElementIndex !== null) {
        let diffX = currX - variables.dragStartX;
        let diffY = currY - variables.dragStartY;
        let selectedEl = variables.elements[variables.selectedElementIndex];

        if (selectedEl.type !== 'tool-brush' && selectedEl.type !== 'tool-text' && selectedEl.type !== 'tool-triangle' && selectedEl.type !== 'tool-brush-rotated' && selectedEl.type !== 'tool-text-rotated' && selectedEl.type !== 'tool-triangle-rotated') {
            selectedEl.lastX += diffX;
            selectedEl.lastY += diffY;

            variables.dragStartX = currX;
            variables.dragStartY = currY;

            draw.drawAllElements();
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

            draw.drawAllElements();
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
            draw.drawAllElements();
            saveDrawing();
            return;
        }
    }

    if (variables.currentTool === 'tool-select' && variables.isDrawing && variables.selectedElementIndex !== null) {
        let selectedElement = variables.elements[variables.selectedElementIndex];
        let diffX = currX - variables.dragStartX;
        let diffY = currY - variables.dragStartY;

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

        variables.dragStartX = currX;
        variables.dragStartY = currY;

        draw.drawAllElements();
        return;
    }

    if (variables.currentTool === 'tool-select') return;
    else if (!variables.isDrawing) return;
    else if (variables.currentTool === 'tool-brush') {
        variables.elements[variables.elements.length - 1].points.push({ X: currX, Y: currY });
    }
    else if (variables.currentTool === 'tool-triangle') {
        const element = variables.elements[variables.elements.length - 1];
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
        variables.elements[variables.elements.length - 1].lastX = currX;
        variables.elements[variables.elements.length - 1].lastY = currY;
    }
    draw.drawAllElements();
}

export function onMouseUp(e) {
    const rect = canvas.getBoundingClientRect();

    let currX = e.clientX - rect.left;
    let currY = e.clientY - rect.top;
    if (variables.currentTool === 'tool-triangle') {
        const element = variables.elements[variables.elements.length - 1];
        if (element.p3X !== -1 && element.p3Y !== -1) {
            variables.isDrawing = false;
            element.type = 'tool-triangle';
        }
        if (element.p2X !== -1 && element.p2Y !== -1) {
            element.p3X = currX;
            element.p3Y = currY;

        }
    }
    else {
        variables.isDrawing = false;
        variables.isResizing = false;
        variables.isErasing = false;
        if (variables.elements.length > 0) {
            let element = variables.elements[variables.elements.length - 1];
            if (element.type === 'tool-rect' || element.type === 'tool-circle' || element.type === 'tool-square' || element.type === 'tool-image-temp') {
                if (element.startX === element.lastX && element.startY === element.lastY) {
                    variables.elements.pop();
                }
            }
        }
        if (variables.elements.length > 0) {
            if (variables.elements[variables.elements.length - 1].type === 'tool-image-temp') {
                variables.elements[variables.elements.length - 1].type = 'tool-image';
                variables.elements[variables.elements.length - 1].startX = Math.min(variables.elements[variables.elements.length - 1].startX, variables.elements[variables.elements.length - 1].lastX);
                variables.elements[variables.elements.length - 1].lastX = Math.max(variables.elements[variables.elements.length - 1].startX, variables.elements[variables.elements.length - 1].lastX);
                variables.elements[variables.elements.length - 1].startY = Math.min(variables.elements[variables.elements.length - 1].startY, variables.elements[variables.elements.length - 1].lastY);
                variables.elements[variables.elements.length - 1].lastY = Math.max(variables.elements[variables.elements.length - 1].startY, variables.elements[variables.elements.length - 1].lastY);
                let width = Math.round(variables.elements[variables.elements.length - 1].lastX - variables.elements[variables.elements.length - 1].startX);
                let height = Math.round(variables.elements[variables.elements.length - 1].lastY - variables.elements[variables.elements.length - 1].startY);
                variables.elements[variables.elements.length - 1].url = 'https://picsum.photos/seed/' + Math.random() + '/' + width + '/' + height;
            }
        }
    }
    draw.drawAllElements();
    saveDrawing();
}

export function editTextContent(element) {
    let width = ctx.measureText(element.text).width;
    const textarea = document.createElement('textarea');

    textarea.classList.add('text-tool-input');

    textarea.style.left = element.startX - 1 + 'px';
    textarea.style.top = element.startY - 2 + 'px';
    textarea.style.color = element.color;
    textarea.style.fontSize = `${element.width * 6}px`

    textarea.value = element.text;

    element.text = "";
    variables.selectedElementIndex = null;
    draw.drawAllElements();

    document.body.appendChild(textarea);

    textarea.focus();

    textarea.addEventListener('blur', () => {
        element.text = textarea.value;
        draw.drawAllElements();
        saveDrawing();
        textarea.remove();
    })
    return;
}

export function saveDrawing() {
    let saveData = JSON.stringify(variables.elements);
    sessionStorage.setItem('myDooodle', saveData);
}

export function undo() {
    if (variables.elements.length !== 0) {
        if (variables.elements[variables.elements.length - 1].type === 'erased') {
            variables.undoneElements.push(variables.elements[variables.elements.length - 1]);
            variables.elements[variables.elements[variables.elements.length - 1].index].type = variables.elements[variables.elements[variables.elements.length - 1].index].type.trimEnd();
            variables.elements.pop();
        }
        else if (variables.elements[variables.elements.length - 1].type === 'clear') {
            variables.undoneElements.push(variables.elements[variables.elements.length - 1]);
            variables.elements.pop();
            variables.elements = [...variables.elements, ...variables.clearedCanvas[variables.clearedCanvas.length - 1]];
        }
        else {
            variables.undoneElements.push(variables.elements[variables.elements.length - 1]);
            variables.elements.pop();
        }
        draw.drawAllElements();
        saveDrawing();
    }
}

export function redo() {
    if (variables.undoneElements.length !== 0) {
        if (variables.undoneElements[variables.undoneElements.length - 1].type === 'erased') {
            variables.elements[variables.undoneElements[variables.undoneElements.length - 1].index].type += ' ';
            variables.elements.push(variables.undoneElements[variables.undoneElements.length - 1]);
            variables.undoneElements.pop();
        }
        else if (variables.undoneElements[variables.undoneElements.length - 1].type === 'clear') {
            variables.undoneElements.pop();
            clear.click();
        }
        else {
            variables.elements.push(variables.undoneElements[variables.undoneElements.length - 1]);
            variables.undoneElements.pop();
        }
        draw.drawAllElements();
        saveDrawing();
    }
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw.drawAllElements();
}