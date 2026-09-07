const canvas = document.getElementById("graphicsCanvas");
const ctx = canvas.getContext("2d");

// --------------------------------------------------
// DATA
// --------------------------------------------------

const rectangle = {
    x: 80,
    y: 80,
    width: 160,
    height: 100,
    color: "#3498db"
};

// Data bola dibuat fleksibel (karena akan direset)
let movingBalls = [
    {
        x: 350,
        y: 300,
        radius: 25,
        speedX: 2,
        speedY: 2,
        color: "#9b59b6"
    }
];

const player = {
    x: 600,
    y: 350,
    width: 50,
    height: 50,
    speed: 5,
    color: "#e67e22"
};

const mouse = {
    x: 0,
    y: 0
};

const keys = {};

const colors = [
    "#9b59b6",
    "#e74c3c",
    "#2ecc71",
    "#f1c40f",
    "#3498db"
];

let colorIndex = 0;

// Data State
let spawnedCircles = []; 
let isPaused = false;      

// Data FPS & Throttling
let fps = 0;
let lastDrawnTime = 0;
let then = 0;

const fpsSelector = document.getElementById("fpsSelector");
let targetFPS = fpsSelector ? parseInt(fpsSelector.value) : 0;
let fpsInterval = targetFPS > 0 ? 1000 / targetFPS : 0;

if (fpsSelector) {
    fpsSelector.addEventListener("change", function(e) {
        targetFPS = parseInt(e.target.value);
        fpsInterval = targetFPS > 0 ? 1000 / targetFPS : 0;
        then = performance.now();
    });
}

// Data Trail Mode
const trailSelector = document.getElementById("trailSelector");
let trailMode = trailSelector ? trailSelector.value : "none";

if (trailSelector) {
    trailSelector.addEventListener("change", function(e) {
        trailMode = e.target.value;
    });
}

// --------------------------------------------------
// CANVAS
// --------------------------------------------------

function clearCanvas() {
    if (trailMode === "none") {
        // Normal: Bersihkan total setiap frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } 
    else if (trailMode === "fading") {
        // PERBAIKAN: Menggunakan 'destination-out' untuk mengikis (erase) pixel
        // Ini akan menghilangkan warna secara matematis tanpa sisa/ghosting
        ctx.globalCompositeOperation = "destination-out";
        
        // Semakin besar nilai alpha (0.1), semakin cepat jejaknya hilang
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Wajib dikembalikan ke 'source-over' (mode gambar normal)
        ctx.globalCompositeOperation = "source-over";
    } 
    else if (trailMode === "permanent") {
        // Permanen: Jangan bersihkan layar sama sekali
    }
}

// --------------------------------------------------
// DRAW
// --------------------------------------------------

function drawRectangle() {
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height
    );
}

function drawLine() {
    ctx.beginPath();
    ctx.moveTo(300, 80);
    ctx.lineTo(500, 180);
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 5;
    ctx.stroke();
}

function drawCircle() {
    ctx.beginPath();
    ctx.arc(650, 120, 60, 0, Math.PI * 2);
    ctx.fillStyle = "#2ecc71";
    ctx.fill();
}

function drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(150, 300);
    ctx.lineTo(80, 430);
    ctx.lineTo(220, 430);
    ctx.closePath();
    ctx.fillStyle = "#f39c12";
    ctx.fill();
    ctx.strokeStyle = "#8a5705";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawMovingBall() {
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
    // Membersihkan area kecil khusus untuk teks mouse (x, y, lebar, tinggi)
    ctx.clearRect(10, 10, 160, 30);

    // Menggambar teksnya
    ctx.fillStyle = "#222";
    ctx.font = "16px Arial";
    ctx.fillText(`Mouse: (${Math.round(mouse.x)}, ${Math.round(mouse.y)})`, 20, 30);
}

function drawMouseFollower() {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(158, 156, 156, 0.5)";
    ctx.fill();
}

function drawSpawnedCircles() {
    for (const circle of spawnedCircles) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();
    }
}

