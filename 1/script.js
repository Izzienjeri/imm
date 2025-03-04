// Game parameters
const gridSize = 9;
const numMines = 10;

// Game state variables
let board = [];
let minesLeft = numMines;
let gameOver = false;
let flagChances = 10;
let isMuted = false;
let currentTile = 0;

// DOM elements
const gameboard = document.getElementById("gameboard");
const minesLeftDisplay = document.getElementById("mines-left");
const resetButton = document.getElementById("reset-button");
const toastContainer = document.getElementById("toast-container");
const instructionsButton = document.getElementById("instructions-button");
const instructionsModal = document.getElementById("instructions-modal");
const resetConfirmationModal = document.getElementById("reset-confirmation-modal");
const explosionSound = document.getElementById("explosion-sound");
const muteButton = document.getElementById("mute-button");
const confirmResetButton = document.getElementById("confirm-reset-button");
const cancelResetButton = document.getElementById("cancel-reset-button");


// Toggle mute state
muteButton.addEventListener("click", () => {
    isMuted = !isMuted;
    muteButton.innerHTML = isMuted
        ? '<i class="fas fa-volume-mute"></i>'
        : '<i class="fas fa-volume-up"></i>';
});

// Show reset confirmation modal
resetButton.addEventListener("click", () => {
    openModal('reset-confirmation-modal');
});

// Show instructions modal
instructionsButton.addEventListener("click", () => {
    openModal('instructions-modal');
});


// Confirm reset action
confirmResetButton.addEventListener("click", () => {
    closeModal('reset-confirmation-modal');
    createBoard();
    showToast("Game restarted!", "info");
});

// Cancel reset action
cancelResetButton.addEventListener("click", () => {
    closeModal('reset-confirmation-modal');
});


// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});


// Initialize game board
function createBoard() {
    board = [];
    minesLeft = numMines;
    gameOver = false;
    flagChances = 10;
    gameboard.innerHTML = "";
    minesLeftDisplay.textContent = minesLeft;
    currentTile = 0;

    gameboard.removeEventListener("keydown", handleKeyboardNavigation);

    // Create tiles
    for (let i = 0; i < gridSize * gridSize; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile", "hidden");
        tile.id = i.toString();
        tile.setAttribute("tabindex", "0");
        tile.setAttribute("aria-label", "Hidden Tile");
        tile.addEventListener("click", handleClick);
        tile.addEventListener("contextmenu", handleRightClick);
        tile.addEventListener("keydown", handleKeyboardNavigation);
        gameboard.appendChild(tile);

        board.push({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
        });
    }
    plantMines();
    updateTileAriaLabels();
    gameboard.firstChild.focus();
}

// Plant mines randomly
function plantMines() {
    let minesPlanted = 0;
    while (minesPlanted < numMines) {
        const randomIndex = Math.floor(Math.random() * (gridSize * gridSize));
        if (!board[randomIndex].isMine) {
            board[randomIndex].isMine = true;
            minesPlanted++;
        }
    }
    calculateAdjacentMines();
}

// Calculate adjacent mines for each tile
function calculateAdjacentMines() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        if (board[i].isMine) {
            continue;
        }

        board[i].adjacentMines = 0;

        const tileRow = Math.floor(i / gridSize);
        const tileCol = i % gridSize;

        // Iterate through adjacent tiles
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                if (rowOffset === 0 && colOffset === 0) {
                    continue;
                }

                const adjacentRow = tileRow + rowOffset;
                const adjacentCol = tileCol + colOffset;

                if (
                    adjacentRow < 0 ||
                    adjacentRow >= gridSize ||
                    adjacentCol < 0 ||
                    adjacentCol >= gridSize
                ) {
                    continue;
                }

                const adjacentIndex = adjacentRow * gridSize + adjacentCol;

                if (
                    adjacentIndex >= 0 &&
                    adjacentIndex < board.length &&
                    board[adjacentIndex].isMine
                ) {
                    board[i].adjacentMines++;
                }
            }
        }
    }
}

// Handle tile click
function handleClick(event) {
    const tileId = parseInt(event.target.id);
    handleTileAction(tileId);
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
    const keyCode = event.key;
    let tileElement;

    switch (keyCode) {
        case "ArrowLeft":
            event.preventDefault();
            currentTile = Math.max(0, currentTile - 1);
            break;
        case "ArrowRight":
            event.preventDefault();
            currentTile = Math.min(gridSize * gridSize - 1, currentTile + 1);
            break;
        case "ArrowUp":
            event.preventDefault();
            currentTile = Math.max(0, currentTile - gridSize);
            break;
        case "ArrowDown":
            event.preventDefault();
            currentTile = Math.min(gridSize * gridSize - 1, currentTile + gridSize);
            break;
        case "Enter":
            event.preventDefault();
            handleTileAction(currentTile);
            break;
        case " ":
            event.preventDefault();
            handleRightClick({target: document.getElementById(currentTile.toString())});
            break;
        default:
            return;
    }

    tileElement = document.getElementById(currentTile.toString());
    if (tileElement) {
        tileElement.focus();
    }
}

// Handle tile action on click or keyboard
function handleTileAction(tileId) {
    if (gameOver) {
        return;
    }

    const tile = board[tileId];
    const tileElement = document.getElementById(tileId);

    if (!tileElement) {
        console.error("handleClick: tileElement is null for tileId", tileId);
        return;
    }
    if (tile.isRevealed || tile.isFlagged) {
        return;
    }

    if (tile.isMine) {
        gameOver = true;
        if (!isMuted) {
            explosionSound.play();
        }
        revealAllTiles();
        showToast("Game Over! You hit a mine.", "error");
    } else {
        revealTile(tileId);

        let tilesRevealed = 0;
        for (let i = 0; i < gridSize * gridSize; i++) {
            if (board[i].isRevealed && !board[i].isMine) {
                tilesRevealed++;
            }
        }
        if (tilesRevealed === gridSize * gridSize - numMines) {
            gameOver = true;
            showToast("You Win!", "success");
        }
    }
}

