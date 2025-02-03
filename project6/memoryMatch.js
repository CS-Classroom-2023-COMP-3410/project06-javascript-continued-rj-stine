const board = document.getElementById('game-board');
const moveCounter = document.getElementById('move-counter');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');
const difficultySelect = document.getElementById('difficulty');
const lifeCounterDisplay = document.getElementById('life-counter');
const powerupStatusDisplay = document.getElementById('powerup-status');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = null;
let seconds = 0;
const TOTAL_LIVES = 9;
let lives = TOTAL_LIVES;
let powerupAvailable = true;

// Generate card content based on difficulty
const generateCards = (difficulty) => {
    const symbols = ['🍎', '🍌', '🍒', '🍇', '🍓', '🍉', '🍍', '🥝', '🍋', '🍑', '🍈', '🥥', '🍏', '🥭', '🍐', '🍔'];
    let numPairs;

    switch (difficulty) {
        case 'medium':
            numPairs = 12;
            break;
        case 'hard':
            numPairs = 16;
            break;
        default:
            numPairs = 8;
    }

    updateLifeCounter();
    updatePowerupStatus();

    const selectedSymbols = symbols.slice(0, numPairs);
    const pairs = [...selectedSymbols, ...selectedSymbols];
    return pairs.sort(() => Math.random() - 0.5);
};

// Update life counter display
const updateLifeCounter = () => {
    lifeCounterDisplay.textContent = '❤'.repeat(lives);
};

// Update powerup status display
const updatePowerupStatus = () => {
    powerupStatusDisplay.textContent = powerupAvailable ? "Available (Press 'P')" : "Used (Unavailable)";
    powerupStatusDisplay.style.color = powerupAvailable ? 'green' : 'red';
};

// Determine the number of cards to reveal based on difficulty
const getPowerupRevealCount = () => {
    switch (difficultySelect.value) {
        case 'medium':
            return 5; // Medium reveals 5 cards
        case 'hard':
            return 7; // Hard reveals 7 cards
        default:
            return 3; // Easy reveals 3 cards
    }
};

// Powerup: Reveal a set number of random cards
const activatePowerup = (centerCardIndex) => {
    if (!powerupAvailable) return;

    powerupAvailable = false;
    updatePowerupStatus();

    const gridSize = Math.sqrt(cards.length);
    const revealCount = getPowerupRevealCount();
    const revealedIndices = new Set([centerCardIndex]);

    // Randomly select additional cards to reveal
    while (revealedIndices.size < revealCount) {
        const randomNeighbor = Math.floor(Math.random() * cards.length);
        revealedIndices.add(randomNeighbor);
    }

    // Reveal selected cards
    revealedIndices.forEach((index) => {
        cards[index].classList.add('flipped');
    });

    // Hide the cards again after 2 seconds
    setTimeout(() => {
        revealedIndices.forEach((index) => {
            cards[index].classList.remove('flipped');
        });
    }, 2000);
};

// Update timer display
const updateTimer = () => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timerDisplay.textContent = `${minutes}:${sec.toString().padStart(2, '0')}`;
};

// Start timer
const startTimer = () => {
    if (!timer) {
        timer = setInterval(updateTimer, 1000);
    }
};

// Stop timer
const stopTimer = () => {
    clearInterval(timer);
    timer = null;
};

// Reset game
const resetGame = () => {
    board.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    lives = TOTAL_LIVES;
    powerupAvailable = true;
    timerDisplay.textContent = '0:00';
    moveCounter.textContent = moves;
    updateLifeCounter();
    updatePowerupStatus();
    stopTimer();
    initializeGame(difficultySelect.value);
};

// Flip card
const flipCard = (cardElement) => {
    if (flippedCards.length < 2 && !cardElement.classList.contains('flipped')) {
        cardElement.classList.add('flipped');
        flippedCards.push(cardElement);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }
};

// Check for match
const checkMatch = () => {
    const [card1, card2] = flippedCards;
    const symbol1 = card1.querySelector('.card-content').textContent;
    const symbol2 = card2.querySelector('.card-content').textContent;

    if (symbol1 === symbol2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        if (matchedPairs === cards.length / 2) {
            stopTimer();
            alert(`You won! Time: ${timerDisplay.textContent}, Moves: ${moves}`);
        }
        flippedCards = [];
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            loseLife();
        }, 1000);
    }
    moves++;
    moveCounter.textContent = moves;
};

// Handle losing a life
const loseLife = () => {
    lives--;
    updateLifeCounter();

    if (lives === 0) {
        stopTimer();
        alert('Game Over! You ran out of lives.');
        restartGamePrompt();
    }
};

// Prompt the player to restart the game
const restartGamePrompt = () => {
    if (confirm('Would you like to restart the game?')) {
        resetGame();
    }
};

// Listen for the powerup key (P)
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p' && powerupAvailable) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        activatePowerup(randomIndex);
    }
});

// Initialize game
const initializeGame = (difficulty) => {
    const cardSymbols = generateCards(difficulty);

    let columns;
    switch (difficulty) {
        case 'medium':
            columns = 6;
            break;
        case 'hard':
            columns = 8;
            break;
        default:
            columns = 4;
    }

    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    board.innerHTML = '';

    cardSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `<div class="card-content">${symbol}</div>`;
        card.addEventListener('click', () => {
            startTimer();
            flipCard(card);
        });
        cards.push(card);
        board.appendChild(card);
    });
};

// Event listeners
restartButton.addEventListener('click', resetGame);
difficultySelect.addEventListener('change', resetGame);
initializeGame(difficultySelect.value);
