// Initialization
const bird = document.querySelector('.bird');
let birdY = window.innerHeight / 2; // Y position of the bird
bird.style.top = birdY + 'px';      // <-- Add this line
let velocity = 0; // Bird's vertical velocity
const gravity = 0.5; // Gravity value
const jumpPower = -10; // Jump power
let isGameOver = false;
const playBtn = document.querySelector('.play-btn');
const ground = document.querySelector('.ground');

let currentScore = 0;
let highestScore = localStorage.getItem('highestScore') || 0; // Get the highest score from local storage

document.getElementById('highest-score').textContent = highestScore; // Display the highest score

// Call this function whenever the user earns a point
function increaseScore() {
    currentScore++;
    document.getElementById('current-score').textContent = currentScore;

    // Check and update the highest score
    if (currentScore > highestScore) {
        highestScore = currentScore;
        document.getElementById('highest-score').textContent = highestScore;
        localStorage.setItem('highestScore', highestScore); // Save the new highest score to local storage
    }
    console.log("Current Score:", currentScore);
}




// Event listener for jumps
document.addEventListener('keydown', flap);

playBtn.addEventListener('click', startGame);

function flap() {
    velocity += jumpPower;
}

let gameStartTime = null;    // <-- Add this variable

function startGame() {
    playBtn.style.display = 'none';
    birdY = window.innerHeight / 2;
    velocity = 0;
    isGameOver = false;
    gameStartTime = Date.now();  // <-- Set the game start time
    gameLoop();
    // Hide the Game Over message
    document.querySelector('.game-over-message').setAttribute('hidden', true);
}

let isMouseDown = false;   // <-- Add this variable
// Add these event listeners
document.addEventListener('mousedown', flap);
document.addEventListener('mouseup', () => velocity = 0);

let groundOffset = 0;  // Initial offset
const groundSpeed = 2;  // Speed of the ground movement

const pipes = [];

function generatePipes() {
    const gapSize = 200;  // Gap size between top and bottom pipes
    const gapPosition = Math.random() * (window.innerHeight - gapSize);  // Random gap position
    
    const topPipe = document.createElement('div');
    topPipe.classList.add('pipe', 'pipe-top');
    topPipe.style.height = `${gapPosition}px`;
    topPipe.style.right = '0px';
    
    const bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe');
    bottomPipe.style.height = `${window.innerHeight - gapPosition - gapSize}px`;
    bottomPipe.style.right = '0px';
    
    document.querySelector('.game-container').appendChild(topPipe);
    document.querySelector('.game-container').appendChild(bottomPipe);
    
    pipes.push({ top: topPipe, bottom: bottomPipe, passed: false });
}

// Call generatePipes every 2 seconds
setInterval(generatePipes, 2000);

function movePipes() {
    console.log("Inside movePipes");
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (!pipes[i]) continue;
        const topPipe = pipes[i].top;
        const bottomPipe = pipes[i].bottom;

        // Move pipes to the left
        const currentRight = parseFloat(topPipe.style.right);
        console.log(`Pipe ${i} position: ${currentRight}`);
        topPipe.style.right = `${currentRight + 2}px`;
        bottomPipe.style.right = `${currentRight + 2}px`;

        // Remove off-screen pipes
        if (window.innerWidth - currentRight < 0) {
            console.log(`Pipe ${i} is off screen.`);
            topPipe.remove();
            bottomPipe.remove();
            pipes.splice(i, 1);
        }

        // Check for collisions
        const birdLeft = bird.getBoundingClientRect().left;
        const birdRight = bird.getBoundingClientRect().right;
        const birdTop = bird.getBoundingClientRect().top;
        const birdBottom = bird.getBoundingClientRect().bottom;

        const pipeLeft = topPipe.getBoundingClientRect().left;
        const pipeRight = topPipe.getBoundingClientRect().right;
        const pipeTopBottom = topPipe.getBoundingClientRect().bottom;
        const pipeBottomTop = bottomPipe.getBoundingClientRect().top;

        // Check if the bird has passed the pipe without a collision
        if (birdRight > pipeRight && !pipes[i].passed) {
            pipes[i].passed = true;  // Mark the pipe as passed
            increaseScore();
        }

        // Check for collisions with pipes
        if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < pipeTopBottom || birdBottom > pipeBottomTop)
        ) {
            gameOver();
        }
    }
}




// Game loop
function gameLoop() {
    if (isGameOver) return;

    if (!isMouseDown) {   // Apply gravity only when mouse is not pressed
        if (Date.now() - gameStartTime > 1000) {
            birdY += velocity;
            velocity += gravity;
        }
    }
    

    // Move the ground
    groundOffset -= groundSpeed;
    if (groundOffset <= -window.innerWidth) {
        groundOffset = 0;
    }
    ground.style.transform = `translateX(${groundOffset}px)`;

    // Move the bird based on its Y position
    bird.style.top = birdY + 'px';

    movePipes();

    // Check if bird hits the ground
    if (birdY > window.innerHeight || birdY < 0) {
        gameOver();
    }

    // TODO: Generate and move pipes, and check for collisions

    requestAnimationFrame(gameLoop); // Continuously call the game loop
}

function gameOver() {
    isGameOver = true;
    // Display the Game Over message
    document.querySelector('.game-over-message').removeAttribute('hidden');

    // Remove all pipes from the scene
    pipes.forEach(pipe => {
        pipe.top.remove();
        pipe.bottom.remove();
    });

    // Clear the pipes array
    pipes.length = 0;

    // Reset bird's position
    birdY = window.innerHeight / 2;
    bird.style.top = birdY + 'px';

    // Reset velocity
    velocity = 0;

    // Display the play button again
    playBtn.style.display = 'block';
    currentScore = 0;
    document.getElementById('current-score').textContent = currentScore;
}



