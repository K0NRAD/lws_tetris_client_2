document.addEventListener("DOMContentLoaded", () => {
    const startGame = document.getElementsByName("start-game")[0];
    const bgCanvas = document.getElementById("background-canvas");
    const modal = document.querySelector("[data-modal]");
    const waveContainer = document.querySelector(".wave-container");

    const dataCloseModal = document.querySelector("[data-close-modal]");
    const dataScoreModal = document.querySelector("[data-score-modal]");

    const bgCtx = bgCanvas.getContext("2d");

    dataCloseModal.addEventListener("click", () => {
        board = Array(ROWS)
            .fill()
            .map(() => Array(COLS).fill(0));
        score = 0;
        scoreElement.textContent = "Score: 0";
        modal.close();
    });

    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 2 + 1,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * 2 - 1,
        });
    }

    function drawBackground() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        const gradient = bgCtx.createLinearGradient(0, 0, bgCanvas.width, bgCanvas.height);
        gradient.addColorStop(0, "#4488ff");
        gradient.addColorStop(0.5, "#d76daa");
        gradient.addColorStop(1, "#ffaf7b");

        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

        particles.forEach((particle) => {
            particle.x += particle.dx;
            particle.y += particle.dy;

            if (particle.x < 0 || particle.x > bgCanvas.width) particle.dx = -particle.dx;
            if (particle.y < 0 || particle.y > bgCanvas.height) particle.dy = -particle.dy;

            bgCtx.beginPath();
            bgCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            bgCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
            bgCtx.fill();
        });

        requestAnimationFrame(drawBackground);
    }

    drawBackground();

    const canvas = document.getElementById("tetrisCanvas");
    const ctx = canvas.getContext("2d");
    const scoreElement = document.getElementById("score");
    const nextPieceCanvas = document.getElementById("next-piece-canvas");
    const nextPieceCtx = nextPieceCanvas.getContext("2d");
    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 40;
    const PREVIEW_BLOCK_SIZE = 30;
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;

    let board = Array(ROWS)
        .fill()
        .map(() => Array(COLS).fill(0));
    let currentPiece;
    let nextPiece;
    let score = 0;
    let dropCounter = 0;
    let lastTime = 0;
    let dropInterval = 1000; // Steine fallen jede Sekunde
    let gameLoopId = 0;
    let isRunning = false;

    const COLORS = [
        null,
        "rgba(255, 13, 114, 0.8)", // I
        "rgba(13, 194, 255, 0.8)", // O
        "rgba(13, 255, 114, 0.8)", // T
        "rgba(245, 56, 255, 0.8)", // L
        "rgba(255, 142, 13, 0.8)", // J
        "rgba(255, 225, 56, 0.8)", // S
        "rgba(56, 119, 255, 0.8)", // Z
    ];

    const PIECES = [
        [[1, 1, 1, 1]], // I
        [
            [2, 2],
            [2, 2],
        ], // O
        [
            [0, 3, 0],
            [3, 3, 3],
        ], // T
        [
            [4, 0, 0],
            [4, 4, 4],
        ], // L
        [
            [0, 0, 5],
            [5, 5, 5],
        ], // J
        [
            [0, 6, 6],
            [6, 6, 0],
        ], // S
        [
            [7, 7, 0],
            [0, 7, 7],
        ], // Z
    ];

    function drawBlock(ctx, x, y, colorIndex, blockSize) {
        const radius = blockSize / 4;
        ctx.fillStyle = COLORS[colorIndex];
        ctx.beginPath();
        ctx.moveTo(x * blockSize + radius, y * blockSize);
        ctx.lineTo(x * blockSize + blockSize - radius, y * blockSize);
        ctx.quadraticCurveTo(x * blockSize + blockSize, y * blockSize, x * blockSize + blockSize, y * blockSize + radius);
        ctx.lineTo(x * blockSize + blockSize, y * blockSize + blockSize - radius);
        ctx.quadraticCurveTo(x * blockSize + blockSize, y * blockSize + blockSize, x * blockSize + blockSize - radius, y * blockSize + blockSize);
        ctx.lineTo(x * blockSize + radius, y * blockSize + blockSize);
        ctx.quadraticCurveTo(x * blockSize, y * blockSize + blockSize, x * blockSize, y * blockSize + blockSize - radius);
        ctx.lineTo(x * blockSize, y * blockSize + radius);
        ctx.quadraticCurveTo(x * blockSize, y * blockSize, x * blockSize + radius, y * blockSize);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4 )";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, x, y, value, BLOCK_SIZE);
                }
            });
        });
    }

    function drawPiece(piece, ctx, blockSize) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, piece.x + x, piece.y + y, value, blockSize);
                }
            });
        });
    }

    function drawNextPiece() {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        const previewPiece = {
            x: (nextPieceCanvas.width / PREVIEW_BLOCK_SIZE - nextPiece.shape[0].length) / 2,
            y: (nextPieceCanvas.height / PREVIEW_BLOCK_SIZE - nextPiece.shape.length) / 2,
            shape: nextPiece.shape,
        };
        drawPiece(previewPiece, nextPieceCtx, PREVIEW_BLOCK_SIZE);
    }

    function createPiece() {
        const pieceIndex = Math.floor(Math.random() * PIECES.length);
        return {
            x: Math.floor(COLS / 2) - Math.ceil(PIECES[pieceIndex][0].length / 2),
            y: 0,
            shape: PIECES[pieceIndex],
        };
    }

    function newPiece() {
        currentPiece = nextPiece || createPiece();
        nextPiece = createPiece();
        drawNextPiece();
    }

    function isValidMove(piece, offsetX, offsetY) {
        return piece.shape.every((row, y) =>
            row.every((value, x) => {
                let newX = piece.x + x + offsetX;
                let newY = piece.y + y + offsetY;
                return value === 0 || (newX >= 0 && newX < COLS && newY < ROWS && (newY < 0 || board[newY][newX] === 0));
            })
        );
    }

    function mergePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[currentPiece.y + y][currentPiece.x + x] = value;
                }
            });
        });
    }

    function clearLines() {
        let linesCleared = 0;
        board = board.filter((row) => {
            if (row.every((cell) => cell !== 0)) {
                linesCleared++;
                return false;
            }
            return true;
        });

        if (linesCleared > 0) {
            updateScore(linesCleared);
        }

        while (linesCleared > 0) {
            board.unshift(Array(COLS).fill(0));
            linesCleared--;
        }
    }

    function updateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200];
        score += points[linesCleared];
        scoreElement.textContent = `Score: ${score}`;
    }

    function gameLoop(currentTime = 0) {
        if (!isRunning) {
            return;
        }
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            dropPiece();
        }

        drawBoard();
        drawPiece(currentPiece, ctx, BLOCK_SIZE);
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function dropPiece() {
        if (isValidMove(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            newPiece();
            if (!isValidMove(currentPiece, 0, 0)) {
                dataScoreModal.textContent = `${score}`;
                modal.showModal();
                isRunning = false;
                cancelAnimationFrame(gameLoopId);
            }
        }
        dropCounter = 0;
    }

    function hardDrop() {
        while (isValidMove(currentPiece, 0, 1)) {
            currentPiece.y++;
        }
        dropPiece();
    }

    function rotatePiece() {
        const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse());
        if (isValidMove({ ...currentPiece, shape: rotated }, 0, 0)) {
            currentPiece.shape = rotated;
        }
    }

    function handleKeyPress(event) {
        event.preventDefault();
        switch (event.key) {
            case "ArrowLeft":
                if (isValidMove(currentPiece, -1, 0)) currentPiece.x--;
                break;
            case "ArrowRight":
                if (isValidMove(currentPiece, 1, 0)) currentPiece.x++;
                break;
            case "ArrowDown":
                hardDrop();
                break;
            case "ArrowUp":
                rotatePiece();
                break;
        }
    }

    const onClickStartGame = () => {
        isRunning = true;
        requestAnimationFrame(gameLoop);
    };

    nextPiece = createPiece();
    newPiece();

    document.addEventListener("keydown", handleKeyPress);

    startGame.addEventListener("click", onClickStartGame);

    // - - - - websocket

    const socket = new WebSocket("ws://localhost:8765");

    socket.addEventListener("open", (event) => {
        console.log("WebSocket is connected.");
    });

    socket.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);
        switch (event.data) {
            case "Start":
                onClickStartGame();
                break;
            case "Left":
                handleKeyPress({ key: "ArrowLeft" });
                break;
            case "Right":
                handleKeyPress({ key: "ArrowRight" });
                break;
            case "Rotate":
                handleKeyPress({ key: "ArrowUp" });
                break;
            case "Drop":
                handleKeyPress({ key: "ArrowDown" });
                break;
        }
    });
});
