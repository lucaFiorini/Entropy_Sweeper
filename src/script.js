import Minesweeper from "./minesweeper.js";
import entropyCalculator from "./entropy/entropyCalculator.js";
import SelfPlay from "./selfPlay.js";

document.addEventListener("DOMContentLoaded", () => {
	const gameBoard = document.getElementById("game-board");
	const resetButton = document.getElementById("reset-button");
	const settingsForm = document.getElementById("settings-form");
	const nextMoveButton = document.getElementById("next-move-button");

	let rows = 10;
	let cols = 10;
	let mines = 10;
	let minesweeper;
	let entropyCalculatorInstance;
	let selfPlay;

	function initGame() {
		try {
			minesweeper = new Minesweeper(rows, cols, mines);
			entropyCalculatorInstance = new entropyCalculator(minesweeper);
			selfPlay = new SelfPlay(minesweeper);
			renderBoard();
		} catch (error) {
			alert("Failed to initialize game: " + error.message);
		}
	}

	function renderBoard() {
		gameBoard.innerHTML = "";
		gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const cell = document.createElement("div");
				cell.className = "cell";
				cell.dataset.row = i;
				cell.dataset.col = j;

				cell.addEventListener("click", () => handleCellClick(i, j));
				cell.addEventListener("contextmenu", (e) => {
					e.preventDefault();
					handleCellRightClick(i, j);
				});

				gameBoard.appendChild(cell);
			}
		}
	}

	function handleCellClick(row, col) {
		if (minesweeper.gameOver) return;

		const cell = minesweeper.getCell(row, col);
		if (cell.isFlagged || cell.isRevealed) return;

		let result = minesweeper.revealCell(row, col);

		if (result.mineHit) {
			alert("Game Over!");
			revealAllMines();
			refreshBoard();
		} else {
			refreshBoard();
			entropyCalculatorInstance.calculateEntropy();
		}
	}

	function handleCellRightClick(row, col) {
		if (minesweeper.gameOver) return;

		const cell = minesweeper.getCell(row, col);
		if (cell.isRevealed) return;

		minesweeper.flagCell(row, col);
		renderCell(row, col);
	}

	function refreshBoard() {
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				renderCell(row, col);
			}
		}
	}

	function renderCell(row, col) {
		const cell = minesweeper.getCell(row, col);
		const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

		if (cell.isRevealed) {
			cellElement.classList.add("revealed");
			if (cell.isMine) {
				cellElement.classList.add("mine");
				cellElement.textContent = "*";
			} else {
				cellElement.textContent = cell.adjacentMines > 0 ? cell.adjacentMines : "";
			}
		} else if (cell.isFlagged) {
			cellElement.classList.add("flagged");
			cellElement.textContent = "F";
		} else {
			cellElement.classList.remove("revealed", "mine", "flagged");
			cellElement.textContent = "";
		}
	}

	function doNextMove() {
		let move = selfPlay.nextMove();
		if (move !== undefined) {
			handleCellClick(move.row, move.col);
		}
		refreshBoard();
	}

	function revealAllMines() {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const cell = minesweeper.getCell(i, j);
				if (cell.isMine) {
					renderCell(i, j);
				}
			}
		}
	}

	settingsForm.addEventListener("submit", (event) => {
		event.preventDefault();
		rows = parseInt(document.getElementById("rows").value);
		cols = parseInt(document.getElementById("cols").value);
		mines = parseInt(document.getElementById("mines").value);
		initGame();
	});

	resetButton.addEventListener("click", initGame);
	nextMoveButton.addEventListener("click", doNextMove);
	initGame();
});
