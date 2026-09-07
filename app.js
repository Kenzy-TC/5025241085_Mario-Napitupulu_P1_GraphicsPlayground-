/*
Praktikum Grafika Komputer - Pertemuan 1
Graphics Playground
Nama : Mario Napitupulu
NRP  : 5025241085
Kelas: Grafika Komputer B
Challenge: 1
Nama : Nathanael 
NRP  :
Kelas: Grafika Komputer B
Challenge: 1
*/

const canvas = document.getElementById("graphicsCanvas");
const ctx = canvas.getContext("2d");


// Primitive Statis 
const rectangle = { x: 50, y: 150, width: 140, height: 90, color: "#8e44ad" };
const staticTriangle = { v0: {x: 120, y: 300}, v1: {x: 50, y: 400}, v2: {x: 190, y: 400}, color: "#16a085", stroke: "#000" };

// Challenge 34.3: Multiple Moving Objects & Challenge A: Bouncing Object
const movingBalls = [
    { x: 400, y: 100, radius: 25, speedX: 3, speedY: 2, color: "#3498db" },
    { x: 500, y: 250, radius: 15, speedX: -4, speedY: 3, color: "#e74c3c" },
    { x: 300, y: 400, radius: 20, speedX: 2, speedY: -4, color: "#f1c40f" }
];

// Challenge D: Keyboard Movement
const player = { x: 600, y: 350, width: 50, height: 50, speed: 5, color: "#e67e22" };

// Data input & interaksi
const mouse = { x: 0, y: 0 };
const keys = {};
let isPaused = false; // Penanda untuk status pause

// Challenge 34.1 & Challenge C: Click Data
const spawnedCircles = []; 
const colors = ["#9b59b6", "#e74c3c", "#2ecc71", "#f1c40f", "#3498db", "#ff9ff3"];
let playerColorIndex = 0;

// Canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Drawing Functions
function drawPrimitives() {
    // 1. Rectangle
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    // 2. Line
    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(450, 150);
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Triangle
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

function drawSpawnedCircles() {
    for (const circle of spawnedCircles) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Challenge E: Mouse Coordinate
function drawMouseCoordinate() {
    ctx.fillStyle = "#222";
    ctx.font = "16px Arial";
    ctx.fillText(`Mouse: (${Math.round(mouse.x)}, ${Math.round(mouse.y)})`, 20, 30);
}

// Challenge B: Follow Mouse
function drawMouseFollower() {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Update Functions
function updateMovingBalls() {
    for (const ball of movingBalls) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        
        // Memantul jika mengenai batas canvas
        if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
            ball.speedX *= -1;
        }
        if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
            ball.speedY *= -1;
        }
    }
}

function updatePlayer() {
    // Mendukung Arrow Keys ATAU W, A, S, D
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;

    // Batas pergerakan agar tidak keluar canvas
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// input & event 
canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener("click", function() {
    // Challenge C: Click untuk ubah warna objek (Player)
    playerColorIndex = (playerColorIndex + 1) % colors.length;
    player.color = colors[playerColorIndex];

    // Challenge 34.1: Click untuk menambah lingkaran baru di posisi mouse
    spawnedCircles.push({
        x: mouse.x,
        y: mouse.y,
        radius: Math.random() * 15 + 10, // Radius acak antara 10 - 25
        color: colors[Math.floor(Math.random() * colors.length)] // Warna acak
    });
});

window.addEventListener("keydown", function(event) {
    const controlledKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d", " "]; 
    if (controlledKeys.includes(event.key)) {
        event.preventDefault(); // Mencegah layar ke-scroll saat tekan spasi atau panah
    }
    keys[event.key] = true;

    // [SPASI] untuk Pause / Resume
    if (event.key === " " && !event.repeat) {
        isPaused = !isPaused; // Membalik status dari true ke false, atau sebaliknya
    }

    // [R] untuk Reset posisi Player
    if (event.key.toLowerCase() === "r" && !event.repeat) {
        player.x = 600;
        player.y = 350;
    }

    // [C] untuk Ganti Warna Player
    if (event.key.toLowerCase() === "c" && !event.repeat) {
        playerColorIndex = (playerColorIndex + 1) % colors.length;
        player.color = colors[playerColorIndex];
    }
});

window.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

// Animation loop
function animate() {
    clearCanvas();
    
    // Objek hanya bergerak JIKA sedang tidak di-pause
    if (!isPaused) {
        updateMovingBalls();
        updatePlayer();
    }
    
    // Proses render/menggambar tetap jalan terus
    drawSpawnedCircles(); 
    drawPrimitives();
    drawMovingBalls();
    drawPlayer();
    drawMouseCoordinate();
    drawMouseFollower();
    
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Teks transparan
        ctx.font = "40px Arial";
        ctx.fillText("PAUSED", canvas.width / 2 - 75, canvas.height / 2);
    }
    
    requestAnimationFrame(animate);
}

// Start Aplikasi
animate();