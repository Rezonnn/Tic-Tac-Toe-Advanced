// Tic Tac Toe with AI – Advanced

const boardEl = document.getElementById("board");
const statusTextEl = document.getElementById("status-text");
const difficultyEl = document.getElementById("difficulty");
const playerSymbolEl = document.getElementById("player-symbol");
const newGameBtn = document.getElementById("new-game");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayMessageEl = document.getElementById("overlay-message");
const overlayBtn = document.getElementById("overlay-btn");
const logListEl = document.getElementById("log-list");

const scorePlayerEl = document.getElementById("score-player");
const scoreAiEl = document.getElementById("score-ai");
const scoreDrawEl = document.getElementById("score-draw");

let board = Array(9).fill(null); // indices 0–8
let playerSymbol = "X";
let aiSymbol = "O";
let isPlayerTurn = true;
let gameOver = false;
let roundCount = 0;

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const scores = {
  player: 0,
  ai: 0,
  draw: 0
};

function createBoardCells() {
  boardEl.innerHTML = "";
  board = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.dataset.index = i.toString();
    cell.addEventListener("click", onCellClick);
    boardEl.appendChild(cell);
  }
}

function onCellClick(e) {
  if (gameOver) return;
  if (!isPlayerTurn) return;

  const idx = parseInt(e.currentTarget.dataset.index, 10);
  if (board[idx] !== null) return;

  makeMove(idx, playerSymbol);
  const winnerInfo = checkWinner(board);

  if (winnerInfo || isBoardFull(board)) {
    endGame(winnerInfo);
    return;
  }

  isPlayerTurn = false;
  updateStatusText();

  // AI moves slightly delayed for better feel
  setTimeout(() => {
    aiMove();
  }, 400);
}

function makeMove(idx, symbol) {
  board[idx] = symbol;
  const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
  if (cell) {
    cell.textContent = symbol;
    cell.classList.add("taken");
  }
}

function checkWinner(currentBoard) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return { winner: currentBoard[a], combo };
    }
  }
  return null;
}

function isBoardFull(currentBoard) {
  return currentBoard.every((cell) => cell !== null);
}

// AI logic

function aiMove() {
  if (gameOver) return;

  const difficulty = difficultyEl.value;
  let idx;

  if (difficulty === "easy") {
    idx = getRandomMove();
  } else if (difficulty === "medium") {
    // 50% chance random, 50% minimax
    const randomFirst = Math.random() < 0.5;
    idx = randomFirst ? getRandomMove() : getBestMove();
  } else {
    // hard – always minimax
    idx = getBestMove();
  }

  if (idx == null) {
    // No moves – should be a draw
    endGame(null);
    return;
  }

  makeMove(idx, aiSymbol);

  const winnerInfo = checkWinner(board);
  if (winnerInfo || isBoardFull(board)) {
    endGame(winnerInfo);
    return;
  }

  isPlayerTurn = true;
  updateStatusText();
}

function getRandomMove() {
  const available = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);
  if (available.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

function getBestMove() {
  // Minimax algorithm (AI is aiSymbol, opponent is playerSymbol)
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiSymbol;
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(currentBoard, depth, isMaximizing) {
  const winnerInfo = checkWinner(currentBoard);
  if (winnerInfo) {
    if (winnerInfo.winner === aiSymbol) return 10 - depth;
    if (winnerInfo.winner === playerSymbol) return depth - 10;
  }
  if (isBoardFull(currentBoard)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = aiSymbol;
        const score = minimax(currentBoard, depth + 1, false);
        currentBoard[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = playerSymbol;
        const score = minimax(currentBoard, depth + 1, true);
        currentBoard[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Game flow

function updateStatusText() {
  if (gameOver) return;
  if (isPlayerTurn) {
    statusTextEl.textContent = `Your turn as ${playerSymbol}.`;
  } else {
    statusTextEl.textContent = `AI (${aiSymbol}) is thinking...`;
  }
}

function highlightWinningCombo(combo) {
  combo.forEach((idx) => {
    const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
    if (cell) {
      cell.classList.add("winning");
    }
  });
}

function logEvent(message) {
  const li = document.createElement("li");
  li.textContent = `Round ${roundCount}: ${message}`;
  logListEl.insertBefore(li, logListEl.firstChild);
}

function endGame(winnerInfo) {
  gameOver = true;
  roundCount += 1;

  let title = "";
  let message = "";

  if (winnerInfo && winnerInfo.winner === playerSymbol) {
    title = "You Win! 🎉";
    message = `You outplayed the AI as ${playerSymbol}. Well done.`;
    scores.player += 1;
    highlightWinningCombo(winnerInfo.combo);
    logEvent("You won against the AI.");
  } else if (winnerInfo && winnerInfo.winner === aiSymbol) {
    title = "AI Wins 🤖";
    message = `The AI (${aiSymbol}) found the winning line. Try again on a different difficulty.`;
    scores.ai += 1;
    highlightWinningCombo(winnerInfo.combo);
    logEvent("AI won this round.");
  } else {
    title = "It's a Draw 🤝";
    message = "Balanced game. Nobody wins this time.";
    scores.draw += 1;
    logEvent("The game ended in a draw.");
  }

  updateScores();
  showOverlay(title, message);
}

function updateScores() {
  scorePlayerEl.textContent = scores.player;
  scoreAiEl.textContent = scores.ai;
  scoreDrawEl.textContent = scores.draw;
}

function showOverlay(title, message) {
  overlayTitleEl.textContent = title;
  overlayMessageEl.textContent = message;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

// New game setup

function resetBoardState() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "winning");
  });
  board = Array(9).fill(null);
}

function startNewGame() {
  hideOverlay();
  resetBoardState();
  gameOver = false;

  playerSymbol = playerSymbolEl.value;
  aiSymbol = playerSymbol === "X" ? "O" : "X";

  // If AI should start
  if (playerSymbol === "O") {
    isPlayerTurn = false;
    updateStatusText();
    setTimeout(() => aiMove(), 400);
  } else {
    isPlayerTurn = true;
    updateStatusText();
  }
}

// Event listeners

newGameBtn.addEventListener("click", () => {
  startNewGame();
});

playerSymbolEl.addEventListener("change", () => {
  startNewGame();
});

difficultyEl.addEventListener("change", () => {
  // Just update status/log when difficulty changes
  logEvent(`Difficulty set to: ${difficultyEl.value}.`);
  updateStatusText();
});

overlayBtn.addEventListener("click", () => {
  startNewGame();
});

overlayEl.addEventListener("click", (e) => {
  if (e.target === overlayEl) {
    startNewGame();
  }
});

// Init

createBoardCells();
startNewGame();