// Reveal a tile and cascade reveal empty tiles
function revealTile(tileId) {
    const tile = board[tileId];
    if (!tile) return;
    if (tile.isRevealed || tile.isFlagged) return;

    tile.isRevealed = true;
    const tileElement = document.getElementById(tileId);
    if (!tileElement) return;

    tileElement.classList.remove("hidden");
    tileElement.classList.add("revealed");

    updateTileAriaLabels();

    tileElement.dataset.adjacentMines = tile.adjacentMines;

    gsap.to(tileElement, {
        duration: 0.3,
        scale: 1.1,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
            gsap.to(tileElement, {duration: 0.1, scale: 1});
        }
    });

    if (tile.adjacentMines > 0) {
        tileElement.textContent = tile.adjacentMines;
        return;
    }

    const tileRow = Math.floor(tileId / gridSize);
    const tileCol = tileId % gridSize;

    // Recursively reveal adjacent tiles
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }
            const adjacentRow = tileRow + rowOffset;
            const adjacentCol = tileCol + colOffset;
            if (
                adjacentRow >= 0 &&
                adjacentRow < gridSize &&
                adjacentCol >= 0 &&
                adjacentCol < gridSize
            ) {
                const adjacentTileId = adjacentRow * gridSize + adjacentCol;
                revealTile(adjacentTileId);
            }
        }
    }
}

// Handle right click to flag or unflag a tile
function handleRightClick(event) {
    event.preventDefault();

    if (gameOver) {
        return;
    }

    const tileId = parseInt(event.target.id);
    const tile = board[tileId];
    if (!tile) return;
    const tileElement = document.getElementById(tileId);
    if (!tileElement) return;

    if (tile.isRevealed) {
        return;
    }

    if (tile.isFlagged) {
        tile.isFlagged = false;
        tileElement.classList.remove("flagged");
        tileElement.innerHTML = "";
        minesLeft++;
        flagChances++;
        tileElement.setAttribute("aria-label", "Hidden Tile");
    } else {
        if (flagChances <= 0) {
            showToast("You have no more flags left!", "error");
            return;
        }

        tile.isFlagged = true;
        tileElement.classList.add("flagged");
        tileElement.innerHTML = '<i class="fas fa-flag"></i>';
        minesLeft--;
        flagChances--;
        tileElement.setAttribute("aria-label", "Flagged Tile");
    }
    minesLeftDisplay.textContent = minesLeft;
}

// Reveal all tiles after game over
function revealAllTiles() {
    board.forEach((tile, index) => {
        const tileElement = document.getElementById(index);
        if (!tileElement) return;
        tile.isRevealed = true;
        tileElement.classList.remove("hidden");
        tileElement.classList.add("revealed");
        tileElement.removeAttribute("tabindex");

        if (tile.isMine) {
            tileElement.classList.add("mine");
            tileElement.innerHTML = '<i class="fas fa-bomb"></i>';
            tileElement.setAttribute("aria-label", "Mine! Game Over");

        } else if (tile.adjacentMines > 0) {
            tileElement.textContent = tile.adjacentMines;
            tileElement.setAttribute("aria-label", `Revealed tile, ${tile.adjacentMines} adjacent mines`);
        } else {
            tileElement.setAttribute("aria-label", "Revealed Empty Tile");
        }
    });
    minesLeft = 0;
    minesLeftDisplay.textContent = minesLeft;
}

// Display toast message
function showToast(message, type) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast", type);
    toastContainer.appendChild(toast);

    gsap.fromTo(
        toast,
        {opacity: 0, y: -20},
        {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            delay: 0,
            onComplete: () => {
                gsap.to(toast, {
                    opacity: 0,
                    y: -20,
                    duration: 0.3,
                    ease: "power2.in",
                    delay: 2,
                    onComplete: () => toast.remove(),
                });
            },
        }
    );
}


// Update aria labels for accessibility
function updateTileAriaLabels() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const tileElement = document.getElementById(i.toString());
        if (tileElement) {
            const tile = board[i];
            if (tile.isRevealed) {
                if (tile.isMine) {
                    tileElement.setAttribute("aria-label", "Mine! Game Over");
                } else if (tile.adjacentMines > 0) {
                    tileElement.setAttribute("aria-label", `Revealed tile, ${tile.adjacentMines} adjacent mines`);
                } else {
                    tileElement.setAttribute("aria-label", "Revealed Empty Tile");
                }
                tileElement.removeAttribute("tabindex");
            } else if (tile.isFlagged) {
                tileElement.setAttribute("aria-label", "Flagged Tile");
            } else {
                tileElement.setAttribute("aria-label", "Hidden Tile");
            }
        }
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", closeModalOnEscape);
    const closeButton = modal.querySelector(".close");
    if (closeButton) {
        closeButton.focus();
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", closeModalOnEscape);
    if(modalId === 'instructions-modal'){
        instructionsButton.focus();
    }else if(modalId === 'reset-confirmation-modal'){
        resetButton.focus();
    }
}

// Close modal on escape key
function closeModalOnEscape(event) {
    if (event.key === "Escape") {
        const openModal = document.querySelector('.modal.open');
        if(openModal){
            closeModal(openModal.id);
        }
    }
}

// Initialize event listeners and create initial board
gameboard.addEventListener("keydown", handleKeyboardNavigation);
createBoard();