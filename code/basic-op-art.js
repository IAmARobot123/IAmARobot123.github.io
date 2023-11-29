const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const code = document.getElementById('code');
const butt = document.getElementById('run');
let circles = [];
butt.onclick = function() {
    try {
        eval(code.value).length;
        circles = eval(code.value);
    } catch(e) {
        code.value = 'Uncaught' + e;
    }
}

// circles.push({r: 200, initr: 0, colors: ['#ffff00', '#000000'], sides: 60, path: ['line', 0.33, 0.25,'line', 0.7, -0.25, 'line', 1, 0], speed: 0.2, centerx: 600, centery: 360});
// circles.push({r: 200, initr: 0, colors: ['#ffff00', '#000000'], sides: 60, path: ['line', 0.33, -0.25,'line', 0.7, 0.25, 'line', 1, 0], speed: -0.2, centerx: 330, centery: 360});

let f = 0;

function animateTotal() {
    ctx.clearRect(0, 0, 960, 720);
    for(let n = 0; n < circles.length; n++) {
        animate(circles[n], f);
    }
    f++;
    requestAnimationFrame(animateTotal);
}
animateTotal();
function animate(c, frame) {
    const colors = c.colors;
    const sides = c.sides;
    const rad = c.r;
    const path = c.path;
    const pos = frame * c.speed;
    for(n = 0; n < sides; n++) {
        ctx.fillStyle = colors[n % colors.length];
        ctx.rotate(Math.PI / (sides / 2) * n + pos);
        const cx = Math.cos(Math.PI / (sides / 2) * n + pos) * (c.centerx) + Math.sin(Math.PI / (sides / 2) * n + pos) * (c.centery), cy = Math.cos(Math.PI / (sides / 2) * n + pos) * (c.centery) - Math.sin(Math.PI / (sides / 2) * n + pos) * (c.centerx);
        ctx.beginPath();
        ctx.moveTo(cx, cy)
        doLine(path, 0, rad, cx, cy);
        ctx.arcTo(cx + rad, cy + Math.sin(Math.PI / sides) * rad, 
            cx + Math.cos(Math.PI / (sides) * 2) * rad, 
            cy + Math.sin(Math.PI / (sides) * 2) * rad, 
        rad)   
        const back = invert(path);
        doLine(back, Math.PI / (sides / 2), rad, cx, cy);
        ctx.lineTo(cx, cy)
        ctx.fill();
        ctx.closePath();
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
}
function invert(p) {
    let p2 = [];
    for(let n = p.length - 1; n >= 0;) {
        if(p[n - 2] == 'line') {
            p2.push('line');
            if(p[n - 4] !== undefined) {
                p2.push(p[n - 4]);
                p2.push(p[n - 3]);
            } else {
                p2.push(0);
                p2.push(0);
            }
            n -= 3;
        } else if(p[n - 6] == 'curve') {
            p2.push('curve');
            p2.push(p[n - 3]);
            p2.push(p[n - 2]);
            p2.push(p[n - 5]);
            p2.push(p[n - 4]);
            if(p[n - 8] !== undefined) {
                p2.push(p[n - 8]);
                p2.push(p[n - 7]);
            } else {
                p2.push(0);
                p2.push(0);
            }
            n -= 7;
        }
    }
    return p2;
}
function doLine(p, rotate, rad, cx, cy) {
    for(let n = 0; n < p.length;) {
        if(p[n] == 'line') {
            const x = p[n + 1] * rad, y = p[n + 2] * rad;
            ctx.lineTo(cx + Math.cos(rotate) * x - Math.sin(rotate) * y,  cy + Math.cos(rotate) * y + Math.sin(rotate) * x);
            n += 3;
        } else if(p[n] == 'curve') {
            const x1 = p[n + 1] * rad, y1 = p[n + 2] * rad;
            const x2 = p[n + 3] * rad, y2 = p[n + 4] * rad;
            const x3 = p[n + 5] * rad, y3 = p[n + 6] * rad;
            ctx.bezierCurveTo(cx + Math.cos(rotate) * x1 - Math.sin(rotate) * y1,
                cy + Math.cos(rotate) * y1 + Math.sin(rotate) * x1, 
                cx + Math.cos(rotate) * x2 - Math.sin(rotate) * y2,
                cy + Math.cos(rotate) * y2 + Math.sin(rotate) * x2,
                cx + Math.cos(rotate) * x3 - Math.sin(rotate) * y3,
                cy + Math.cos(rotate) * y3 + Math.sin(rotate) * x3);
            n += 7;
        }
    }
}


