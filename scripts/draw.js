import { variables, canvas, ctx } from './index.js';
import * as util from './utilities.js';

export function drawRect(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    ctx.lineWidth = element.width;
    ctx.strokeStyle = element.color;
    ctx.strokeRect(element.startX, element.startY, width, height);
}

export function drawCircle(element) {
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

export function drawSquare(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    let endCord = Math.max(Math.abs(width), Math.abs(height));
    ctx.lineWidth = element.width;
    ctx.strokeStyle = element.color;
    ctx.strokeRect(element.startX, element.startY, (Math.abs(width) / width) * endCord, Math.abs(height) / height * endCord);
}

export function drawTriangle(element) {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.width;
    ctx.beginPath();
    ctx.moveTo(element.p1X, element.p1Y);
    ctx.lineTo(element.p2X, element.p2Y);
    ctx.lineTo(element.p3X, element.p3Y);
    ctx.lineTo(element.p1X, element.p1Y);
    ctx.stroke();
}

export function drawTempTriangle(index, element) {
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

export function drawBrush(element) {
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

export function drawText(element) {
    ctx.font = `${element.width * 6}px sans-serif`;
    ctx.fillStyle = element.color;
    ctx.textBaseline = 'top';
    ctx.fillText(element.text, element.startX, element.startY);
}

export function drawImage(element) {
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
        }
    }
}

export function drawTempImage(element) {
    let width = element.lastX - element.startX;
    let height = element.lastY - element.startY;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(element.startX, element.startY, width, height);
    ctx.setLineDash([]);
}

export function drawBoundingBox() {
    const selectedEl = variables.elements[variables.selectedElementIndex];
    const box = util.getBoundingBox(selectedEl);

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

export function drawAllElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = variables.bgcolor;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    for (let index = 0; index < variables.elements.length; index++) {
        const element = variables.elements[index];
        const box = util.getBoundingBox(element);

        let centerX = box.x + box.w / 2;
        let centerY = box.y + box.h / 2;

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
    }
    if (variables.selectedElementIndex !== null) {
        drawBoundingBox();
    }
}