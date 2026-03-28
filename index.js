import * as util from './utilities.js';
import * as draw from './draw.js';

export const canvas = document.getElementById('drawing-board');
export const ctx = canvas.getContext('2d');

export const variables = {
    elements: [],
    undoneElements: [],
    clearedCanvas: [],
    isDrawing: false,
    isResizing: false,
    isErasing: false,
    currentTool: 'tool-brush',
    selectedElementIndex: null,
    dragStartX: null,
    dragStartY: null,
    inputColor: '#000000',
    inputWidth: 1,
    bgcolor: '#ffffff'
};

//input stroke color
document.getElementById('color-input').addEventListener('input', () => {
    variables.inputColor = document.getElementById('color-input').value;
    sessionStorage.setItem('color', variables.inputColor);
    if (variables.selectedElementIndex !== null) {
        variables.elements[variables.selectedElementIndex].color = variables.inputColor;
        draw.drawAllElements();
        util.saveDrawing();
    }
})

//input stroke width
let sliderTextVal = document.getElementById('slider-value-text');
document.getElementById('width-input').addEventListener('input', () => {
    variables.inputWidth = document.getElementById('width-input').value;
    if (variables.currentTool !== 'tool-text')
        sliderTextVal.innerHTML = variables.inputWidth;
    else
        sliderTextVal.innerHTML = variables.inputWidth * 6;
    sessionStorage.setItem('width', variables.inputWidth);
    if (variables.selectedElementIndex !== null) {
        variables.elements[variables.selectedElementIndex].width = variables.inputWidth;
        draw.drawAllElements();
        util.saveDrawing();
    }
});

document.getElementById('bg-color-picker').addEventListener('input', () => {
    variables.bgcolor = document.getElementById('bg-color-picker').value;
    sessionStorage.setItem('bgcolor', variables.bgcolor);
    draw.drawAllElements();
})

window.addEventListener('load', () => {
    if (sessionStorage.getItem('last-tool')) {
        variables.currentTool = sessionStorage.getItem('last-tool');
        document.getElementById(variables.currentTool).click();
    }
    if (sessionStorage.getItem('myDooodle')) {
        variables.elements = JSON.parse(sessionStorage.getItem('myDooodle'));
        if (sessionStorage.getItem('theme')) {
            if (sessionStorage.getItem('theme') === 'dark') {
                document.body.classList.toggle('dark-mode')
            }
        }
    }
    if (sessionStorage.getItem('color')) {
        variables.inputColor = sessionStorage.getItem('color');
        document.getElementById('color-input').value = sessionStorage.getItem('color');
    }
    if (sessionStorage.getItem('width')) {
        variables.inputWidth = sessionStorage.getItem('width');
        sliderTextVal.innerHTML = variables.inputWidth;
        document.getElementById('width-input').value = sessionStorage.getItem('width');
    }
    if (sessionStorage.getItem('bgcolor')) {
        variables.bgcolor = sessionStorage.getItem('bgcolor');
        document.getElementById('bg-color-picker').value = sessionStorage.getItem('bgcolor');
    }
    draw.drawAllElements();
});

util.resizeCanvas();

window.addEventListener('resize', util.resizeCanvas);

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
    draw.drawAllElements();
})

const toolButtons = document.querySelectorAll('.tool-btn');

for (let index = 0; index < toolButtons.length; index++) {
    const element = toolButtons[index];
    element.addEventListener('click', () => {
        variables.currentTool = element.id;
        for (let i = 0; i < toolButtons.length; i++) {
            const tool = toolButtons[i];
            tool.classList.remove('tool-btn-selected');
        }
        for (let index = 0; index < variables.elements.length; index++) {
            const element = variables.elements[index];
            if (element.type === 'tool-triangle-temp') {
                variables.elements.splice(index, 1);
                index--;
            }
        }
        if (variables.currentTool !== 'tool-text')
            sliderTextVal.innerHTML = variables.inputWidth;
        else
            sliderTextVal.innerHTML = variables.inputWidth * 6;
        element.classList.add('tool-btn-selected');
        sessionStorage.setItem('last-tool', variables.currentTool);

        variables.selectedElementIndex = null;
        draw.drawAllElements();
    })
}

canvas.addEventListener('pointerdown', (e) => {
    util.onMouseDown(e);
});

canvas.addEventListener('pointermove', (e) => {
    util.onMouseMove(e);
});

canvas.addEventListener('pointerup', (e) => {
    util.onMouseUp(e);
});

const clear = document.getElementById('action-clear');
clear.addEventListener('click', () => {
    variables.clearedCanvas.push(variables.elements);
    variables.elements = [];
    variables.elements.push({ type: 'clear' });
    draw.drawAllElements();
    util.saveDrawing();
})

const downloadPNG = document.getElementById('action-download');
downloadPNG.addEventListener('click', () => {
    let url = canvas.toDataURL('image/png');
    let link = document.createElement('a');
    link.href = url;
    link.download = 'myDooodle.png';
    link.click();
});

const undoBtn = document.getElementById('action-undo');
undoBtn.addEventListener('click', util.undo);

const redoBtn = document.getElementById('action-redo');
redoBtn.addEventListener('click', util.redo)

window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'Enter' && variables.selectedElementIndex !== null) {
        let selectedEl = variables.elements[variables.selectedElementIndex];
        if (selectedEl.type.includes('tool-text')) {
            e.preventDefault();
            util.editTextContent(selectedEl);
            return;
        }
    }
    if (variables.currentTool !== 'tool-text') {
        e.preventDefault();
        if (variables.selectedElementIndex !== null) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                let selectedEl = variables.elements[variables.selectedElementIndex];

                if (e.key === 'ArrowRight') {
                    selectedEl.deg = (Number(selectedEl.deg) + 5) % 360;
                } else if (e.key === 'ArrowLeft') {
                    selectedEl.deg = (Number(selectedEl.deg) - 5) % 360;
                }

                if (!selectedEl.type.includes('-rotated')) {
                    selectedEl.type += '-rotated';
                }

                draw.drawAllElements();
                util.saveDrawing();
                return;
            }
        }
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z')
                util.undo();
            else if (e.key === 'y')
                util.redo();
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
});