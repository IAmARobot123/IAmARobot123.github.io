const windows = [ ...document.getElementsByClassName('window')];
const background = [ ...document.getElementsByClassName('bgimagecube')];
const moveButtons = [ ...document.getElementsByClassName('move-button')];

const radiusInput = document.getElementById('radius-input');
const opacityInput = document.getElementById('opacity-input');
let windowTransform = [
    { direction: 0, height: 0, vh: 300, vw: 500 },
    { direction: 50, height: 0, vh: 300, vw: 500  },
    { direction: 100, height: 0, vh: 300, vw: 500  },
    { direction: 310, height: 0, vh: 300, vw: 500  },

]


const deg = (n) => n / 180 * Math.PI;
let c = 500;
let r = 0;
let o = 0.8;
let wheelPressed = false;

document.addEventListener('mousemove', (e) => {
    if(wheelPressed)
    r -= e.movementX / 5;
})
document.addEventListener('mousedown', (e) => {
    if(e.button == 1) {
        wheelPressed = true;
        e.preventDefault();
    }
})
document.addEventListener('mouseup', (e) => {
    if(e.button == 1) {
        wheelPressed = false;
        e.preventDefault();
    }
})
for(const n in moveButtons) {
    const assign = [-10, 10];
    moveButtons[n].onclick = () => r += assign[n];
}

const notesSave = document.getElementById('notes-save');
const notesReset = document.getElementById('notes-reset');
const notesInput = document.getElementById('notes-display');
const notesFileName = document.getElementById('notes-filename');
notesSave.onclick = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:txt;charset=utf8,' + encodeURIComponent(notesInput.value));
    element.setAttribute('download', notesFileName.value);
    element.click();
}
notesReset.onclick = () => {
    notesInput.value = '';
}

const paintSave = document.getElementById('paint-save');
const paintReset = document.getElementById('paint-reset');
const paintInput = document.getElementById('paint-display');
const ctx = paintInput.getContext('2d');
const paintFileName = document.getElementById('paint-filename');
paintSave.onclick = () => {
    const element = document.createElement('a');
    element.setAttribute('href', paintInput.toDataURL('png'));
    element.setAttribute('download', paintFileName.value);
    element.click();
}
paintReset.onclick = () => {
    paintInput.height = paintInput.clientHeight;
    paintInput.width = paintInput.clientWidth;
    ctx.reset();
    ctx.fillStyle = '#e0e0ff';
    ctx.fillRect(0, 0, paintInput.width, paintInput.height);
}
paintInput.height = paintInput.clientHeight;
paintInput.width = paintInput.clientWidth;
ctx.fillStyle = '#e0e0ff';
ctx.fillRect(0, 0, paintInput.width, paintInput.height);
let pencilDown = false;
let pencilX = 0, pencilY = 0;
let pencilBX = 0, pencilBY = 0;
paintInput.addEventListener('mousedown', (e) => {
    if(e.button == 0)
    {
        pencilDown = true;
        pencilBX = e.offsetX;
        pencilBY = e.offsetY;
    }
})
document.addEventListener('mouseup', (e) => {
    if(e.button == 0) pencilDown = false;
})
paintInput.addEventListener('mousemove', (e) => {
    pencilX = e.offsetX;
    pencilY = e.offsetY;
})
const chats = [ ...document.getElementsByClassName('chat')];
const display = document.getElementById('chat-output');
const input = document.getElementById('chat-input');
const send = document.getElementById('chat-send');

let selected = 0;
const dialogues = [
    `
    <p class="chat-header">Chat 1</p>
    <p class="msg1">Hello</p>
    `,
    `
    <p class="chat-header">Chat 2</p>
    <p class="msg1">Hi! How's it going?</p>
    <p class="msg2">I'm too busy right now. Let's talk later</p>
    <p class="msg1">Ok</p> 
    `,
    `
    <p class="chat-header">Chat 3</P>
    <p class="msg1">Do you have a moment?</p>
    <p class="msg1">I've to tell you something important</p>
    <p class="msg2">I don't have time</p>
    <p class="msg1">Ok, let's talk later</p>
    `,
]
for(const n in chats) {
    chats[n].addEventListener('click', (e) => {
        selected = n;
        
    })
}
send.onclick = (e) => {
    if(!input.value) return;
    dialogues[selected] += '<p class="msg2">' + input.value + '</p>';
    input.value = '';
}
input.onkeydown = (e) => {
    if(e.key != 'Enter') return;
    if(!input.value) return;
    dialogues[selected] += '<p class="msg2">' + input.value + '</p>';
    input.value = '';
}

const mainBars = [ ...document.getElementsByClassName('main-bar')];
for(const n in mainBars) {
    let selected = false;
    mainBars[n].addEventListener('mousedown', (e) => {
        if(e.button == 0) selected = true;
    })
    document.addEventListener('mouseup', (e) => {
        if(e.button == 0) selected = false;
    })
    document.addEventListener('mousemove', (e) => {
        if(selected) {
            windowTransform[n].direction -= e.movementX / 7;
            windowTransform[n].height += e.movementY;
        }
    })
}

function loop(frame) {
    if(pencilDown) {
        ctx.beginPath();
        ctx.moveTo(pencilBX, pencilBY);
        ctx.lineTo(pencilX, pencilY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#404040';
        ctx.stroke();
        ctx.closePath();
        pencilBX = pencilX;
        pencilBY = pencilY;
    }
    if(paintInput.clientHeight != paintInput.height || paintInput.clientWidth != paintInput.width) {
    {
        paintInput.height = paintInput.clientHeight;
        paintInput.width = paintInput.clientWidth;
        ctx.fillStyle = '#e0e0ff';
        ctx.fillRect(0, 0, paintInput.width, paintInput.height);
    }
    }
    for(const n in background) {

        background[n].style.transform = 
        `
        translate(${window.innerWidth / 2 - 500}px, ${window.innerHeight / 2 - 500}px)
        perspective(1000px)
        translate3d(${-Math.sin(deg(r + n * 90)) * 500}px, ${0}px, ${-Math.cos(deg(r + n * 90)) * 500 + 1000}px)
        rotate3d(0, 1, 0, ${r + n * 90}deg)
        `
    }
    c = radiusInput.value;
    o = opacityInput.value;      
    for(const n in windows) {

        windows[n].style.transform = ''
        windowTransform[n].vw = windows[n].clientWidth;
        windowTransform[n].vh = windows[n].clientHeight;
        windows[n].style.transform = 
        `
        translate(${window.innerWidth / 2 - windowTransform[n].vw / 2}px, ${window.innerHeight / 2 - windowTransform[n].vh / 2}px)
        perspective(1000px)
        translate3d(${-Math.sin(deg(windowTransform[n].direction + r)) * c}px, ${windowTransform[n].height}px, ${-Math.cos(deg(windowTransform[n].direction + r)) * c + 1000}px)
        rotate3d(0, 1, 0, ${windowTransform[n].direction + r}deg)
        `
        windows[n].style.opacity = `${+o + Math.random() / 30}`
    }
    display.innerHTML = dialogues[selected];
    requestAnimationFrame(loop);
}
loop(0);



