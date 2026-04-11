const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// UI y Contadores
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level');
const countCansDisplay = document.getElementById('count-cans');
const countDucksDisplay = document.getElementById('count-ducks');

const instructionsScreen = document.getElementById('instructions-screen');
const startBtn = document.getElementById('start-btn');

function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resize);
resize();

let score = 0;
let highScore = localStorage.getItem('cazaPuntuacionAlta') || 0;
let level = 1;
let cansShot = 0;
let ducksShot = 0;
let targets = [];
let spawnTimer = 0;
let spawnRate = 60; 
let speedMultiplier = 1; 
let isPlaying = false; 

highScoreDisplay.innerText = highScore;

const imgLata = new Image(); imgLata.src = 'assets/img/lata.png';
const imgPato = new Image(); imgPato.src = 'assets/img/pato.png';

class Target {
    constructor() {
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        // Reducimos el tamaño al 4% del ancho del canvas
        this.radius = canvas.width * 0.04; 
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius + 20; 
        this.vx = (Math.random() - 0.5) * (5 * speedMultiplier);
        this.vy = -(Math.random() * 6 + (14 * speedMultiplier));
        this.gravity = 0.25;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; 
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y > canvas.height + this.radius + 50 && this.vy > 0) this.markedForDeletion = true;
    }

    draw() {
        const img = this.type === 'can' ? imgLata : imgPato;
        if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }
}

startBtn.addEventListener('click', () => {
    instructionsScreen.style.display = 'none';
    isPlaying = true;
    animate();
});

canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.sqrt((mouseX - t.x)**2 + (mouseY - t.y)**2);

        if (dist <= t.radius) {
            if (t.type === 'can') {
                score += 100;
                cansShot++;
                countCansDisplay.innerText = cansShot;
            } else {
                score -= 100;
                ducksShot++;
                countDucksDisplay.innerText = ducksShot;
            }
            if (score < 0) score = 0; 
            checkLevel();
            updateScoreUI();
            t.markedForDeletion = true;
            break; 
        }
    }
});

function checkLevel() {
    let newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        speedMultiplier += 0.15; 
        spawnRate = Math.max(15, 60 - (level * 8)); 
    }
}

function updateScoreUI() {
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.innerText = highScore;
        localStorage.setItem('cazaPuntuacionAlta', highScore);
    }
}

function animate() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnTimer++;
    if (spawnTimer >= spawnRate) {
        targets.push(new Target());
        spawnTimer = 0;
    }
    targets.forEach(t => { t.update(); t.draw(); });
    targets = targets.filter(t => !t.markedForDeletion);
    requestAnimationFrame(animate);
}