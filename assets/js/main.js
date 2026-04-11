const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let targets = [];
let spawnTimer = 0;

// Cargar las imágenes representativas (Punto 2)
const imgLata = new Image();
imgLata.src = 'assets/img/lata.png'; // Asegúrate de tener este archivo

const imgPato = new Image();
imgPato.src = 'assets/img/pato.png'; // Asegúrate de tener este archivo

class Target {
    constructor() {
        this.type = Math.random() > 0.5 ? 'can' : 'duck';
        // Radio lógico para la detección de clics
        this.radius = 45; 
        
        // Posición X aleatoria dentro de la pantalla
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        // Inician su movimiento desde fuera de la pantalla, por ABAJO
        this.y = canvas.height + this.radius + 20; 
        
        // Velocidad horizontal (deriva leve)
        this.vx = (Math.random() - 0.5) * 5; 
        // Fuerza de salto hacia ARRIBA (valores negativos en canvas suben)
        this.vy = -(Math.random() * 8 + 14);  
        
        // Gravedad constante que los frena y luego los hace caer
        this.gravity = 0.25; 
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // Aplica la física de caída

        // Rebote en las paredes laterales
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
        }

        // Si caen nuevamente por el borde inferior (y están bajando), se eliminan
        if (this.y > canvas.height + this.radius + 50 && this.vy > 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        const imgToDraw = this.type === 'can' ? imgLata : imgPato;
        
        // Dibujar la imagen si ya se cargó en el navegador
        if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
            ctx.drawImage(
                imgToDraw, 
                this.x - this.radius, 
                this.y - this.radius, 
                this.radius * 2, 
                this.radius * 2
            );
        } else {
            // Fallback: Si no hay imagen, dibuja un círculo temporal
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'can' ? 'silver' : 'brown';
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Evento para eliminar objetos con el Mouse (Punto 3)
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Recorremos el arreglo de forma inversa para dar prioridad al objeto más al frente
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        
        // Distancia entre el clic y el centro del objeto
        const dx = mouseX - target.x;
        const dy = mouseY - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si dimos en el blanco
        if (distance <= target.radius) {
            if (target.type === 'can') {
                score += 100;
            } else {
                score -= 100;
            }
            scoreElement.innerText = score;
            
            // Eliminamos el objeto tocado
            target.markedForDeletion = true;
            break; // Salimos del ciclo para no eliminar dos objetos con un solo clic
        }
    }
});

function animate() {
    // Es vital limpiar el canvas usando clearRect transparente
    // para que el CSS del body (fondo y efecto cristal) siga siendo visible
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer++;
    if (spawnTimer % 45 === 0) { 
        targets.push(new Target());
        spawnTimer = 0;
    }

    targets.forEach(target => {
        target.update();
        target.draw(ctx);
    });

    targets = targets.filter(target => !target.markedForDeletion);

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();