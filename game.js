const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const arrowsElement = document.getElementById('arrows');
const gameOverElement = document.getElementById('gameOver');
const mainMenuElement = document.getElementById('mainMenu');
const levelCompleteElement = document.getElementById('levelComplete');
const finalScoreElement = document.getElementById('finalScore');
const levelScoreElement = document.getElementById('levelScore');

canvas.width = 800;
canvas.height = 600;

// Level configurations
const levels = {
    1: { bubbles: 5, arrows: 10, speed: 3, unlocked: true },
    2: { bubbles: 8, arrows: 12, speed: 4, unlocked: false },
    3: { bubbles: 12, arrows: 15, speed: 5, unlocked: false }
};

class Bubble {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.dx = (Math.random() - 0.5) * speed;
        this.dy = (Math.random() - 0.5) * speed;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    update() {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;
    }
}

class Arrow {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10;
        this.width = 30;
        this.height = 5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Arrow body
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(this.width / 2, -this.height);
        ctx.lineTo(this.width / 2 + 10, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.fillStyle = '#FFA500';
        ctx.fill();
        ctx.closePath();
        
        ctx.restore();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}

class Bow {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.angle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw bow
        ctx.beginPath();
        ctx.arc(0, 0, 30, -Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Draw bowstring
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

let bubbles = [];
let arrows = [];
let bow = new Bow();
let score = 0;
let currentLevel = 1;
let remainingArrows = 0;
let gameActive = false;

function showMainMenu() {
    mainMenuElement.style.display = 'block';
    gameOverElement.style.display = 'none';
    levelCompleteElement.style.display = 'none';
    gameActive = false;

    // Update level buttons
    for (let i = 2; i <= 3; i++) {
        const btn = document.getElementById(`level${i}Btn`);
        if (levels[i].unlocked) {
            btn.classList.remove('locked');
            btn.disabled = false;
        } else {
            btn.classList.add('locked');
            btn.disabled = true;
        }
    }
}

function startLevel(level) {
    if (!levels[level].unlocked) return;

    currentLevel = level;
    score = 0;
    remainingArrows = levels[level].arrows;
    bubbles = [];
    arrows = [];
    
    // Create initial bubbles
    for (let i = 0; i < levels[level].bubbles; i++) {
        bubbles.push(new Bubble(
            Math.random() * (canvas.width - 40) + 20,
            Math.random() * (canvas.height / 2 - 40) + 20,
            levels[level].speed
        ));
    }

    mainMenuElement.style.display = 'none';
    gameOverElement.style.display = 'none';
    levelCompleteElement.style.display = 'none';
    scoreElement.textContent = `Score: ${score}`;
    arrowsElement.textContent = `Arrows: ${remainingArrows}`;
    gameActive = true;
}

function nextLevel() {
    if (currentLevel < 3) {
        levels[currentLevel + 1].unlocked = true;
        startLevel(currentLevel + 1);
    } else {
        showMainMenu();
    }
}

function restartLevel() {
    startLevel(currentLevel);
}

function checkCollisions() {
    for (let i = arrows.length - 1; i >= 0; i--) {
        for (let j = bubbles.length - 1; j >= 0; j--) {
            const dx = arrows[i].x - bubbles[j].x;
            const dy = arrows[i].y - bubbles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bubbles[j].radius + 5) {
                arrows.splice(i, 1);
                bubbles.splice(j, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
                break;
            }
        }
    }
}

function gameOver() {
    gameActive = false;
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = score;
}

function levelComplete() {
    gameActive = false;
    levelCompleteElement.style.display = 'block';
    levelScoreElement.textContent = score;
}

function animate() {
    if (!gameActive) {
        requestAnimationFrame(animate);
        return;
    }
    
    ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bow.draw();

    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });

    arrows.forEach((arrow, index) => {
        arrow.update();
        arrow.draw();
        
        // Remove arrows that are off screen
        if (arrow.x < 0 || arrow.x > canvas.width || arrow.y < 0 || arrow.y > canvas.height) {
            arrows.splice(index, 1);
        }
    });

    checkCollisions();

    // Check win/lose conditions
    if (bubbles.length === 0) {
        levelComplete();
    } else if (remainingArrows === 0 && arrows.length === 0) {
        gameOver();
    }

    requestAnimationFrame(animate);
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    bow.angle = Math.atan2(mouseY - bow.y, mouseX - bow.x);
});

canvas.addEventListener('click', () => {
    if (!gameActive || remainingArrows <= 0) return;
    
    const arrow = new Arrow(bow.x, bow.y, bow.angle);
    arrows.push(arrow);
    remainingArrows--;
    arrowsElement.textContent = `Arrows: ${remainingArrows}`;
});

// Start with main menu
showMainMenu();
animate();