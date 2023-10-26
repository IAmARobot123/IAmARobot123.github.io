
let mouseX = 0, mouseY = 0, down = [];
let images, playingNow, volume = 1;
const characterCostumes = [
    5, 9, 0, 10, 11
]

if (!localStorage.getItem('character')) {
    localStorage.setItem('character', 0);
}

document.addEventListener('mousemove', function (e) {
    canvas.offsetLeft = 0;
    canvas.offsetTop = 0;
    mouseX = (e.clientX - canvas.offsetLeft) / canvas.clientWidth * 960;
    mouseY = (e.clientY - canvas.offsetTop) / canvas.clientHeight * 720;
}, false)

document.addEventListener('mousedown', function (e) {
    down[e.button] = true;
}, false)
document.addEventListener('mouseup', function (e) {
    down[e.button] = false;
}, false)

document.addEventListener('keydown', function (e) {
    if (playingNow) {
        if (e.keyCode == 32) {
            down[0] = true;
        } else if (e.keyCode == 13) {
            down[2] = true;
        }
    }
}, false)

document.addEventListener('keyup', function (e) {
        if (playingNow) {
        if (e.keyCode == 32) {
            down[0] = false;
        } else if (e.keyCode == 13) {
            down[2] = false;
        }
    }
}, false)

document.addEventListener('touchmove', function (e) {
    mouseX = (e.targetTouches[0].clientX - canvas.offsetLeft) / canvas.clientWidth * 960;
    mouseY = (e.targetTouches[0].clientY - canvas.offsetTop) / canvas.clientHeight * 720;
}, false)

document.addEventListener('touchstart', function (e) {
    if(playingNow) {
        if(e.targetTouches[0].clientY > 660) {
            down[2] = true;
        } else {
            down[0] = true;
        }
    } else {
        down[0] = true;
    }
    mouseX = (e.targetTouches[0].clientX - canvas.offsetLeft) / canvas.clientWidth * 960;
    mouseY = (e.targetTouches[0].clientY - canvas.offsetTop) / canvas.clientHeight * 720;
}, false)

document.addEventListener('touchend', function (e) {
    down = [false, false, false, false]
}, false)

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
}, false)

loadImages(['https://iamarobot123.github.io/images/character.svg',
    'https://iamarobot123.github.io/images/block.svg',
    'https://iamarobot123.github.io/images/!.svg',
    'https://iamarobot123.github.io/images/play.svg',
    'https://iamarobot123.github.io/images/restart.svg',
    'https://iamarobot123.github.io/images/character2.svg',
    'https://iamarobot123.github.io/images/audio.svg',
    'https://iamarobot123.github.io/images/notaudio.svg',
    'https://iamarobot123.github.io/images/background.svg',
    'https://iamarobot123.github.io/images/character3.svg',
    'https://iamarobot123.github.io/images/character4.svg',
    'https://iamarobot123.github.io/images/character5.svg',
], function (imglist) {
    images = imglist;
    loadAudio('https://iamarobot123.github.io/audios/1251734_Super-Cat-Tales-Ghost-Hous.mp3',
        function (audio) {
            playAudio(audio);
            ctx.clearRect(0, 0, 960, 720);
            drawMainMenu();
        })

});

function background() {
    ctx.drawImage(images[8], 0, 0, 960, 720)
}

function drawMainMenu() {
    let cursor = 'inherit';
    if (!playingNow) {
        background();
        ctx.font = '44px helvetica';
        ctx.fillText('Kittens Dash', 480 - ctx.measureText('Kittens Dash').width / 2, 150);
        const bestScore = localStorage.getItem('hs');
        if (bestScore) {
            ctx.font = '30px helvetica';
            ctx.fillText('Best score: ' + bestScore, 480 - ctx.measureText('Best score: ' + bestScore).width / 2, 220);
        }
        ctx.drawImage(images[1], 430, 310, 100, 100);
        ctx.drawImage(images[3], 450, 330, 60, 60);
        if (mouseX > 430 && mouseX < 530 && mouseY > 310 && mouseY < 410) {
            cursor = 'pointer';
            if (down[0] && !playingNow) {
                startPlaying();
            }
        }
        ctx.drawImage(images[1], 560, 320, 80, 80);
        ctx.drawImage(images[4], 576, 336, 48, 48);
        if (mouseX > 560 && mouseX < 640 && mouseY > 320 && mouseY < 400) {
            cursor = 'pointer';
            if (down[0] && !playingNow) {
                localStorage.removeItem('hs');
            }
        }

        if (characterCostumes[localStorage.getItem('character')] === undefined) {
            localStorage.setItem('character', 0)
        }
        ctx.drawImage(images[1], 320, 320, 80, 80);
        if (volume) {
            ctx.drawImage(images[6], 336, 336, 48, 48);
        } else {
            ctx.drawImage(images[7], 336, 336, 48, 48);
        }

        if (mouseX > 320 && mouseX < 400 && mouseY > 320 && mouseY < 400) {
            cursor = 'pointer';
            if (down[0] && !playingNow) {
                if (volume) {
                    volume = 0;
                } else {
                    volume = 1;
                }
            }
        }

        drawCharacter(images[characterCostumes[localStorage.getItem('character')]], { avoid: 330, y: 275 });
        if (mouseX > 330 && mouseX < 375 && mouseY > 275 && mouseY < 320) {
            cursor = 'pointer';
            if (down[0] && !playingNow) {
                console.log(localStorage.getItem('character'))
                localStorage.setItem('character', localStorage.getItem('character') * 1 + 1)
                console.log(localStorage.getItem('character'))
            }
        }

        down[0] = false;
    }
    canvas.style.cursor = cursor;
    requestAnimationFrame(drawMainMenu);
}

