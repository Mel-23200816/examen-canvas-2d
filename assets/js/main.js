const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// UI Elements
const scoreDisplay = document.getElementById('score'), highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level'), cansDisplay = document.getElementById('count-cans'), ducksDisplay = document.getElementById('count-ducks');
const overlay = document.getElementById('overlay-screen'), startBtn = document.getElementById('start-btn'), restartBtn = document.getElementById('restart-btn');
const multBar = document.getElementById('mult-bar'), multValDisplay = document.getElementById('mult-val');
const levelUpScreen = document.getElementById('level-up-screen'), levelUpText = document.getElementById('level-up-text');

function resize() { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
window.addEventListener('resize', resize); resize();

// Game State
let score = 0, highScore = localStorage.getItem('hs_itp') || 0, level = 1, isPlaying = false, isTransitioning = false;
let cansShot = 0, ducksShot = 0, consecutiveDucks = 0, targets = [], floatTexts = [];
let spawnTimer = 0, spawnRate = 60, speedMult = 1;
let comboCount = 0, multiplier = 1.0, currentStepIdx = 0;
const multSteps = [1.0, 1.10, 1.25, 1.50, 2.0, 3.0, 5.0];

highScoreDisplay.innerText = highScore;
const imgLata = new Image(); imgLata.src = 'assets/img/lata.png';
const imgPato = new Image(); imgPato.src = 'assets/img/pato.png';

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.opacity = 1; this.vy = -2.5;
    }
    update() { this.y += this.vy; this.opacity -= 0.02; }
    draw() {
        ctx.save(); ctx.globalAlpha = this.opacity;
        ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
        ctx.lineWidth = 5; ctx.strokeStyle = 'black';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillStyle = this.color; ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Target {
    constructor() {
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        this.radius = canvas.width * 0.035;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.vx = (Math.random() - 0.5) * (5 * speedMult);
        this.vy = -(Math.random() * 5 + (13 * speedMult));
        this.gravity = 0.25; this.hitTimer = 0; this.marked = false;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y > canvas.height + this.radius + 50) this.marked = true;
        if (this.hitTimer > 0) this.hitTimer--;
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        if (this.hitTimer > 0) {
            ctx.scale(1.3, 1.3); ctx.shadowBlur = 30;
            ctx.shadowColor = this.type === 'can' ? '#00ff00' : '#ff0000';
        }
        const img = this.type === 'can' ? imgLata : imgPato;
        if (img.complete) ctx.drawImage(img, -this.radius, -this.radius, this.radius*2, this.radius*2);
        ctx.restore();
    }
}

function resetMultiplier() { comboCount = 0; currentStepIdx = 0; multiplier = multSteps[0]; updateMultiplierUI(); }
function updateMultiplierUI() { multBar.style.width = (comboCount / 4) * 100 + "%"; multValDisplay.innerText = multiplier.toFixed(2); }

canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying || isTransitioning) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width), my = (e.clientY - r.top) * (canvas.height / r.height);
    let hit = false;

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (Math.sqrt((mx - t.x)**2 + (my - t.y)**2) <= t.radius && t.hitTimer === 0) {
            hit = true; t.hitTimer = 10;
            if (t.type === 'can') {
                comboCount++;
                if (comboCount >= 4) { comboCount = 0; currentStepIdx = Math.min(currentStepIdx + 1, multSteps.length - 1); multiplier = multSteps[currentStepIdx]; }
                let gain = Math.round(100 * multiplier); score += gain; cansShot++; consecutiveDucks = 0;
                floatTexts.push(new FloatingText(t.x, t.y, '+' + gain, '#00ff00'));
            } else {
                let loss = Math.round(100 * multiplier); score -= loss; ducksShot++; consecutiveDucks++;
                floatTexts.push(new FloatingText(t.x, t.y, '-' + loss, '#ff0000'));
                resetMultiplier();
            }
            updateUI(); updateMultiplierUI();
            if (score <= -400) return gameOver("Límite de pérdida alcanzado");
            if (consecutiveDucks >= 4) return gameOver("4 patos seguidos");
            setTimeout(() => t.marked = true, 100); break;
        }
    }
    if (!hit) { resetMultiplier(); floatTexts.push(new FloatingText(mx, my, 'MISS', '#ffffff')); }
});

function updateUI() {
    scoreDisplay.innerText = score; cansDisplay.innerText = cansShot; ducksDisplay.innerText = ducksShot;
    let newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel; speedMult = 1 + (level - 1) * 0.15; spawnRate = Math.max(15, 60 - level * 5);
        isTransitioning = true; levelUpText.innerText = 'Nivel ' + level;
        levelUpScreen.classList.remove('d-none'); levelUpScreen.classList.add('d-flex');
        targets = []; floatTexts = [];
        setTimeout(() => { levelUpScreen.classList.replace('d-flex', 'd-none'); isTransitioning = false; }, 2000);
    }
    levelDisplay.innerText = level;
    if (score > highScore) { highScore = score; highScoreDisplay.innerText = highScore; localStorage.setItem('hs_itp', highScore); }
}

function gameOver(r) { isPlaying = false; overlay.style.display = 'block'; document.getElementById('content-start').style.display = 'none'; document.getElementById('content-gameover').style.display = 'block'; document.getElementById('gameover-reason').innerText = r; }

function initGame() {
    score = 0; level = 1; cansShot = 0; ducksShot = 0; consecutiveDucks = 0; targets = []; floatTexts = [];
    resetMultiplier(); isPlaying = true; overlay.style.display = 'none'; updateUI(); animate();
}

startBtn.onclick = initGame; restartBtn.onclick = initGame;

function animate() {
    if (!isPlaying) return;
    if (isTransitioning) { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnTimer++;
    if (spawnTimer >= spawnRate) { targets.push(new Target()); spawnTimer = 0; }
    targets.forEach(t => { t.update(); t.draw(); });
    floatTexts.forEach((ft, i) => { ft.update(); ft.draw(); if (ft.opacity <= 0) floatTexts.splice(i, 1); });
    targets = targets.filter(t => !t.marked);
    requestAnimationFrame(animate);
}