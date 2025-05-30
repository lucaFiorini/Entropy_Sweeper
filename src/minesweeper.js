/**
 * @module Minesweeper
 * Encapsulates the logic for a Minesweeper game.
 */
class Minesweeper {
	/** @type {Array<Array<Object>>} The game board */
	board = [];
	/** @type {number} Number of rows */
	rows = 0;
	/** @type {number} Number of columns */
	cols = 0;
	/** @type {number} Number of mines */
	mineCount = 0;
	/** @type {boolean} Game over state */
	gameOver = false;

	/**
	 * Initializes the board.
	 * @param {number} r - Number of rows
	 * @param {number} c - Number of columns
	 * @param {number} mineCount - Number of mines
	 */
	constructor(r, c, mineCount) {
		if (!Number.isInteger(r) || !Number.isInteger(c) || !Number.isInteger(mineCount) || r <= 0 || c <= 0 || mineCount < 0 || mineCount >= r * c) {
			throw new Error("Invalid board size or mine count");
		}
		this.rows = r;
		this.cols = c;
		this.mineCount = mineCount;
		this.createBoard();
		this.placeMines();
		this.calculateAdjacentMines();
	}

	/**
	 * Creates an empty board of size rows x cols.
	 */
	createBoard() {
		this.board = [];
		for (let i = 0; i < this.rows; i++) {
			this.board[i] = [];
			for (let j = 0; j < this.cols; j++) {
				this.board[i][j] = {
					isMine: false,
					isRevealed: false,
					isFlagged: false,
					adjacentMines: 0
				};
			}
		}
		this.gameOver = false; // Reset game state on new board
	}

	/**
	 * Randomly places mines on the board.
	 */
	placeMines() {
		let placedMines = 0;
		while (placedMines < this.mineCount) {
			const row = Math.floor(Math.random() * this.rows);
			const col = Math.floor(Math.random() * this.cols);
			if (!this.board[row][col].isMine) {
				this.board[row][col].isMine = true;
				placedMines++;
			}
		}
	}

	/**
	 * Calculates the number of adjacent mines for each cell.
	 */
	calculateAdjacentMines() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (this.board[i][j].isMine) continue;
				let count = 0;
				for (let x = -1; x <= 1; x++) {
					for (let y = -1; y <= 1; y++) {
						if (x === 0 && y === 0) continue;
						const newRow = i + x;
						const newCol = j + y;
						if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
							if (this.board[newRow][newCol].isMine) count++;
						}
					}
				}
				this.board[i][j].adjacentMines = count;
			}
		}
	}

	/**
	 * Reveals a cell and recursively reveals neighbors if needed.
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {Object} Result of the reveal: { mineHit: boolean, revealed: number }
	 */
	revealCell(row, col) {
		if (this.gameOver) return { mineHit: false, revealed: 0 };
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
			return { mineHit: false, revealed: 0 };
		}
		if (this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
			return { mineHit: false, revealed: 0 };
		}
		this.board[row][col].isRevealed = true;

		if (this.board[row][col].isMine) {
			this.gameOver = true;
			return { mineHit: true, revealed: 1 };
		}

		let revealed = 1;
		if (this.board[row][col].adjacentMines === 0) {
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					if (x === 0 && y === 0) continue;
					const result = this.revealCell(row + x, col + y);
					revealed += result.revealed;
				}
			}
		}
		return { mineHit: false, revealed };
	}

	/**
	 * Reveals the first cell, ensuring it's not a mine.
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {Object} Result of the reveal
	 */
	revealFirstCell(row, col) {
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
			return { mineHit: false, revealed: 0 };
		}
		if (this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
			return { mineHit: false, revealed: 0 };
		}
		while (this.board[row][col].isMine) {
			this.board[row][col].isMine = false;
			this.placeMines(1);
			this.calculateAdjacentMines();
		}
		return this.revealCell(row, col);
	}

	/**
	 * Flags or unflags a cell.
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {boolean} True if flagged, false if unflagged
	 */
	flagCell(row, col) {
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
			return false;
		}
		if (this.board[row][col].isRevealed) {
			return false;
		}
		this.board[row][col].isFlagged = !this.board[row][col].isFlagged;
		return this.board[row][col].isFlagged;
	}

	/**
	 * Returns a string representation of the board.
	 * @returns {string} Board as a string
	 */
	boardToString() {
		let output = "";
		for (let i = 0; i < this.rows; i++) {
			let rowStr = "";
			for (let j = 0; j < this.cols; j++) {
				if (this.board[i][j].isRevealed) {
					if (this.board[i][j].isMine) {
						rowStr += "* ";
					} else {
						rowStr += this.board[i][j].adjacentMines + " ";
					}
				} else if (this.board[i][j].isFlagged) {
					rowStr += "F ";
				} else {
					rowStr += ". ";
				}
			}
			output += rowStr.trim() + "\n";
		}
		return output.trim();
	}

	/**
	 * Prints the board to the console.
	 */
	printBoard() {
		console.log(this.boardToString());
	}

	/**
	 * Returns the cell object at the given position.
	 * @param {number} row
	 * @param {number} col
	 * @returns {Object|null} Cell object or null if out of bounds
	 */
	getCell(row, col) {
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
		return this.board[row][col];
	}

	/**
	 * Returns the number of remaining (unflagged) mines.
	 * @returns {number}
	 */
	getRemainingMines() {
		let flagged = 0;
		let totalMines = 0;
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (this.board[i][j].isMine) totalMines++;
				if (this.board[i][j].isFlagged) flagged++;
			}
		}
		return Math.max(0, totalMines - flagged);
	}
	/** @returns {Array<Array<Object>>} The board state */
	getBoard() {
		return this.board;
	}
	/** @returns {{rows: number, cols: number}} The board size */
	getSize() {
		return { rows: this.rows, cols: this.cols };
	}
	isGameOver() {
		return this.gameOver;
	}
}

export default Minesweeper;
