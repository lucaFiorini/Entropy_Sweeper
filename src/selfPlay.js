import { Minesweeper } from "./minesweeper.js";
import EntropyCalculator from "./entropy/entropyCalculator.js";
import solveChainWithSAT from "./sat/solveChainWithSAT.js";

class SelfPlay {
	ms;
	/**
	 *
	 * @param {Minesweeper} minesweeper
	 */
	constructor(minesweeper, log = false) {
		if ((!minesweeper) instanceof Minesweeper) {
			throw new Error("Invalid Minesweeper instance provided");
		}
		this.ms = minesweeper;
		this.log = log;
	}

	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns {Cell[]}
	 */
	_getAdjacentCells(row, col) {
		let size = this.ms.getSize();
		let adjacentCells = [];
		for (let i = Math.max(row - 1, 0); i < size.rows && i <= row + 1; i++) {
			for (let j = Math.max(col - 1, 0); j < size.cols && j <= col + 1; j++) {
				if (i != row || j != col) {
					adjacentCells.push(this.ms.getCell(i, j));
				}
			}
		}
		return adjacentCells;
	}

	/**
	 * Computes the best next possible move
	 * @returns {{number}row,{number}col}
	 */
	nextMove() {
		let size = this.ms.getSize();
		let retval = undefined;

		for (let col = 0; col < size.cols; col++) {
			for (let row = 0; row < size.rows; row++) {
				let cell = this.ms.getCell(row, col);
				if (cell.isRevealed && cell.adjacentMines > 0) {
					let adjacents = this._getAdjacentCells(row, col);
					let unknown_adjacents = 0;
					let known_bomb_adjacents = 0;

					adjacents.forEach((adjacent) => {
						if (adjacent.isHidden) unknown_adjacents++;
						else if (adjacent.isFlagged) known_bomb_adjacents++;
					});

					if (cell.adjacentMines == unknown_adjacents + known_bomb_adjacents) {
						adjacents.forEach((adjacent) => {
							if (!adjacent.isFlagged) {
								this.ms.flagCell(adjacent.row, adjacent.col);
							}
						});
					} else if (retval === undefined && cell.adjacentMines == known_bomb_adjacents) {
						retval = undefined;
						adjacents.every((adjacent) => {
							if (!adjacent.isFlagged && !adjacent.isRevealed) {
								retval = {
									row: adjacent.row,
									col: adjacent.col
								};
								return false;
							} else return true;
						});
					}
				}
			}
		}
		if (retval !== undefined) {
			return retval;
		}
		// begin probabilistic solving
		// If no deterministic move was found, we will use the entropy calculator to find the best next move
		let calculator = new EntropyCalculator(this.ms);
		calculator.calculateChains();

		let probabilityMap = this.ms.board;

		//get number of known cells
		let knownCount = 0;
		for (let row = 0; row < size.rows; row++) {
			for (let col = 0; col < size.cols; col++) {
				if (probabilityMap[row][col].isRevealed || probabilityMap[row][col].isFlagged) {
					knownCount++;
				}
			}
		}
		// Calculate probabilities for each chain (solveChainWithSAT returns all possible solutions for the chain) it does not return probabilities
		let solutions = [];
		for (let chain of calculator.chains) {
			solutions.push(...solveChainWithSAT(chain, this.ms).solutions);
		}
		let exploredCells = Array.from({ length: size.rows }, () => Array.from({ length: size.cols }, () => ({ timesVisited: 0, timesBomb: 0 })));
		for (let solution of solutions) {
			for (let key in solution) {
				const [row, col] = key.split(",").map(Number);
				exploredCells[row][col].timesVisited += 1;
				exploredCells[row][col].timesBomb += solution[key] ? 1 : 0;
			}
		}

		//get number of mines left
		let remainingMines = this.ms.getRemainingMines();
		let defaultProbability = remainingMines / (size.rows * size.cols - knownCount);

		// Calculate the probability for each cell based on the number of times it was visited and the number of times it was a bomb
		for (let row = 0; row < size.rows; row++) {
			for (let col = 0; col < size.cols; col++) {
				if (exploredCells[row][col].timesVisited > 0) {
					let prob = exploredCells[row][col].timesBomb / exploredCells[row][col].timesVisited;
					probabilityMap[row][col].probability = prob;
					if (prob == 1) {
						//flag the cell if it is a bomb
						this.ms.flagCell(row, col);
					}
				} else if (probabilityMap[row][col].isRevealed) {
					probabilityMap[row][col].probability = 0; // If the cell is revealed, it cannot be a bomb
				} else if (probabilityMap[row][col].isFlagged) {
					probabilityMap[row][col].probability = 1; // If the cell is flagged, it is a bomb
				} else {
					probabilityMap[row][col].probability = defaultProbability; // If not visited, use default probability
				}
			}
		}

		//pretty ptine the probability map
		if (this.log) {
			console.log("Probability Map:");
			for (let row = 0; row < size.rows; row++) {
				let rowStr = "";
				for (let col = 0; col < size.cols; col++) {
					let cell = probabilityMap[row][col];
					rowStr += cell.probability.toFixed(2) + " ";
				}
				console.log(rowStr);
			}
		}

		// Find the cells with the lowest probability that are not revealed or flagged
		// If multiple cells have the same lowest probability, return the one closest to the center
		let minProbability = Infinity;
		let bsetCells = [];
		for (let row = 0; row < size.rows; row++) {
			for (let col = 0; col < size.cols; col++) {
				let cell = probabilityMap[row][col];
				if (!cell.isRevealed && !cell.isFlagged && cell.probability < minProbability) {
					minProbability = cell.probability;
					bsetCells = [{ row: row, col: col }];
				} else if (!cell.isRevealed && !cell.isFlagged && cell.probability === minProbability) {
					bsetCells.push({ row: row, col: col });
				}
			}
		}
		if (bsetCells.length > 0) {
			let centerRow = Math.floor(size.rows / 2);
			let centerCol = Math.floor(size.cols / 2);
			let closestCell = null;
			let closestDistance = Infinity;
			for (let cell of bsetCells) {
				let distance = Math.sqrt(Math.pow(cell.row - centerRow, 2) + Math.pow(cell.col - centerCol, 2));
				if (distance < closestDistance) {
					closestDistance = distance;
					closestCell = cell;
				}
			}
			return closestCell; // Return the cell with the lowest probability closest to the center
		}

		// If no cell was found, return the closest cell to the center
		if (retval === undefined) {
			let centerRow = Math.floor(size.rows / 2);
			let centerCol = Math.floor(size.cols / 2);
			let closestCell = null;
			let closestDistance = Infinity;
			for (let row = 0; row < size.rows; row++) {
				for (let col = 0; col < size.cols; col++) {
					let cell = this.ms.getCell(row, col);
					if (!cell.isRevealed && !cell.isFlagged) {
						let distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
						if (distance < closestDistance) {
							closestDistance = distance;
							closestCell = { row: row, col: col };
						}
					}
				}
			}
			if (closestCell) {
				return closestCell;
			} else {
				return undefined; // No valid move found
			}
		}
	}
}

export default SelfPlay;