function drawFPS() {
    // 1. Bersihkan area kecil khusus untuk teks FPS
    ctx.clearRect(canvas.width - 100, 10, 100, 30);

    // 2. Baru gambar teksnya
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`FPS: ${fps}`, canvas.width - 90, 30);
}

function drawPauseScreen() {
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.font = "bold 40px Arial";
        ctx.fillText("PAUSED", canvas.width / 2 - 80, canvas.height / 2);
    }
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------

function updateMovingBall() {
    for (const ball of movingBalls) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        let bounced = false;

        if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
            ball.speedX *= -1;
            bounced = true;
        }

        if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
            ball.speedY *= -1;
            bounced = true;
        }

        // Ganti warna tiap kali nabrak dinding
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

// FUNGSI HARD RESET
function resetApp() {
    // Kembalikan posisi dan warna player
    player.x = 600;
    player.y = 350;
    colorIndex = 0;
    player.color = colors[colorIndex];

    // Hapus semua lingkaran tambahan
    spawnedCircles = [];

    // Reset posisi dan warna bola kembali ke awal (1 bola)
    movingBalls = [
        {
            x: 350,
            y: 300,
            radius: 25,
            speedX: 2,
            speedY: 2,
            color: "#9b59b6"
        }
    ];

    // Matikan pause jika sedang aktif
    isPaused = false;

    // Paksa layar dibersihkan (penting kalau sedang pakai mode Trail Permanen)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --------------------------------------------------
// INPUT
// --------------------------------------------------

canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
});

// Event Klik: Hanya untuk Spawn Lingkaran statis
canvas.addEventListener("click", function(event) {
    if (isPaused) return;

    // Spawn lingkaran di titik kursor
    spawnedCircles.push({
        x: mouse.x,
        y: mouse.y,
        radius: Math.random() * 15 + 10,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
});

window.addEventListener("keydown", function(event) {
    const controlledKeys = [
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "w", "a", "s", "d", " "
    ];

    if (controlledKeys.includes(event.key)) {
        event.preventDefault();
    }

    // State-based:
    keys[event.key] = true;

    // Event-based (diskrit):
    // C - Ganti Warna Player
    if (event.key.toLowerCase() === "c" && !event.repeat) {
        colorIndex = (colorIndex + 1) % colors.length;
        player.color = colors[colorIndex];  
    }

    // R - Reset Keseluruhan (Memanggil fungsi resetApp)
    if (event.key.toLowerCase() === "r" && !event.repeat) {
        resetApp();
    }

    // SPASI - Pause Toggle
    if (event.key === " " && !event.repeat) {
        isPaused = !isPaused;
    }
});

window.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

// --------------------------------------------------
// ANIMATION LOOP
// --------------------------------------------------

function animate(timestamp) {
    requestAnimationFrame(animate);

    if (!then) then = timestamp;
    if (!lastDrawnTime) lastDrawnTime = timestamp;

    // Logika Throttling FPS
    if (targetFPS > 0) {
        const elapsed = timestamp - then;
        if (elapsed < fpsInterval) return; // Skip frame jika terlalu cepat
        then = timestamp - (elapsed % fpsInterval);
    }

    // Kalkulasi Angka FPS
    const deltaTime = timestamp - lastDrawnTime;
    lastDrawnTime = timestamp;
    if (deltaTime > 0) {
        fps = Math.round((fps * 0.9) + ((1000 / deltaTime) * 0.1));
    }

    // Menggunakan fungsi clearCanvas yang sudah mendukung Trail
    clearCanvas();

    if (!isPaused) {
        updateMovingBall();
        updatePlayer();
    }

    // Render ulang semua objek
    drawSpawnedCircles();
    drawRectangle();
    drawLine();
    drawCircle();
    drawTriangle();
    drawMovingBall();
    drawPlayer();
    
    // UI
    drawMouseCoordinate();
    drawMouseFollower();
    drawFPS();
    drawPauseScreen();
}

requestAnimationFrame(animate);
