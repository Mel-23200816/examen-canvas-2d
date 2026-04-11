const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ajustar el canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let targets = [];
let spawnTimer = 0;

class Target {
    constructor() {
        // Regla de negocio: Aleatoriedad para elegir el tipo de objetivo
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        this.radius = 30;
        
        // Aparecen aleatoriamente en el eje X, dentro de los límites
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        // Inician su movimiento desde abajo del suelo
        this.y = canvas.height + this.radius; 
        
        // Velocidad en X (se mueven hacia la izquierda o derecha aleatoriamente)
        this.vx = (Math.random() - 0.5) * 8; 
        // Fuerza de salto hacia arriba
        this.vy = -(Math.random() * 6 + 10);  
        
        // La gravedad hace que la velocidad Y disminuya y comiencen a caer
        this.gravity = 0.15; 
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; 

        // Rebote en las paredes laterales para mantenerlos en pantalla
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
        }

        // Desaparecen cuando caen por debajo de la pantalla
        if (this.y > canvas.height + this.radius) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Diferenciación visual de los objetivos
        if (this.type === 'can') {
            ctx.fillStyle = '#C0C0C0'; // Lata metálica
            ctx.strokeStyle = '#808080';
        } else {
            ctx.fillStyle = '#8B4513'; // Pato
            ctx.strokeStyle = '#5c2e0b';
        }
        
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Texto indicativo en el centro
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Arial bold';
        ctx.fillText(this.type === 'can' ? 'LATA' : 'PATO', this.x, this.y);
    }
}

// Evento de disparo
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Recorremos de atrás hacia adelante para disparar al objeto que está más al frente
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        
        // Teorema de Pitágoras para colisión de punto y círculo
        const dx = mouseX - target.x;
        const dy = mouseY - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= target.radius) {
            // Regla de negocio: Latas dan puntos, patos restan
            if (target.type === 'can') {
                score += 100;
            } else {
                score -= 100;
            }
            scoreElement.innerText = score;
            
            // Destruir el objeto
            target.markedForDeletion = true;
            break; // Solo permitimos impactar un objetivo por disparo
        }
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generador de objetivos
    spawnTimer++;
    if (spawnTimer % 50 === 0) { // Un nuevo objetivo cada ~50 frames
        targets.push(new Target());
        spawnTimer = 0;
    }

    // Actualizar posiciones y renderizar
    targets.forEach(target => {
        target.update();
        target.draw(ctx);
    });

    // Limpiar memoria: eliminar los objetos marcados
    targets = targets.filter(target => !target.markedForDeletion);

    requestAnimationFrame(animate);
}

// Responsividad básica
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Arrancar el ciclo
animate();