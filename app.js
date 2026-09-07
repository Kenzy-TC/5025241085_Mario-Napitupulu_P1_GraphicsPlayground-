const canvas = document.getElementById("graphicsCanvas");
const ctx = canvas.getContext("2d");


const rectangle = { x: 50, y: 150, width: 140, height: 90, color: "#8e44ad" };
const staticTriangle = { v0: {x: 120, y: 300}, v1: {x: 50, y: 400}, v2: {x: 190, y: 400}, color: "#16a085", stroke: "#000" };

// Bola-bola yang memantul
const movingBalls = [
    { x: 400, y: 100, radius: 25, speedX: 3, speedY: 2, color: "#3498db" }
];

const player = { x: 600, y: 350, width: 50, height: 50, speed: 5, color: "#e67e22" };

// Input State
const mouse = { x: 0, y: 0 };
const keys = {};
let isPaused = false; 

// Slingshot State
let isDragging = false;
const dragStart = { x: 0, y: 0 };

const colors = ["#9b59b6", "#e74c3c", "#2ecc71", "#f1c40f", "#3498db", "#ff9ff3", "#00d2d3", "#ff6b6b"];
let playerColorIndex = 0;

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPrimitives() {
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(450, 150);
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(staticTriangle.v0.x, staticTriangle.v0.y);
    ctx.lineTo(staticTriangle.v1.x, staticTriangle.v1.y);
    ctx.lineTo(staticTriangle.v2.x, staticTriangle.v2.y);
    ctx.closePath();
    ctx.fillStyle = staticTriangle.color;
    ctx.fill();
    ctx.strokeStyle = staticTriangle.stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawMovingBalls() {
    for (const ball of movingBalls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawMouseCoordinate() {
    ctx.fillStyle = "#222";
    ctx.font = "16px Arial";
    ctx.fillText(`Mouse: (${Math.round(mouse.x)}, ${Math.round(mouse.y)})`, 20, 30);
}

// Menggambar efek tarikan ketapel
function drawSlingshot() {
    if (isDragging) {
        // Tali ketapel
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]); // Bikin garis putus-putus
        ctx.stroke();
        ctx.setLineDash([]); // Reset garis ke normal

        // Bayangan bola yang mau ditembak
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(155, 89, 182, 0.5)";
        ctx.fill();
    }
}


function updateMovingBalls() {
    for (const ball of movingBalls) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        
        let bounced = false;

        // Deteksi tabrakan horizontal
        if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
            ball.speedX *= -1;
            bounced = true;
        }
        // Deteksi tabrakan vertikal
        if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
            ball.speedY *= -1;
            bounced = true;
        }

        // Kalau mantul, ganti warna secara acak!
        if (bounced) {
            ball.color = colors[Math.floor(Math.random() * colors.length)];
        }
    }
}

function updatePlayer() {
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}


// 1. Mouse Bergerak
canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
});

// 2. Klik Mouse Ditahan (Mulai narik ketapel)
canvas.addEventListener("mousedown", function(event) {
    if (isPaused) return; // Kalau lagi di-pause, gabisa nembak
    isDragging = true;
    dragStart.x = mouse.x;
    dragStart.y = mouse.y;
});

// 3. Klik Mouse Dilepas (Nembak bola!)
canvas.addEventListener("mouseup", function(event) {
    if (isDragging) {
        isDragging = false;
        
        // Kalkulasi kekuatan & arah tembakan (mirip Angry Birds)
        const powerMultiplier = 0.05; 
        const velocityX = (dragStart.x - mouse.x) * powerMultiplier;
        const velocityY = (dragStart.y - mouse.y) * powerMultiplier;

        // Bikin bola baru dan masukkan ke dalam canvas
        movingBalls.push({
            x: dragStart.x,
            y: dragStart.y,
            radius: Math.random() * 15 + 10, // Radius 10 s/d 25
            speedX: velocityX,
            speedY: velocityY,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
});

// Event Keyboard (Masih sesuai setup sebelumnya)
window.addEventListener("keydown", function(event) {
    const controlledKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d", " "];
    if (controlledKeys.includes(event.key)) {
        event.preventDefault(); 
    }
    keys[event.key] = true;

    if (event.key === " " && !event.repeat) {
        isPaused = !isPaused; 
    }
    if (event.key.toLowerCase() === "r" && !event.repeat) {
        player.x = 600;
        player.y = 350;
    }
    if (event.key.toLowerCase() === "c" && !event.repeat) {
        playerColorIndex = (playerColorIndex + 1) % colors.length;
        player.color = colors[playerColorIndex];
    }
});

window.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});


function animate() {
    clearCanvas();
    
    if (!isPaused) {
        updateMovingBalls();
        updatePlayer();
    }
    
    drawPrimitives();
    drawMovingBalls();
    drawPlayer();
    drawMouseCoordinate();
    drawSlingshot(); // Menampilkan garis ketapel pas lagi ditarik
    
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.font = "bold 40px Arial";
        ctx.fillText("PAUSED", canvas.width / 2 - 80, canvas.height / 2);
    }
    
    requestAnimationFrame(animate);
}

// Start
animate();