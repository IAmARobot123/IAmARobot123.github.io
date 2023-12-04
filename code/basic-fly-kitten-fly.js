console.log('holi');
// import random from 'https://iamarobot123.github.io/code/random.js';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let images;
let mouseX = 0, mouseY = 0, direction = {left: null, right: null}, mouseDown0 = false;
let offscreen = [new OffscreenCanvas(100, 100).getContext('2d'), new OffscreenCanvas(60, 60).getContext('2d')];
const binary32bit = {
    create: function(str) {
        let c = '';
        for(i = 0; i < 32; i++) {
          if(str[31 - i] == '1') {
            c = c | (1 << i);
          }
        }
        return c;
    },
    string: function(num) {
        let c = '';
        for(i = 0; i < 32; i++) {
            if(num & (2 ** i)) {
                c = '1' + c;
            } else {
                c = '0' + c;
            }
        }
        return c;
    },
    setOne: function(num, index, boolean) {
        let c = num;
        if(!boolean) {
            c = c & (-(2 ** index) - 1);
        } else {
            c = c | (2 ** index);
        }
        return c;
    },
    getOne: function(num, index) {
        let c = num;
        c = c & (2 ** index);
        if(c) {
            return true;
        } else {
            return false;
        }
    }
}

document.addEventListener('mousedown', function(e) {
    if(e.button == 0) {
        mouseDown0 = true;
    }
})

document.addEventListener('mouseup', function(e) {
    if(e.button == 0) {
        mouseDown0 = false;
    }
})

document.addEventListener('keydown', function(e) {
    if(!direction.left && !direction.right) {
        if(e.key == 'ArrowLeft') {
            direction.left = 'active';
        } else if(e.key == 'ArrowRight') {
            direction.right = 'active';
        }
    } else {
        if(e.key == 'ArrowLeft' && !direction.left) {
            direction.left = 'sec';
        } else if(e.key == 'ArrowRight' && !direction.right) {
            direction.right = 'sec';
        }
    }
}, false)

document.addEventListener('keyup', function(e) {
    if(e.key == 'ArrowLeft') {
        direction.left = null;
        if(direction.right == 'sec') {
            direction.right = 'active';
        }
    } else if(e.key == 'ArrowRight') {
        direction.right = null;
        if(direction.left == 'sec') {
            direction.left = 'active';
        }
    }
}, false)

document.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX - canvas.offsetLeft) / canvas.clientWidth * 960;
    mouseY = (e.clientY - canvas.offsetTop) / canvas.clientHeight * 540;
})
function loadImages(urls, then) {
    let loadedImages = [];
    let loadedN = 0;
    for (let n = 0; n < urls.length; n++) {
        const img = new Image();
        img.src = urls[n];
        img.addEventListener('load', function () {
            loadedImages[n] = img;
            loadedN++;
            if (loadedN >= urls.length) {
                then(loadedImages);
            }
        })
    }
}

loadImages([
    'images/muro.png',
    'images/character.svg',
    'images/spike.svg',
    'images/coin.svg',
    'images/smoke.svg',
    'images/bag.svg',
    'images/bag2.svg',
    'images/10coin.svg',
    'images/end.png'
], afterLoad)

class Timer {
    constructor() {
        this.from = Date.now() + 1;
        this.ms = function () {
            return Date.now() - this.from;
        };
        this.pause = function(n) {
            if(n !== undefined) {
                this.current = n;
            }
            this.current = this.ms();
        }
        this.restart = function() {
            this.from = this.from + this.ms() - this.current;
        }
    }
}
function afterLoad(i) {
    images = i;
    mainMenu();
}
let g;

