const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// UI y Dom
const scoreDisplay = document.getElementById('score'), highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level'), cansDisplay = document.getElementById('count-cans'), ducksDisplay = document.getElementById('count-ducks');
const overlay = document.getElementById('overlay-screen'), startBtn = document.getElementById('start-btn'), restartBtn = document.getElementById('restart-btn');
const contentStart = document.getElementById('content-start'), contentGameOver = document.getElementById('content-gameover'), reasonText = document.getElementById('gameover-reason');

function resize() { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
window.addEventListener('resize', resize); resize();

// Estado del Juego
let score = 0, highScore = localStorage.getItem('hs_itp') || 0, level = 1, isPlaying = false;
let cansShot = 0, ducksShot = 0, consecutiveDucks = 0, targets = [], floatTexts = [];
let spawnTimer = 0, spawnRate = 60, speedMult = 1;

highScoreDisplay.innerText = highScore;

const imgLata = new Image(); imgLata.src = 'assets/img/lata.png';
const imgPato = new Image(); imgPato.src = 'assets/img/pato.png';

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.opacity = 1; this.vy = -2;
    }
    update() { this.y += this.vy; this.opacity -= 0.02; }
    draw() {
        ctx.save(); ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color; ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center'; ctx.fillText(this.text, this.x, this.y); ctx.restore();
    }
}

class Target {
    constructor() {
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        this.radius = canvas.width * 0.04;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.vx = (Math.random() - 0.5) * (5 * speedMult);
        this.vy = -(Math.random() * 5 + (13 * speedMult));
        this.gravity = 0.25;
        this.hitTimer = 0; // Para el parpadeo
        this.marked = false;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y > canvas.height + this.radius + 50) this.marked = true;
        if (this.hitTimer > 0) this.hitTimer--;
    }
    draw() {
        ctx.save();
        if (this.hitTimer > 0) { // Efecto parpadeo
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.type === 'can' ? '#00ff00' : '#ff0000';
            ctx.filter = `brightness(2) sepia(1) hue-rotate(${this.type === 'can' ? '90deg' : '0deg'})`;
        }
        const img = this.type === 'can' ? imgLata : imgPato;
        if (img.complete) ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);
        ctx.restore();
    }
}

function gameOver(reason) {
    isPlaying = false; targets = []; floatTexts = [];
    overlay.style.display = 'block'; contentStart.style.display = 'none';
    contentGameOver.style.display = 'block'; reasonText.innerText = reason;
}

canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width), my = (e.clientY - r.top) * (canvas.height / r.height);

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (Math.sqrt((mx - t.x)**2 + (my - t.y)**2) <= t.radius && t.hitTimer === 0) {
            t.hitTimer = 10;
            if (t.type === 'can') {
                score += 100; cansShot++; consecutiveDucks = 0;
                floatTexts.push(new FloatingText(t.x, t.y, '+100', '#00ff00'));
            } else {
                score -= 100; ducksShot++; consecutiveDucks++;
                floatTexts.push(new FloatingText(t.x, t.y, '-100', '#ff0000'));
            }
            updateUI();
            if (score <= -400) return gameOver("Llegaste al límite de pérdida (-400 pts)");
            if (consecutiveDucks >= 4) return gameOver("¡Impactaste 4 patos seguidos!");
            setTimeout(() => t.marked = true, 100); break;
        }
    }
});

function updateUI() {
    scoreDisplay.innerText = score; cansDisplay.innerText = cansShot; ducksDisplay.innerText = ducksShot;
    level = Math.floor(score / 500) + 1; levelDisplay.innerText = level;
    speedMult = 1 + (level - 1) * 0.15; spawnRate = Math.max(15, 60 - level * 5);
    if (score > highScore) { highScore = score; highScoreDisplay.innerText = highScore; localStorage.setItem('hs_itp', highScore); }
}

function initGame() {
    score = 0; level = 1; cansShot = 0; ducksShot = 0; consecutiveDucks = 0; targets = []; floatTexts = [];
    isPlaying = true; overlay.style.display = 'none'; updateUI(); animate();
}

startBtn.onclick = initGame;
restartBtn.onclick = initGame;

function animate() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnTimer++;
    if (spawnTimer >= spawnRate) { targets.push(new Target()); spawnTimer = 0; }
    targets.forEach(t => { t.update(); t.draw(); });
    floatTexts.forEach((ft, i) => { ft.update(); ft.draw(); if (ft.opacity <= 0) floatTexts.splice(i, 1); });
    targets = targets.filter(t => !t.marked);
    requestAnimationFrame(animate);
}