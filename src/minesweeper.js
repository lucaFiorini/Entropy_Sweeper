/** @format */

class Cell {
	row = 0;
	col = 0;
	isMine = false;
	isRevealed = false;
	isFlagged = false;
	adjacentMines = 0;
	adjacentCells = 8;

	constructor(row, col, isMine = false, isRevealed = false, isFlagged = false, adjacentMines = 0, adjacentCells = 8) {
		this.row = row;
		this.col = col;
		this.isMine = isMine;
		this.isRevealed = isRevealed;
		this.isFlagged = isFlagged;
		this.adjacentMines = adjacentMines;
		this.adjacentCells = adjacentCells;
	}

	toString() {
		if (this.isRevealed) {
			return this.isMine ? "*" : this.adjacentMines.toString();
		} else if (this.isFlagged) {
			return "F";
		} else {
			return ".";
		}
	}

	get isEmpty() {
		return !this.isMine && !this.isRevealed && !this.isFlagged;
	}
	get isHidden() {
		return !this.isRevealed && !this.isFlagged;
	}
	get isVisible() {
		return this.isRevealed || this.isFlagged;
	}
	get isExploded() {
		return this.isRevealed && this.isMine;
	}
}

class Minesweeper {
	board = [];
	rows = 0;
	cols = 0;
	mineCount = 0;
	isFirstCellRevealed = true;
	gameOver = false;
	won = false;

	constructor(r, c, mineCount) {
		if (!Number.isInteger(r) || !Number.isInteger(c) || !Number.isInteger(mineCount) || r <= 0 || c <= 0 || mineCount < 0 || mineCount >= r * c) {
			throw new Error("Invalid board size or mine count");
		}
		this.rows = r;
		this.cols = c;
		this.mineCount = mineCount;
		this.#createBoard();
		this.#placeMines();
		this.#calculateAdjacentMines();
	}

	#createBoard() {
		this.board = [];
		for (let i = 0; i < this.rows; i++) {
			this.board[i] = [];
			for (let j = 0; j < this.cols; j++) {
				this.board[i][j] = new Cell(i, j);
			}
		}
		this.gameOver = false;
	}

	#placeMines() {
		let placedMines = 0;
		while (placedMines < this.mineCount) {
			const row = Math.floor(Math.random() * this.rows);
			const col = Math.floor(Math.random() * this.cols);
			const cell = this.board[row][col];
			if (!cell.isMine) {
				cell.isMine = true;
				placedMines++;
			}
		}
	}

	#calculateAdjacentMines() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const cell = this.board[i][j];
				if (cell.isMine) continue;
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
				cell.adjacentMines = count;
			}
		}
	}

	revealCell(row, col) {
		if (this.won || this.gameOver) return { mineHit: false, revealed: 0 };
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
			return { mineHit: false, revealed: 0 };
		}
		const cell = this.board[row][col];
		if (cell.isRevealed || cell.isFlagged) {
			return { mineHit: false, revealed: 0 };
		}
		if (this.isFirstCellRevealed) {
			this.isFirstCellRevealed = false;
			while (cell.isMine) {
				cell.isMine = false;
				this.#placeMines(1);
				this.#calculateAdjacentMines();
			}
		}

		this.board[row][col].isRevealed = true;

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if (x === 0 && y === 0) continue;
				const newRow = row + x;
				const newCol = col + y;
				if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
					this.board[newRow][newCol].adjacentCells--;
				}
			}
		}

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

		if (this.getRemainingMines() <= 0) {
			this.won = true;
		}

		return { mineHit: false, revealed };
	}

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

	printBoard() {
		console.log(this.boardToString());
	}

	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns {boolean}
	 */
	flagCell(row, col) {
		if (this.gameOver) return false;
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
			return false;
		}
		const cell = this.board[row][col];
		if (cell.isRevealed) return false;
		cell.isFlagged = !cell.isFlagged;
		if (cell.isFlagged) {
			if (this.getRemainingMines() <= 0) {
				this.won = true;
			}
		}
	}

	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns {Cell}
	 */
	getCell(row, col) {
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
		return this.board[row][col];
	}

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

	getBoard() {
		return this.board;
	}

	getSize() {
		return { rows: this.rows, cols: this.cols };
	}
}

export default Minesweeper;
export { Cell, Minesweeper };