async function loadExteriorFunction() {
    return import('something.mjs');

}
async function mainMenu() {
    function drawLevelButtons() {

    }
    if(mouseDown0) {
        const things = await loadExteriorFunction();
        g = new Game(...things);
        setTimeout(function() {
            g.restartGame();
        }, 3000)
        const p = new Promise(function(end, error) {
            function k() {
                if(g.exitRequirement) {
                    g.stopGame();
                    end(g.exitRequirement);
                } else {
                    requestAnimationFrame(k);
                }
            }
            k();
        })
        await p;
    }
    requestAnimationFrame(mainMenu);
}
function Game (ground, spikes, coins, goal, [playerX, playerY]) {
    let scrollX = 0, scrollY = 0, coinAnim = 0, coinScore = 0, timer = 0;
    let playerEyeAnim = [0, 0, 0], playerHidden = false;
    let playerXstr = 0, playerYstr = 0;
    let controlPoint = { x: playerX, y: playerY }, bagFuel = 400;
    let animations = { smoke: [], bag: 0 };
    let wallFaceYouCanSee = undefined;
    let stop = true;
    this.stopGame = function() {
        stop = true;
    }
    this.restartGame = function() {
        timer.restart();
        stop = false;
        basicCycle();
        drawAll();
    }
    this.changeParameters = function (g, s, c, k) {
        ground = !!g? g : ground;
        spikes = !!s? s : spikes;
        coins = !!c? c : coins;
        goal = !!k? k : goal;
    };
    let thisGame = this;
    this.exitRequirement = false;
    {
        let length = 0;
        ground.forEach(function (e) {
            length += e.length;
        });
        wallFaceYouCanSee = new Int32Array(Math.ceil(length / 32));
        prepareTouchingGround();
        timer = new Timer();
        timer.pause(0);
        drawAll();
    }

    function basicCycle() {
        if (!playerHidden) {
            const gravity = 0.3;
            if (direction.left == 'active' && bagFuel) {
                playerXstr--;
                playerYstr++;
                bagFuel--;
            } else if (direction.right == 'active' && bagFuel) {
                playerXstr++;
                playerYstr++;
                bagFuel--;
            }
            playerYstr -= gravity;
            playerXstr = Math.min(6, Math.max(-6, playerXstr / 1.05));
            playerYstr = Math.min(6, Math.max(-6, playerYstr / 1.05));
            playerX += playerXstr;
            playerY += playerYstr;
            isTouchingGround(function (g) {
                if (g) {
                    const moveX = Math.sin(g[1]) * g[0];
                    const moveY = Math.cos(g[1]) * g[0];
                    playerX += moveX;
                    playerY -= moveY;
                    playerXstr += moveX;
                    playerYstr -= moveY;
                }
            });
            function ded() {
                playerHidden = true;
                playerXstr = 0;
                playerYstr = 0;
                setTimeout(function () {
                    playerHidden = false;
                    playerX = controlPoint.x;
                    playerY = controlPoint.y + 2;
                    prepareTouchingGround();
                }, 2000);
            }
            isTouchingSpikes(ded);
            if (playerY < -15) {
                ded();
            }
            if (playerX < 14) {
                playerX = 14;
                playerXstr = 0;
            }
            isTouchingCoins();
        }
        detectGoal(function () {
            thisGame.exitRequirement = true;
        });
        if(!stop) {
            setTimeout(basicCycle, 20);
        }
    }

    function isTouchingSpikes(func) {
        for (n = 0; n < spikes.length; n++) {
            const playercoord = [
                [playerX + 15, playerY + 15],
                [playerX + 15, playerY - 15],
                [playerX - 15, playerY + 15],
                [playerX - 15, playerY - 15]
            ];
            const x = [
                spikes[n].x + (Math.cos(spikes[n].dir) * 0 + Math.sin(spikes[n].dir) * 20),
                spikes[n].x + (Math.cos(spikes[n].dir) * 20 + Math.sin(spikes[n].dir) * -20),
                spikes[n].x + (Math.cos(spikes[n].dir) * -20 + Math.sin(spikes[n].dir) * -20)
            ], y = [
                spikes[n].y + (Math.cos(spikes[n].dir) * 20 - Math.sin(spikes[n].dir) * 0),
                spikes[n].y + (Math.cos(spikes[n].dir) * -20 - Math.sin(spikes[n].dir) * 20),
                spikes[n].y + (Math.cos(spikes[n].dir) * -20 - Math.sin(spikes[n].dir) * -20)
            ];
            for (k = 0; k < 4; k++) {
                const lines = [
                    positionRelativeToLine([x[0], y[0]], [x[1], y[1]], playercoord[k], -1),
                    positionRelativeToLine([x[1], y[1]], [x[2], y[2]], playercoord[k], -1),
                    positionRelativeToLine([x[2], y[2]], [x[0], y[0]], playercoord[k], -1)
                ];
                if (Math.min(...lines) >= 0) {
                    func();
                    return true;
                }
            }
            // Y viceversa: puntos pinchos => personaje
            for (k = 0; k < 3; k++) {
                const dif = [
                    positionRelativeToLine([playerX + 15, playerY + 15], [playerX + 15, playerY - 15], [x[k], y[k]]),
                    positionRelativeToLine([playerX + 15, playerY - 15], [playerX - 15, playerY - 15], [x[k], y[k]]),
                    positionRelativeToLine([playerX - 15, playerY - 15], [playerX - 15, playerY + 15], [x[k], y[k]]),
                    positionRelativeToLine([playerX - 15, playerY + 15], [playerX + 15, playerY + 15], [x[k], y[k]])
                ];
                if (!isNaN(Math.min(...dif))) {
                    func();
                    return true;
                }
            }
        }
    }

    function drawAll() {
        // scroll scene prog.
        let xx = scrollX, yy = scrollY;
        if (playerX + scrollX > 660) {
            xx = scrollX + 660 - (playerX + scrollX); //-
            if (xx < -65535 + 960) {
                xx = -65535 + 960;
            }
        } else if (playerX + scrollX < 300) {
            xx = scrollX + 300 - (playerX + scrollX); //+
            if (xx > 0) {
                xx = 0;
            }
        }
        if (playerY - scrollY > 340) {
            yy = scrollY + (playerY - scrollY) - 340; //+
            if (yy > 65535 - 540) {
                yy = 65535 - 540;
            }
        } else if (playerY - scrollY < 200) {
            yy = scrollY + (playerY - scrollY) - 200; //-
            if (yy < 0) {
                yy = 0;
            }
        }
        if (Math.hypot(xx - scrollX, yy - scrollY) > 20) {
            const hp = Math.hypot(xx - scrollX, yy - scrollY);
            xx = scrollX + (xx - scrollX > 0 ? 1 : -1) * (Math.abs(xx - scrollX) / (hp / 20));
            yy = scrollY + (yy - scrollY > 0 ? 1 : -1) * (Math.abs(yy - scrollY) / (hp / 20));
        }
        scrollX = xx;
        scrollY = yy;
        // drawing prog.
        let d = null;
        if (bagFuel > 0) {
            if (direction.left == 'active' && playerHidden == false) {
                if (bagFuel > 50 || Math.random() > 0.9) {
                    animations.smoke.push({ x: playerX + 10, y: playerY - 6, a: 25, d: 0 });
                }
                d = 'left';
            } else if (direction.right == 'active' && playerHidden == false) {
                if (bagFuel > 50 || Math.random() > 0.9) {
                    animations.smoke.push({ x: playerX - 27, y: playerY - 6, a: 25, d: 1 });
                }
                d = 'right';
            }
        }


        ctx.clearRect(0, 0, 960, 540);
        const pattern = ctx.createPattern(preparePattern(offscreen[0], scrollX, scrollY, images[0]).canvas, 'repeat');
        ctx.fillStyle = pattern;
        drawGround(scrollX, scrollY);
        drawSpikes();
        drawCoins(coinAnim);
        drawAnimations();
        drawGoal();
        if (!playerHidden) {
            if (d == 'left') {
                ctx.setTransform(-1, 0, 0, 1, 0, 0);
                ctx.drawImage(images[5 + animations.bag], -(playerX - 15 + scrollX + 40), 525 - playerY + scrollY);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (Math.random() > 0.5) {
                    animations.bag = animations.bag == 0 ? 1 : 0;
                }
            } else if (d == 'right') {
                ctx.drawImage(images[5 + animations.bag], (playerX - 15 + scrollX - 11), 525 - playerY + scrollY);
                if (Math.random() > 0.5) {
                    animations.bag = animations.bag == 0 ? 1 : 0;
                }
            } else {
                animations.bag = 0;
                if (playerEyeAnim[0] > 0) {
                    ctx.drawImage(images[5 + animations.bag], (playerX - 15 + scrollX - 11), 525 - playerY + scrollY);
                } else {
                    ctx.setTransform(-1, 0, 0, 1, 0, 0);
                    ctx.drawImage(images[5 + animations.bag], -(playerX - 15 + scrollX + 40), 525 - playerY + scrollY);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
            }
            drawCharacter(d);
        }
        drawInterface();
        coinAnim += 0.02;
        if(!stop) {
            requestAnimationFrame(drawAll);
        }
    }
    function drawGoal() {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(images[8], goal.x + scrollX - 40, 540 - goal.y + scrollY - 100);
        ctx.globalAlpha = 1;
    }
    function detectGoal(func) {
        if (playerX > goal.x - 55 && playerX < goal.x + 55 && playerY < goal.y + 115 && playerY > goal.y - 115) {
            func();
            return true;
        }
        return false;
    }

    function drawAnimations() {
        for (n = 0; n < animations.smoke.length; n++) {
            ctx.globalAlpha = animations.smoke[n].a / 25;
            ctx.drawImage(images[4], animations.smoke[n].x + scrollX, 540 - animations.smoke[n].y + scrollY, 16, 16);
            ctx.globalAlpha = 1;
            animations.smoke[n].y -= 0.5;
            animations.smoke[n].x += animations.smoke[n].d == 0 ? 0.2 : -0.2;
            if (animations.smoke[n].a == 0) {
                animations.smoke.shift();
            } else {
                animations.smoke[n].a--;
            }
        }
    }

    function drawInterface() {
        ctx.drawImage(images[3], 10, 10);
        ctx.font = 'bold 30px cursive';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(coinScore, 56, 42);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.strokeText(coinScore, 56, 42);
        const t = Math.trunc(timer.ms() / 60000) + ':' + (Math.trunc(timer.ms() / 1000) % 60 > 9 ? Math.trunc(timer.ms() / 1000) % 60 : '0' + (Math.trunc(timer.ms() / 1000) % 60)) + '.' + (Math.trunc(timer.ms() / 10) % 100 > 9 ? Math.trunc(timer.ms() / 10) % 100 : '0' + (Math.trunc(timer.ms() / 10) % 100));
        ctx.fillText(t, 904 - ctx.measureText(t).width, 42);
        ctx.strokeText(t, 904 - ctx.measureText(t).width, 42);
        if (bagFuel) {
            ctx.strokeStyle = bagFuel > 200 ? '#00ee00' : bagFuel > 50 ? '#e0e000' : '#ee0000';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(63, 84);
            ctx.lineTo(63 + bagFuel / 2.5, 84);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff90';
            ctx.lineWidth = 5;
            ctx.moveTo(63, 80);
            ctx.lineTo(63 + bagFuel / 2.5, 80);
            ctx.stroke();
            ctx.closePath();
        }
    }

    function preparePattern(hcctx, x, y, image) {
        if (x > 0 || y < 0) {
            return null;
        }
        hcctx.drawImage(image, x % image.width, y % image.height);
        hcctx.drawImage(image, x % image.width + image.width, y % image.height);
        hcctx.drawImage(image, x % image.width + image.width, y % image.height - image.height);
        hcctx.drawImage(image, x % image.width, y % image.height - image.height);
        return hcctx;
    }

    function drawSpikes() {
        for (n = 0; n < spikes.length; n++) {
            ctx.rotate(spikes[n].dir);
            //sin[x] * cos[y]
            const x = spikes[n].x + scrollX, y = 540 - spikes[n].y + scrollY, a = spikes[n].dir;
            ctx.drawImage(images[2], Math.cos(a) * x + Math.sin(a) * y - 20, Math.cos(a) * y - Math.sin(a) * x - 20);
            ctx.rotate(-spikes[n].dir);
        }
    }

    function isTouchingCoins() {
        for (n = 0; n < coins.length; n++) {
            if (!coins[n].caught) {
                const points = [
                    [playerX + 15, playerY + 15],
                    [playerX - 15, playerY + 15],
                    [playerX + 15, playerY - 15],
                    [playerX - 15, playerY - 15]
                ];
                if (coins[n].class == '10') {
                    for (k = 0; k < 4; k++) {
                        if (Math.hypot(coins[n].x - points[k][0], coins[n].y - points[k][1]) <= 32) {
                            coins[n].caught = 1;
                            for (q = 0; q < 10; q++) {
                                setTimeout(function () {
                                    coinScore++;
                                }, 20 * q);
                            }
                            if (coins[n].ontouch) {
                                coins[n].ontouch();
                            }
                            break;
                        }
                    }
                } else {
                    for (k = 0; k < 4; k++) {
                        if (Math.hypot(coins[n].x - points[k][0], coins[n].y - points[k][1]) <= 22) {
                            coins[n].caught = 1;
                            coinScore++;
                            break;
                        }
                    }
                }
            }
        }
    }

    function distanceBetweenTwoPoints([x1, y1], [x2, y2]) {
        return Math.hypot(x1 - x2, y1 - y2);
    }

    function drawCoins(a) {
        offscreen[1].clearRect(0, 0, 60, 60);
        offscreen[1].beginPath();
        offscreen[1].fillStyle = '#ffffff40';
        offscreen[1].arc(30, 30, 30, 0, Math.PI * 2, false);
        offscreen[1].fill();
        offscreen[1].closePath();
        offscreen[1].clearRect(400 - (a * 100) % 400 + 8, 0, 800, 60);
        offscreen[1].clearRect(400 - (a * 100) % 400 - 8, 0, -800, 60);
        for (n = 0; n < coins.length; n++) {
            if (!coins[n].caught) {
                if (coins[n].class == '10') {
                    ctx.drawImage(images[7], coins[n].x + scrollX - 30, 540 - coins[n].y + scrollY - 30);
                    const x = coins[n].x + scrollX, y = 540 - coins[n].y + scrollY;
                    ctx.rotate(0.5);
                    ctx.drawImage(offscreen[1].canvas, Math.cos(0.5) * x + Math.sin(0.5) * y - 30, Math.cos(0.5) * y - Math.sin(0.5) * x - 30, 60, 60);
                    ctx.rotate(-0.5);
                } else {
                    ctx.rotate(a);
                    const x = coins[n].x + scrollX, y = 540 - coins[n].y + scrollY;
                    ctx.drawImage(images[3], Math.cos(a) * x + Math.sin(a) * y - 20, Math.cos(a) * y - Math.sin(a) * x - 20);
                    ctx.rotate(-a + 0.5);
                    ctx.drawImage(offscreen[1].canvas, Math.cos(0.5) * x + Math.sin(0.5) * y - 20, Math.cos(0.5) * y - Math.sin(0.5) * x - 20, 40, 40);
                    ctx.rotate(-0.5);

                }
            } else if (coins[n].caught !== true) {
                if (coins[n].caught > 20) {
                    coins[n].caught = true;
                } else {
                    if (coins[n].class == '10') {
                        ctx.globalAlpha = (20 - coins[n].caught) / 20;
                        ctx.drawImage(images[7], coins[n].x + scrollX - 30, 540 - coins[n].y + scrollY - 30 - coins[n].caught * 2);
                        coins[n].caught++;
                        ctx.globalAlpha = 1;
                    } else {
                        a *= 2;
                        ctx.rotate(a);
                        ctx.globalAlpha = (20 - coins[n].caught) / 20;
                        const x = coins[n].x + scrollX, y = 540 - coins[n].y + scrollY - coins[n].caught * 2;
                        ctx.drawImage(images[3], Math.cos(a) * x + Math.sin(a) * y - 20, Math.cos(a) * y - Math.sin(a) * x - 20);
                        ctx.rotate(-a);
                        coins[n].caught++;
                        ctx.globalAlpha = 1;
                        a /= 2;
                    }
                }
            }
        }
    }

    function drawCharacter(direction) {
        ctx.drawImage(images[1], playerX - 15 + scrollX, 525 - playerY + scrollY, 30, 30);

        let a = 0;
        if (Math.random() < 0.002 && !playerEyeAnim[2]) {
            playerEyeAnim[2] = 6.66667;
        } else if (playerEyeAnim[2]) {
            a = Math.abs(playerEyeAnim[2] - 3.33332) / 1;
            playerEyeAnim[2] -= 0.66667;
            if (playerEyeAnim[2] < 0) {
                playerEyeAnim[2] = 0;
            }
        }
        playerEyeAnim[0] = Math.min(2, Math.max(-2, (mouseX - (playerX + scrollX)) / 150));
        playerEyeAnim[1] = Math.min(2, Math.max(-2, (mouseY - (playerY + scrollY)) / 150));
        if (a < 4) {
            if (direction == 'right' || (!direction && playerEyeAnim[0] > 0)) {
                ctx.lineWidth = 2.6666666667;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(playerX - 15 + 23.33333 + playerEyeAnim[0] + scrollX, 525 - playerY + 6.66667 + playerEyeAnim[1] + playerEyeAnim[2] + scrollY);
                ctx.lineTo(playerX - 15 + 23.33333 + playerEyeAnim[0] + scrollX, 525 - playerY + 13.33333 + playerEyeAnim[1] - playerEyeAnim[2] + scrollY);
                ctx.stroke();
                ctx.moveTo(playerX - 15 + 18 + playerEyeAnim[0] + scrollX, 525 - playerY + 6.66667 + playerEyeAnim[1] + playerEyeAnim[2] + scrollY);
                ctx.lineTo(playerX - 15 + 18 + playerEyeAnim[0] + scrollX, 525 - playerY + 13.33333 + playerEyeAnim[1] - playerEyeAnim[2] + scrollY);
                ctx.stroke();
                ctx.closePath();
            } else if (direction == 'left' || (!direction && playerEyeAnim[0] <= 0)) {
                ctx.lineWidth = 2.6666666667;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(playerX + 15 - 23.33333 + playerEyeAnim[0] + scrollX, 525 - playerY + 6.66667 + playerEyeAnim[1] + playerEyeAnim[2] + scrollY);
                ctx.lineTo(playerX + 15 - 23.33333 + playerEyeAnim[0] + scrollX, 525 - playerY + 13.33333 + playerEyeAnim[1] - playerEyeAnim[2] + scrollY);
                ctx.stroke();
                ctx.moveTo(playerX + 15 - 18 + playerEyeAnim[0] + scrollX, 525 - playerY + 6.66667 + playerEyeAnim[1] + playerEyeAnim[2] + scrollY);
                ctx.lineTo(playerX + 15 - 18 + playerEyeAnim[0] + scrollX, 525 - playerY + 13.33333 + playerEyeAnim[1] - playerEyeAnim[2] + scrollY);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
    function positionRelativeToLine([x1, y1], [x2, y2], [x3, y3], err) {
        if (!err) {
            err = 0;
        }
        const dir = Math.atan2(y1 - y2, x1 - x2);
        const fx1 = Math.cos(dir) * x1 + Math.sin(dir) * y1;
        const fy1 = Math.cos(dir) * y1 - Math.sin(dir) * x1;
        const fx2 = Math.cos(dir) * x2 + Math.sin(dir) * y2;
        const fy2 = Math.cos(dir) * y2 - Math.sin(dir) * x2;
        const fx3 = Math.cos(dir) * x3 + Math.sin(dir) * y3;
        const fy3 = Math.cos(dir) * y3 - Math.sin(dir) * x3;
        if (!(fx3 > fx2 + err && fx3 < fx1 - err)) {
            return (fy3 - fy2) > 0 ? 'positive' : 'negative';
        } else {
            return fy3 - fy2;
        }
    }

    function isPointOverPoint([x1, y1], [x2, y2]) {
        return [x2 - x1, y2 - y1];
    }
    function isTouchingGround(func) {
        let count = 0;
        let f = [], d = [], frel = [];
        let saveControl = false;
        function lines() {
            let t = false;
            for (n = 0; n < ground.length; n++) {
                for (m = 0; m < ground[n].length; m += 2) {
                    let point1 = [
                        ground[n][m],
                        ground[n][m + 1],
                    ];
                    let point2 = ground[n][m + 2] !== undefined ? [
                        ground[n][m + 2],
                        ground[n][m + 3]
                    ] : [
                        ground[n][0],
                        ground[n][1]
                    ];

                    const errBound = 6;
                    const p = [
                        positionRelativeToLine(point1, point2, [playerX + 15, playerY - 15], errBound),
                        positionRelativeToLine(point1, point2, [playerX + 15, playerY + 15], errBound),
                        positionRelativeToLine(point1, point2, [playerX - 15, playerY - 15], errBound),
                        positionRelativeToLine(point1, point2, [playerX - 15, playerY + 15], errBound)
                    ];
                    for (k = 0; k < 4; k++) {
                        if (p[k] != 'positive' && p[k] != 'negative') {
                            const a = binary32bit.getOne(wallFaceYouCanSee[Math.trunc(count / 32)], count % 32);
                            if (p[k] > 0 && !a || p[k] < 0 && a) {
                                frel.push(p[k]);
                                f.push(Math.abs(p[k]));
                                d.push(Math.atan2(point1[1] - point2[1], point1[0] - point2[0]));
                                if (Math.atan2(point1[1] - point2[1], point1[0] - point2[0]) > Math.PI - 0.1 && Math.atan2(point1[1] - point2[1], point1[0] - point2[0]) < Math.PI + 0.1) {
                                    t = true;
                                }
                            }
                        }
                    }
                    const pf = positionRelativeToLine(point1, point2, [playerX, playerY]);
                    if (pf == 'positive' || pf > 0) {
                        wallFaceYouCanSee[Math.trunc(count / 32)] = binary32bit.setOne(wallFaceYouCanSee[Math.trunc(count / 32)], count % 32, true);
                    } else if (pf == 'negative' || pf < 0) {
                        wallFaceYouCanSee[Math.trunc(count / 32)] = binary32bit.setOne(wallFaceYouCanSee[Math.trunc(count / 32)], count % 32, false);
                    }
                    count++;
                }
            }
            saveControl = saveControl || t;
        }

        function points() {
            for (let n = 0; n < ground.length; n++) {
                for (let m = 0; m < ground[n].length; m += 2) {
                    let point1 = [
                        ground[n][m],
                        ground[n][m + 1],
                    ];
                    const dif = [
                        positionRelativeToLine([playerX + 15, playerY + 15], [playerX + 15, playerY - 15], point1),
                        positionRelativeToLine([playerX + 15, playerY - 15], [playerX - 15, playerY - 15], point1),
                        positionRelativeToLine([playerX - 15, playerY - 15], [playerX - 15, playerY + 15], point1),
                        positionRelativeToLine([playerX - 15, playerY + 15], [playerX + 15, playerY + 15], point1)
                    ];
                    if (!isNaN(Math.min(...dif))) {
                        const direction = [
                            (-Math.PI) / 2,
                            Math.PI,
                            Math.PI / 2,
                            0
                        ];
                        const bound = 0.00001;
                        if (!(Math.round(dif[0] / bound) * bound == Math.round(dif[1] / bound) * bound || Math.round(dif[0] / bound) * bound == Math.round(dif[3] / bound) * bound || Math.round(dif[2] / bound) * bound == Math.round(dif[1] / bound) * bound || Math.round(dif[2] / bound) * bound == Math.round(dif[3] / bound) * bound)) {
                            frel.push(Math.min(...dif));
                            f.push(Math.min(...dif));
                            d.push(direction[dif.indexOf(Math.min(...dif))]);
                            if (dif.indexOf(Math.min(...dif)) == 1) {
                                saveControl = true;
                            }
                        } else {
                        }
                    }
                }
            }
        }
        const maxAtOnce = 6;
        points();
        lines();
        const w = addStrength(d, frel);
        func([Math.min(w.f, maxAtOnce), w.d]);
        if (saveControl) {
            controlPoint = {
                x: playerX,
                y: playerY
            };
            bagFuel = 400;
        }
    }

    function addStrength(dirarray, strarray) {
        let dirresult = 0, strresult = 0;
        for (n = 0; n < dirarray.length; n++) {
            let x = Math.sin(dirresult) * strresult, y = Math.cos(dirresult) * strresult;
            let x2 = Math.sin(dirarray[n]) * strarray[n], y2 = Math.cos(dirarray[n]) * strarray[n];
            if (Math.abs(x2) > Math.abs(x)) {
                x = x2;
            }
            if (Math.abs(y2) > Math.abs(y)) {
                y = y2;
            }
            dirresult = Math.atan2(x, y);
            strresult = Math.hypot(y, x);
        }
        return { f: strresult, d: dirresult };
    }
    function prepareTouchingGround() {
        let count = 0;
        for (n = 0; n < ground.length; n++) {
            for (m = 0; m < ground[n].length; m += 2) {
                point1 = [
                    ground[n][m],
                    ground[n][m + 1],
                ];
                point2 = ground[n][m + 2] !== undefined ? [
                    ground[n][m + 2],
                    ground[n][m + 3]
                ] : [
                    ground[n][0],
                    ground[n][1]
                ];
                const p = positionRelativeToLine(point1, point2, [playerX, playerY]);
                if (p == 'positive' || p > 0) {
                    wallFaceYouCanSee[Math.trunc(count / 32)] = binary32bit.setOne(wallFaceYouCanSee[Math.trunc(count / 32)], count % 32, true);
                } else if (p == 'negative' || p < 0) {
                    wallFaceYouCanSee[Math.trunc(count / 32)] = binary32bit.setOne(wallFaceYouCanSee[Math.trunc(count / 32)], count % 32, false);
                }
                count++;
            }
        }
        return wallFaceYouCanSee;
    }
    function drawGround(x, y) {
        for (n = 0; n < ground.length; n++) {
            ctx.beginPath();
            ctx.moveTo(ground[n][0] + x, 540 - ground[n][1] + y);
            for (m = 2; m < ground[n].length; m += 2) {
                ctx.lineTo(ground[n][m] + x, 540 - ground[n][m + 1] + y);
            }
            ctx.fill();
            ctx.closePath();
        }
    }
}



function prepareGround() {
    let ground = [], spikes = [], coins = [], goal = {};
    // Max Uint16: 65535
    ground.push(new Uint16Array([0, 900, 800, 900, 1300, 900, 1800, 600, 1800, 400, 1300, 700, 800, 400, 0, 400]))
    ground.push(new Uint16Array([0, 200, 200, 200, 200, 0, 0, 0]))
    ground.push(new Uint16Array([400, 200, 600, 200, 600, 0, 400, 0]))
    ground.push(new Uint16Array([800, 200, 1000, 275, 1000, 0, 800, 0]))
    ground.push(new Uint16Array([1200, 0, 1200, 450, 1300, 500, 1400, 450, 1400, 200, 2000, 200, 2000, 800, 2200, 800, 2200, 0]))
    ground.push(new Uint16Array([1800, 800, 1300, 1100, 1100, 1100, 1100, 900, 0, 900, 0, 900, 0, 1500, 3600, 1500, 3600, 800, 3400, 900, 3400, 1000, 2600, 1000, 2600, 500, 2500, 450, 2400, 500, 2400, 1000, 1800, 1000]))
    ground.push(new Uint16Array([2400, 200, 2500, 250, 2600, 200, 2600, 0, 2400, 0]))
    ground.push(new Uint16Array([2800, 800, 2900, 850, 2900, 600, 3100, 600, 3100, 850, 3200, 800, 3200, 600, 3400, 600, 3400, 750, 3500, 700, 3500, 600, 3600, 600, 3600, 0, 2800, 0]))
    ground.push(new Uint16Array([3600, 0, 3600, 600, 3800, 600, 3800, 800, 3600, 800, 3600, 1500, 4200, 1500, 4200, 0]))
    for(n = 0; n < 3; n++) {
        spikes.push({x: 2960 + n * 40, y: 980, dir: Math.PI});
        spikes.push({x: 3260 + n * 40, y: 980, dir: Math.PI});
        spikes.push({x: 440 + n * 40, y: 380, dir: Math.PI});
        spikes.push({x: 840 + n * 34.29971702850177, y: 400 + n * 20.579830217101062, dir: Math.PI - 0.5404195002705842});
        coins.push({x: 240 + n * 60, y: 280 + (n == 1? 30 : 0), caught: false});
        coins.push({x: 640 + n * 60, y: 280 + (n == 1? 30 : 0), caught: false});
        coins.push({x: 1000 + n * 60, y: 380 + n * 50, caught: false});
        coins.push({x: 1240 + n * 60, y: 570 + (n == 1? 30 : 0), caught: false});
        coins.push({x: 2040 + n * 60, y: 885 + (n == 1? 30 : 0), caught: false});
        coins.push({x: 2440 + n * 60, y: 375 - (n == 1? 30 : 0), caught: false});
        coins.push({x: 1600 - n * 60, y: 380 + n * 50, caught: false});
        spikes.push({x: n == 1? 1980 : 1820, y: 420 + n * 80, dir: n == 1? -Math.PI / 2 : Math.PI / 2})
        spikes.push({x: n == 1? 2620 : 2780, y: 500 + n * 80, dir: n == 1? Math.PI / 2 : -Math.PI / 2})
        spikes.push({x: n == 1? 2380 : 2220, y: 500 + n * 80, dir: n == 1? -Math.PI / 2 : Math.PI / 2})
        spikes.push({x: 1740 - n * 180, y: 660 + n * 108, dir: 0.5404195002705842});
        spikes.push({x: 1700 - n * 180, y: 836 + n * 108, dir: Math.PI + 0.5404195002705842});
    }
    for(n = 0; n < 4; n++) {
        coins.push({x: 2910 + n * 60, y: 915 - (n == 1 || n == 2? 30 : 0)});
        coins.push({x: 3210 + n * 60, y: 880 - Math.max(0, n - 1) * 40});
    }
    for(n = 0; n < 5; n++) {
        coins.push({x: 1900, y: 460 + n * 70});
        coins.push({x: 2700, y: 460 + n * 70});
        spikes.push({x: 1820, y: 820 + n * 40, dir: Math.PI / 2});
        spikes.push({x: 2380, y: 820 + n * 40, dir: -Math.PI / 2});
        coins.push({x: 1800 - n * 100, y: 700 + n * 60});
        coins.push({x: 2300, y: 460 + n * 70});
        spikes.push({x: 2920 + n * 40, y: 620, dir: 0});
        spikes.push({x: 3220 + n * 40, y: 620, dir: 0});
    }
    coins.push({x: 1800 - 500, y: 700 + 300});
    spikes.push({x: 1980, y: 660, dir: -Math.PI / 2});
    spikes.push({x: 1200, y: 616, dir: Math.PI - 0.5404195002705842});
    spikes.push({x: 1400, y: 616, dir: Math.PI + 0.5404195002705842});
    spikes.push({x: 1326, y: 510, dir: 2.0344439357957027 - Math.PI / 2});
    coins.push({x: 1200, y: 1000, class: '10', ontouch: function() {
        controlPoint = {x: 1200, y: 1000};
    }}) // dar valor a la coin de 10
    spikes.push({x: 1274, y: 510, dir: -2.0344439357957027 + Math.PI / 2});
    goal = {x: 3700, y: 700};
    let playerX = 100;
    let playerY = 215;
    return [ground, spikes, coins, goal, [playerX, playerY]]
}



//ctx.beginPath();
//ctx.moveTo(0, 100);
//ctx.lineTo(80, 20);
//ctx.lineTo(90, 120);
//ctx.fill();
//ctx.closePath();
