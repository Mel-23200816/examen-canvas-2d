const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// Elementos UI
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level');

// Ajustar resolución del canvas al tamaño del contenedor de Bootstrap
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Variables de juego (Punto 6)
let score = 0;
let highScore = localStorage.getItem('duckHuntHighScore') || 0;
let level = 1;
let targets = [];
let spawnTimer = 0;
let spawnRate = 60; // Frames entre aparición
let speedMultiplier = 1;

highScoreDisplay.innerText = highScore;

// Carga de imágenes
const imgLata = new Image(); imgLata.src = 'assets/img/lata.png';
const imgPato = new Image(); imgPato.src = 'assets/img/pato.png';

class Target {
    constructor() {
        this.type = Math.random() > 0.4 ? 'can' : 'duck';
        this.radius = 35;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        
        this.vx = (Math.random() - 0.5) * (4 * speedMultiplier);
        // Velocidad hacia arriba que aumenta con el nivel
        this.vy = -(Math.random() * 5 + (10 * speedMultiplier));
        this.gravity = 0.2;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y > canvas.height + this.radius + 20 && this.vy > 0) this.markedForDeletion = true;
    }

    draw() {
        const img = this.type === 'can' ? imgLata : imgPato;
        if (img.complete) {
            ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.sqrt((mouseX - t.x)**2 + (mouseY - t.y)**2);

        if (dist <= t.radius) {
            score += (t.type === 'can' ? 100 : -100);
            if (score < 0) score = 0;
            
            checkLevel();
            updateScoreUI();
            t.markedForDeletion = true;
            break;
        }
    }
});

function checkLevel() {
    // Subir de nivel cada 500 puntos
    let newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        speedMultiplier += 0.2; // Aumenta velocidad
        spawnRate = Math.max(20, 60 - (level * 5)); // Aparecen más seguido
    }
}

function updateScoreUI() {
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.innerText = highScore;
        localStorage.setItem('duckHuntHighScore', highScore);
    }
}

function animate() {
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

animate();