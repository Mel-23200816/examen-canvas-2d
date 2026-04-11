# 🦆 Caza de Latas y Patos

Un simulador de tiro arcade desarrollado con la **API de Canvas de HTML5**, inspirado en el clásico estilo de 8 bits. El proyecto desafía la puntería del usuario mediante la caza de objetivos con una mecánica de **multiplicador de puntos escalable** y una dificultad progresiva basada en niveles.

---

## 🚀 Tecnologías Utilizadas

Este proyecto destaca por el uso de manipulación directa del **DOM** y el renderizado en tiempo real sobre **Canvas**, integrando un diseño visual moderno basado en **Glassmorphism** y una paleta de colores retro.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

### 📊 Porcentaje de Uso Estimado
* **JavaScript (Física, Colisiones y Combo System):** ~ 70%
* **HTML5 (UI y Estructura):** ~ 20%
* **CSS3 (Animaciones y Glassmorphism):** ~ 10%

---

## 🎮 Mecánicas del Juego

* **Sistema de Combo:** Cada 4 latas acertadas consecutivamente, el multiplicador aumenta (x1.10, x1.25, x1.50, etc.).
* **Riesgo vs Recompensa:** Los puntos perdidos por impactar patos también se escalan con el multiplicador actual.
* **Penalización por Fallo (MISS):** Errar un tiro al aire o impactar un pato reinicia el multiplicador a x1.0 instantáneamente.
* **Condiciones de Derrota:** * Acumular una puntuación negativa de **-400 puntos**.
    * Impactar **4 patos** de forma consecutiva.
* **Dificultad Dinámica:** A medida que aumenta el nivel, la velocidad de los objetivos crece y el tiempo de aparición disminuye.

---

## 👨‍💻 Información del Desarrollador

* **Nombre:** Miguel Angel Cano Alejandro
* **Número de Control:** 23200816
* **Universidad:** Instituto Tecnológico de Pachuca (ITP)
* **Carrera:** Ingeniería en Sistemas Computacionales
* **Semestre:** 6to Semestre
* **Correo Electrónico:** mcanoalejandro@gmail.com
* **Teléfono:** +52 772 148 6990

---

## 📂 Estructura del Proyecto

```text
📦 caza-latas-pato-itp
 ┣ 📂 assets
 ┃ ┣ 📂 css
 ┃ ┃ ┗ 📜 styles.css  # Estilos Glassmorphism y fondo geométrico
 ┃ ┣ 📂 img
 ┃ ┃ ┣ 🖼️ paisaje.jpeg # Fondo del área de juego
 ┃ ┃ ┣ 🖼️ favicon.png  # Icono representativo de la pagina
 ┃ ┃ ┣ 🖼️ lata.png     # Sprite de objetivo positivo
 ┃ ┃ ┗ 🖼️ pato.png     # Sprite de objetivo negativo
 ┃ ┗ 📂 js
 ┃   ┗ 📜 main.js     # Motor de física, multiplicador y lógica
 ┗ 📜 index.html      # Estructura principal y UI de Bootstrap