async function playAudio(audio) {
    // thanks to @thenanercat
    audio.volume = volume;
    const p = audio.play();
    p.catch(function () {
        volume = 0;
        document.addEventListener('click', function () {
            playAudio(audio);
        }, false)
    });
    await p;
    setTimeout(function () {
        if (audio.currentTime > 34.9) {
            audio.currentTime = 7.56;
        }
        playAudio(audio)
    }, 100)
}

let shakeEffect = { x: 10, y: 0, str: 0 };

function loadAudio(url, then) {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    audio.autoplay = true;
    audio.addEventListener('canplaythrough', function () {
        then(audio);
    })
}

function loadImages(srcarray, then) {
    let srclength = srcarray.length, currents = 0, array = [];
    for (let n = 0; n < srclength; n++) {
        const image = new Image();
        image.src = srcarray[n];
        image.addEventListener('load', function () {
            currents++;
            array[n] = image;
            if (currents >= srclength) {
                then(array);
            }
        }, false);
    }
}

function startPlaying() {
    let characters, balls, cycle, alive = 12, ground = [];
    let score = 0;
    playingNow = true;

    cycle = Math.round(Math.random() * 100 + 200);
    characters = [];
    balls = [];
    for (n = 0; n < 12; n++) {
        characters[n] = {
            x: n * 60 + 120 + Math.random() * 15,
            avoid: undefined,
            y: 615,
            jump: 0,
            dead: false,
        }
    }
    repeat();
    drawAll(images);

    function repeat() {
        if (!playingNow) {
            return;
        }
        cycle--;
        if (cycle == 0) {
            let c;
            if(Math.random() > 0.2) {
                if (Math.random() < 0.5) {
                    c = {
                        active: false,
                        type: 'bounce',
                        dir: 'left',
                        x: -60,
                        y: 20,
                        str: 0,
                        speed: 5 + Math.random() * 3,
                    };
                } else {
                    c = {
                        active: false,
                        type: 'basic',
                        dir: 'left',
                        x: -60,
                        speed: 5 + Math.random() * 3,
                    };
                }
    
                if (Math.random() > 0.5) {
                    c.dir = 'right';
                    c.x = 960;
                }
    
                balls.push(c);
                cycle = Math.round(Math.random() * 100 + 200);
                setTimeout(function () {
                    balls[balls.indexOf(c)].active = true;
                }, 1000)
            } else {
                const num = Math.floor(Math.random() * 11.9999999999999999)
                ground[num] = 'alert';
                setTimeout(function() {
                    ground[num] = 1;  
                    setTimeout(function() {
                        ground[num] = 0;
                    }, 1500)
                }, 1000)
                cycle = Math.round(Math.random() * 50 + 120);
            }

        }
        let shake = 0;
        for (m = 0; m < balls.length; m++) {
            const s = controlBall(m);
            if (s) {
                shake += s;
            }
        }
        shakeEffect.str = shake;
        for (n = 0; n < 12; n++) {
            controlCharacter(n);
        }
        if (alive < 4) {
            armyDeadFunction();
            return;
        } else {
            score += alive / 250;
            setTimeout(repeat, 20);
        }

    }

    function controlBall(n) {
        if (!balls[n]) {
            return;
        }
        if (balls[n].active && balls[n].type == 'basic') {
            if (balls[n].dir == 'left') {
                balls[n].x += balls[n].speed;
                if (balls[n].x > 960) {
                    balls.splice(n, 1)
                    return;
                }
            } else {
                balls[n].x -= balls[n].speed;
                if (balls[n].x < -60) {
                    balls.splice(n, 1)
                    return;
                }
            }
            /*
            if(characters[((balls[n].x - 30) - (balls[n].x - 30) % 60) / 60 - 1]?.y > 600 && !characters[((balls[n].x - 30) - (balls[n].x - 30) % 60) / 60 - 1].dead) {
                characters[((balls[n].x - 30) - (balls[n].x - 30) % 60) / 60 - 1].dead = true;
                alive--;
            }
            */
        } else if (balls[n].active && balls[n].type == 'bounce') {
            if (balls[n].dir == 'left') {
                balls[n].x += balls[n].speed;
                if (balls[n].x > 960) {
                    balls.splice(n, 1)
                    return;
                }
            } else {
                balls[n].x -= balls[n].speed;
                if (balls[n].x < -60) {
                    balls.splice(n, 1)
                    return;
                }
            }
            balls[n].y += balls[n].str;
            balls[n].str += 0.6;
            if (balls[n].y > 650) {
                balls[n].str = (-balls[n].str) * 0.7;
            }
            return Math.abs(Math.min(0, balls[n].str))
        }
    }

    function controlCharacter(n) {
        if (!characters[n].dead) {
            if (characters[n].x > mouseX - 110 && characters[n].x < mouseX + 65 && down[2]) {
                if (characters[n].x - mouseX > 0) {
                    characters[n].avoid = mouseX + 65;
                } else {
                    characters[n].avoid = mouseX - 110;
                }
            } else {
                characters[n].avoid = characters[n].x;
            }
            if (mouseX - mouseX % 60 == characters[n].avoid - characters[n].avoid % 60 && down[0]) {
                if (characters[n].y >= 615) {
                    characters[n].jump = 15;
                }
            }
            characters[n].y -= characters[n].jump;
            if (characters[n].y >= 615 && characters[n].jump <= 0) {
                characters[n].jump = 0;
                characters[n].y = 615;
                if(ground[(characters[n].avoid - characters[n].avoid % 60) / 60 - 2] && ground[(characters[n].avoid - characters[n].avoid % 60) / 60 - 2] != 'alert') {
                    if(ground[((characters[n].avoid + 45) - (characters[n].avoid + 45) % 60) / 60 - 2] && ground[((characters[n].avoid + 45) - (characters[n].avoid + 45) % 60) / 60 - 2] != 'alert') {
                        characters[n].dead = true;
                        alive--;
                    }
                }
            } else {
                characters[n].jump -= 0.7;
            }
            if (isBallOver(characters[n].avoid, characters[n].y)) {
                characters[n].dead = true;
                alive--;
            }
        }
    }

    function isBallOver(x, y) {
        for (m = 0; m < balls.length; m++) {
            if (balls[m].type == 'basic') {
                if ((balls[m].x - 30) - (balls[m].x - 30) % 60 == x - 60 - x % 60 && y > 600) {
                    return true;
                }
            } else {
                if (balls[m].x - x > -15 && balls[m].x - x < 60 && balls[m].y - y > -15 && balls[m].y - y < 60) {
                    return true;
                }
            }
        }
        return false;
    }

    function drawAll(images) {
        if (!playingNow || alive < 4) {
            return;
        }
        ctx.clearRect(0, 0, 960, 720)
        for (n = 0; n < 16; n++) {
            if(!ground[n - 2]) {
                ctx.drawImage(images[1], n * 60, 660);
            } else if(ground[n - 2] == 'alert') {
                ctx.drawImage(images[1], n * 60, 660);
                ctx.drawImage(images[2], n * 60 + 20, 660);
            } else {
                ctx.drawImage(images[1], n * 60, 660 + ground[n - 2] * 6);
                ground[n - 2]++;
            }
        }
        for (n = 0; n < 12; n++) {
            if (!characters[n].dead) {
                drawCharacter(images[characterCostumes[localStorage.getItem('character')]], characters[n])
            }
        }
        for (n = 0; n < balls.length; n++) {
            if (balls[n].type == 'basic') {
                if (balls[n].active) {
                    const xy = (60 + balls[n].x) % 60 / 60 * Math.PI / 2, x = balls[n].x - (60 + balls[n].x) % 60 + 60, y = 662;
                    ctx.rotate(xy);
                    ctx.drawImage(images[1], Math.cos(-xy) * x - Math.sin(-xy) * y, Math.cos(-xy) * y + Math.sin(-xy) * x, -60, -60);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                } else {
                    if (balls[n].dir == 'left') {
                        ctx.drawImage(images[2], 4, 600);
                    } else {
                        ctx.drawImage(images[2], 916, 600);
                    }
                }
            } else if (balls[n].type == 'bounce') {
                if (balls[n].active) {
                    const xy = (180 + balls[n].x) % 180 / 180 * Math.PI / 2, x = balls[n].x / 1280 * 960 + Math.floor(balls[n].x / 180) * 60, y = balls[n].y;
                    ctx.rotate(xy);
                    ctx.drawImage(images[1], Math.cos(-xy) * x - Math.sin(-xy) * y, Math.cos(-xy) * y + Math.sin(-xy) * x, -60, -60);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                } else {
                    if (balls[n].dir == 'left') {
                        ctx.drawImage(images[2], 4, 20);
                    } else {
                        ctx.drawImage(images[2], 916, 20);
                    }
                }
            }
        }

        ctx.globalAlpha = 0.2;
        ctx.fillRect(mouseX - mouseX % 60, 660, 60, 60)
        ctx.globalAlpha = 1;
        shakeEffect.x = shakeEffect.str * Math.random() - shakeEffect.str / 2;
        shakeEffect.y = shakeEffect.str * Math.random() - shakeEffect.str / 2;

        const c = new OffscreenCanvas(960, 720);
        const offscreenctx = c.getContext('2d');
        offscreenctx.drawImage(canvas, shakeEffect.x, shakeEffect.y)
        background();
        ctx.drawImage(c, shakeEffect.x, shakeEffect.y);

        ctx.font = '32px helvetica';
        ctx.fillText(Math.trunc(score), 950 - ctx.measureText(Math.trunc(score)).width, 40);

        requestAnimationFrame(function () {
            drawAll(images);
        });
    }

    async function armyDeadFunction() {
        const promise1 = new Promise(function(end, error) {
            setTimeout(end, 1000)
        })
        const c = new OffscreenCanvas(960, 720);
        c.getContext('2d').drawImage(canvas, 0, 0);
        await promise1;
        function a() {
            ctx.drawImage(c, 0, 0);
            ctx.globalAlpha = 0.4;
            ctx.fillRect(0, 0, 960, 720);
            ctx.globalAlpha = 1;
            ctx.font = '44px helvetica';
            ctx.fillText('Game Over', 480 - ctx.measureText('Game Over').width / 2, 150);
            ctx.font = '30px helvetica';
            if (!localStorage.getItem('hs') || localStorage.getItem('hs') < Math.trunc(score)) {
                localStorage.setItem('hs', Math.trunc(score));   
            }
            if(localStorage.getItem('hs') == Math.trunc(score)) {
                ctx.fillText('New best! ' + localStorage.getItem('hs'), 480 - ctx.measureText('New best! ' + localStorage.getItem('hs')).width / 2, 220);
            }
            ctx.fillText('Tap / click anywhere to continue', 480 - ctx.measureText('Tap / click anywhere to continue').width / 2, 270);
            if(!playingNow) {
                return;
            }
            requestAnimationFrame(a);
        }
        a()
        const promise2 = new Promise(function (end, error) {
            canvas.onclick = end;
        })
        await promise2;
        playingNow = false;
        return;
    }


}

