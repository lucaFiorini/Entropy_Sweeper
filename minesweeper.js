/**
 * @module Minesweeper
 * Encapsulates the logic for a Minesweeper game.
 */
const Minesweeper = (() => {
    /** @type {Array<Array<Object>>} The game board */
    let board = [];
    /** @type {number} Number of rows */
    let rows = 0;
    /** @type {number} Number of columns */
    let cols = 0;
    /** @type {boolean} Game over state */
    let gameOver = false;

    /**
     * Creates an empty board of size rows x cols.
     * @param {number} r - Number of rows
     * @param {number} c - Number of columns
     */
    function createBoard(r, c) {
        rows = r;
        cols = c;
        board = [];
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < cols; j++) {
                board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0
                };
            }
        }
        gameOver = false; // Reset game state on new board
    }

    /**
     * Randomly places mines on the board.
     * @param {number} mineCount - Number of mines to place
     */
    function placeMines(mineCount) {
        let placedMines = 0;
        while (placedMines < mineCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (!board[row][col].isMine) {
                board[row][col].isMine = true;
                placedMines++;
            }
        }
    }

    /**
     * Calculates the number of adjacent mines for each cell.
     */
    function calculateAdjacentMines() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j].isMine) continue;
                let count = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) continue;
                        const newRow = i + x;
                        const newCol = j + y;
                        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                            if (board[newRow][newCol].isMine) count++;
                        }
                    }
                }
                board[i][j].adjacentMines = count;
            }
        }
    }

    /**
     * Reveals a cell and recursively reveals neighbors if needed.
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object} Result of the reveal: { mineHit: boolean, revealed: number }
     */
    function revealCell(row, col) {
        if (gameOver) return { mineHit: false, revealed: 0 };
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return { mineHit: false, revealed: 0 };
        }
        if (board[row][col].isRevealed || board[row][col].isFlagged) {
            return { mineHit: false, revealed: 0 };
        }
        board[row][col].isRevealed = true;

        if (board[row][col].isMine) {
            gameOver = true;
            return { mineHit: true, revealed: 1 };
        }

        let revealed = 1;
        if (board[row][col].adjacentMines === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    const result = revealCell(row + x, col + y);
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
    function revealFirstCell(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return { mineHit: false, revealed: 0 };
        }
        if (board[row][col].isRevealed || board[row][col].isFlagged) {
            return { mineHit: false, revealed: 0 };
        }
        while (board[row][col].isMine) {
            board[row][col].isMine = false;
            placeMines(1);
            calculateAdjacentMines();
        }
        return revealCell(row, col);
    }

    /**
     * Flags or unflags a cell.
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if flagged, false if unflagged
     */
    function flagCell(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return false;
        }
        if (board[row][col].isRevealed) {
            return false;
        }
        board[row][col].isFlagged = !board[row][col].isFlagged;
        return board[row][col].isFlagged;
    }

    /**
     * Returns a string representation of the board.
     * @returns {string} Board as a string
     */
    function boardToString() {
        let output = '';
        for (let i = 0; i < rows; i++) {
            let rowStr = '';
            for (let j = 0; j < cols; j++) {
                if (board[i][j].isRevealed) {
                    if (board[i][j].isMine) {
                        rowStr += '* ';
                    } else {
                        rowStr += board[i][j].adjacentMines + ' ';
                    }
                } else if (board[i][j].isFlagged) {
                    rowStr += 'F ';
                } else {
                    rowStr += '. ';
                }
            }
            output += rowStr.trim() + '\n';
        }
        return output.trim();
    }

    /**
     * Prints the board to the console.
     */
    function printBoard() {
        console.log(boardToString());
    }

    /**
     * Returns the cell object at the given position.
     * @param {number} row
     * @param {number} col
     * @returns {Object|null} Cell object or null if out of bounds
     */
    function getCell(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
        return board[row][col];
    }

    /**
     * Returns the number of remaining (unflagged) mines.
     * @returns {number}
     */
    function getRemainingMines() {
        let flagged = 0;
        let totalMines = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j].isMine) totalMines++;
                if (board[i][j].isFlagged) flagged++;
            }
        }
        return Math.max(0, totalMines - flagged);
    }

    // Public API
    return {
        /**
         * Initializes the board.
         * @param {number} r - Number of rows
         * @param {number} c - Number of columns
         * @param {number} mineCount - Number of mines
         */
        init: (r, c, mineCount) => {
            if (!Number.isInteger(r) || !Number.isInteger(c) || !Number.isInteger(mineCount) ||
                r <= 0 || c <= 0 || mineCount < 0 || mineCount >= r * c) {
                throw new Error("Invalid board size or mine count");
            }
            createBoard(r, c);
            placeMines(mineCount);
            calculateAdjacentMines();
        },
        revealCell,
        revealFirstCell,
        flagCell,
        printBoard,
        boardToString,
        /** @returns {Array<Array<Object>>} The board state */
        getBoard: () => board,
        /** @returns {{rows: number, cols: number}} The board size */
        getSize: () => ({ rows, cols }),
        isGameOver: () => gameOver,
        getCell,
        getRemainingMines,
    };
})();

module.exports = Minesweeper;