import Minesweeper from "./src/minesweeper.js";

document.addEventListener("DOMContentLoaded", () => {
	const gameBoard = document.getElementById("game-board");
	const minesCount = document.getElementById("mines-count");
	const resetButton = document.getElementById("reset-button");
	const settingsButton = document.getElementById("settings-button");
	const settingsModal = document.getElementById("settings-modal");
	const closeButton = document.querySelector(".close");
	const settingsForm = document.getElementById("settings-form");

	let rows = 10;
	let cols = 10;
	let mines = 10;
	let is_first_reveal = true;
	let minesweeper;

	function initGame() {
		minesweeper = new Minesweeper(rows, cols, mines);
		is_first_reveal = true; // <-- Reset on new game
		renderBoard();
		updateMinesCount();
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
		if (minesweeper.isGameOver()) return;

		const cell = minesweeper.getCell(row, col);
		if (cell.isFlagged) return;

		let result;

		if (is_first_reveal) {
			result = minesweeper.revealFirstCell(row, col);
			is_first_reveal = false;
		} else {
			result = minesweeper.revealCell(row, col);
		}

		if (result.mineHit) {
			alert("Game Over!");
			revealAllMines();
		} else {
			refreshBoard();
		}
	}

	function handleCellRightClick(row, col) {
		if (minesweeper.isGameOver()) return;

		const cell = minesweeper.getCell(row, col);
		if (cell.isRevealed) return;
		// Allow toggling flag on right click
		minesweeper.flagCell(row, col);
		renderCell(row, col);
		updateMinesCount();
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

	function updateMinesCount() {
		minesCount.textContent = `Mines: ${minesweeper.getRemainingMines()}`;
	}

	settingsButton.addEventListener("click", () => {
		settingsModal.style.display = "flex";
	});

	closeButton.addEventListener("click", () => {
		settingsModal.style.display = "none";
	});

	window.addEventListener("click", (event) => {
		if (event.target === settingsModal) {
			settingsModal.style.display = "none";
		}
	});

	settingsForm.addEventListener("submit", (event) => {
		event.preventDefault();
		rows = parseInt(document.getElementById("rows").value);
		cols = parseInt(document.getElementById("cols").value);
		mines = parseInt(document.getElementById("mines").value);
		settingsModal.style.display = "none";
		initGame();
	});

	resetButton.addEventListener("click", initGame);

	initGame();
});