function drawCharacter(image, character) {
    ctx.drawImage(image, character.avoid, character.y - image.height + 45);
    // eyes
    if (!character.eyeAnim) {
        character.eyeAnim = [0, 0, 0]
    }
    let a = 0;
    if (Math.random() < 0.002 && !character.eyeAnim[2]) {
        character.eyeAnim[2] = 10;
    } else if (character.eyeAnim[2]) {
        a = Math.abs(character.eyeAnim[2] - 5) / 1;
        character.eyeAnim[2] -= 1;
    }
    character.eyeAnim[0] = Math.max(Math.min((mouseX - 22.5 - character.avoid) / 100, 3), -3);
    character.eyeAnim[1] = Math.max(Math.min((mouseY - 22.5 - character.y) / 100, 3), -3);
    if (a <= 4) {
        if (mouseX - 22.5 - character.avoid > 0) {
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(character.avoid + 35 + character.eyeAnim[0], character.y + 10 + character.eyeAnim[1] + character.eyeAnim[2]);
            ctx.lineTo(character.avoid + 35 + character.eyeAnim[0], character.y + 20 + character.eyeAnim[1] - character.eyeAnim[2]);
            ctx.stroke();
            ctx.moveTo(character.avoid + 27 + character.eyeAnim[0], character.y + 10 + character.eyeAnim[1] + character.eyeAnim[2]);
            ctx.lineTo(character.avoid + 27 + character.eyeAnim[0], character.y + 20 + character.eyeAnim[1] - character.eyeAnim[2]);
            ctx.stroke();
            ctx.closePath();
        } else {
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(character.avoid + 10 + character.eyeAnim[0], character.y + 10 + character.eyeAnim[1] + character.eyeAnim[2]);
            ctx.lineTo(character.avoid + 10 + character.eyeAnim[0], character.y + 20 + character.eyeAnim[1] - character.eyeAnim[2]);
            ctx.stroke();
            ctx.moveTo(character.avoid + 18 + character.eyeAnim[0], character.y + 10 + character.eyeAnim[1] + character.eyeAnim[2]);
            ctx.lineTo(character.avoid + 18 + character.eyeAnim[0], character.y + 20 + character.eyeAnim[1] - character.eyeAnim[2]);
            ctx.stroke();
            ctx.closePath();
        }
    }
}






