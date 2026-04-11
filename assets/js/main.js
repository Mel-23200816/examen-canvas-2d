const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level');

// Referencias a la pantalla de instrucciones
const instructionsScreen = document.getElementById('instructions-screen');
const startBtn = document.getElementById('start-btn');

function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Variables de estado del juego
let score = 0;
let highScore = localStorage.getItem('cazaPuntuacionAlta') || 0;
let level = 1;
let targets = [];
let spawnTimer = 0;
let spawnRate = 60; 
let speedMultiplier = 1; 

// Variable clave para controlar si el juego está corriendo
let isPlaying = false; 

highScoreDisplay.innerText = highScore;

const imgLata = new Image(); 
imgLata.src = 'assets/img/lata.png';

const imgPato = new Image(); 
imgPato.src = 'assets/img/pato.png';

class Target {
    constructor() {
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        this.radius = canvas.width * 0.08; 
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

        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
        }

        if (this.y > canvas.height + this.radius + 50 && this.vy > 0) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        const img = this.type === 'can' ? imgLata : imgPato;
        if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'can' ? 'silver' : 'saddlebrown';
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Lógica de inicio de juego
startBtn.addEventListener('click', () => {
    instructionsScreen.style.display = 'none'; // Ocultar el mensaje
    isPlaying = true; // Activar banderas de juego
    animate(); // Iniciar el ciclo del canvas
});

// Evento de disparo
canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return; // Si no estamos jugando, el clic no hace nada

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
            } else {
                score -= 100;
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
    if (!isPlaying) return; // Romper el ciclo si no se está jugando

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnTimer++;
    if (spawnTimer >= spawnRate) {
        targets.push(new Target());
        spawnTimer = 0;
    }

    targets.forEach(t => { 
        t.update(); 
        t.draw(); 
    });
    
    targets = targets.filter(t => !t.markedForDeletion);
    
    requestAnimationFrame(animate);
}

// Nota: Ya no llamamos a animate() aquí abajo, se llama al hacer clic en el botón.