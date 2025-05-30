/** @format */

import Minesweeper from "./minesweeper.js";
import solver from "logic-solver";

class Chain {
	constructor() {
		this.cells = []; // Array of {row, col}
		this.hiddenNeighbors = []; // Array of [row, col]
	}

	addCell(cell) {
		if (!this.cells.some((c) => c.row === cell.row && c.col === cell.col)) {
			this.cells.push(cell);
		}
	}

	getCells() {
		return this.cells;
	}

	setHiddenNeighbors(hiddenArr) {
		this.hiddenNeighbors = hiddenArr;
	}

	getHiddenNeighbors(minesweeper) {
		// If already set, return cached version
		if (this.hiddenNeighbors && this.hiddenNeighbors.length > 0) {
			return this.hiddenNeighbors;
		}
		const hidden = new Set();
		for (const { row, col } of this.cells) {
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					const ni = row + dx,
						nj = col + dy;
					if (ni >= 0 && ni < minesweeper.rows && nj >= 0 && nj < minesweeper.cols) {
						const neighbor = minesweeper.getCell(ni, nj);
						if (!neighbor.isRevealed && !neighbor.isFlagged) {
							hidden.add(`${ni},${nj}`);
						}
					}
				}
			}
		}
		this.hiddenNeighbors = Array.from(hidden).map((str) => str.split(",").map(Number));
		return this.hiddenNeighbors;
	}

	print(minesweeper) {
		this.cells.forEach(({ row, col }) => {
			const cell = minesweeper.getCell(row, col);
			console.log(`Row: ${row}, Col: ${col}, Adjacent Mines: ${cell.adjacentMines}`);
		});
		console.log("Hidden neighbors:", this.hiddenNeighbors);
	}
}

function countValidStates(chain, minesweeper) {
	const hiddenTiles = chain.getHiddenNeighbors(minesweeper); // [ [r, c], ... ]
	const clueCells = chain.getCells();
	const totalConfigs = 1 << hiddenTiles.length;
	let validCount = 0;

	for (let config = 0; config < totalConfigs; config++) {
		const mineMap = new Map(); // "row,col" => true/false
		hiddenTiles.forEach(([r, c], idx) => {
			const isMine = (config & (1 << idx)) !== 0;
			mineMap.set(`${r},${c}`, isMine);
		});

		let isValid = true;
		for (const { row, col } of clueCells) {
			let count = 0;
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					const ni = row + dx,
						nj = col + dy;
					const key = `${ni},${nj}`;
					if (mineMap.get(key)) count++;
				}
			}
			const clue = minesweeper.getCell(row, col);
			if (count !== clue.adjacentMines) {
				isValid = false;
				break;
			}
		}
		if (isValid) validCount++;
	}

	return {
		validCount,
		entropy: validCount > 0 ? Math.log2(validCount) : 0,
		hiddenTileCount: hiddenTiles.length
	};
}

class entropyCalculator {
	entropy = 0;
	minesweeper = null;
	chains = [];

	constructor(minesweeper) {
		if (!(minesweeper instanceof Minesweeper)) {
			throw new Error("Invalid Minesweeper instance provided");
		}
		this.minesweeper = minesweeper;
		this.entropy = 0;
	}

	calculateChains() {
		this.chains = [];
		const visited = Array.from({ length: this.minesweeper.rows }, () => Array(this.minesweeper.cols).fill(false));

		const isClueCell = (cell) => cell.isRevealed && cell.adjacentMines > 0;

		const getHiddenNeighbors = (ci, cj) => {
			const hidden = [];
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					const ni = ci + dx,
						nj = cj + dy;
					if (ni >= 0 && ni < this.minesweeper.rows && nj >= 0 && nj < this.minesweeper.cols) {
						const neighbor = this.minesweeper.getCell(ni, nj);
						if (!neighbor.isRevealed && !neighbor.isFlagged) {
							hidden.push([ni, nj]);
						}
					}
				}
			}
			return hidden;
		};

		const addClueNeighborsToQueue = (hiddenNeighbors, queue, visited, orderMap) => {
			for (const [hi, hj] of hiddenNeighbors) {
				for (let dx = -1; dx <= 1; dx++) {
					for (let dy = -1; dy <= 1; dy++) {
						if (dx === 0 && dy === 0) continue;
						const ci2 = hi + dx,
							cj2 = hj + dy;
						if (
							ci2 >= 0 &&
							ci2 < this.minesweeper.rows &&
							cj2 >= 0 &&
							cj2 < this.minesweeper.cols &&
							!visited[ci2][cj2]
						) {
							const clueNeighbor = this.minesweeper.getCell(ci2, cj2);
							if (isClueCell(clueNeighbor)) {
								queue.push([ci2, cj2]);
								visited[ci2][cj2] = true;
								if (!orderMap.has(`${ci2},${cj2}`)) {
									orderMap.set(`${ci2},${cj2}`, orderMap.size);
								}
							}
						}
					}
				}
			}
		};

		const isEdgeClueCell = (i, j) => {
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					const ni = i + dx,
						nj = j + dy;
					if (ni < 0 || ni >= this.minesweeper.rows || nj < 0 || nj >= this.minesweeper.cols) return true;

					const neighbor = this.minesweeper.getCell(ni, nj);
					if (!neighbor.isRevealed || neighbor.adjacentMines === 0) {
						return true;
					}
				}
			}
			return false;
		};

		for (let i = 0; i < this.minesweeper.rows; i++) {
			for (let j = 0; j < this.minesweeper.cols; j++) {
				const cell = this.minesweeper.getCell(i, j);
				if (isClueCell(cell) && !visited[i][j]) {
					const chainCells = [];
					const queue = [[i, j]];
					const orderMap = new Map();
					visited[i][j] = true;
					orderMap.set(`${i},${j}`, 0);

					while (queue.length > 0) {
						// Prefer adjacent cells to the last added cell, with lateral (N/S/E/W) closer than diagonal
						let nextIdx = 0;
						if (chainCells.length > 0) {
							const last = chainCells[chainCells.length - 1];
							// Find all lateral neighbors in the queue
							const lateralIdx = queue.findIndex(
								([qi, qj]) =>
									(qi === last.row && Math.abs(qj - last.col) === 1) ||
									(qj === last.col && Math.abs(qi - last.row) === 1)
							);
							if (lateralIdx !== -1) {
								nextIdx = lateralIdx;
							} else {
								// If no lateral, prefer any diagonal neighbor
								const diagonalIdx = queue.findIndex(
									([qi, qj]) => Math.abs(qi - last.row) === 1 && Math.abs(qj - last.col) === 1
								);
								if (diagonalIdx !== -1) {
									nextIdx = diagonalIdx;
								} else {
									nextIdx = 0;
								}
							}
						}
						const [ci, cj] = queue.splice(nextIdx, 1)[0];
						chainCells.push({ row: ci, col: cj });

						const hiddenNeighbors = getHiddenNeighbors(ci, cj);
						addClueNeighborsToQueue(hiddenNeighbors, queue, visited, orderMap);
					}

					let edgeIdx = chainCells.findIndex(({ row, col }) => isEdgeClueCell(row, col));
					if (edgeIdx > 0) {
						const edgeCell = chainCells.splice(edgeIdx, 1)[0];
						chainCells.unshift(edgeCell);
					}

					// No need to sort by orderMap anymore, as adjacency is preferred above
					if (chainCells.length > 0) {
						const chain = new Chain();
						chainCells.forEach((cell) => chain.addCell(cell));
						// Set hidden neighbors for this chain
						const hiddenSet = new Set();
						for (const { row, col } of chainCells) {
							for (let dx = -1; dx <= 1; dx++) {
								for (let dy = -1; dy <= 1; dy++) {
									if (dx === 0 && dy === 0) continue;
									const ni = row + dx,
										nj = col + dy;
									if (
										ni >= 0 &&
										ni < this.minesweeper.rows &&
										nj >= 0 &&
										nj < this.minesweeper.cols
									) {
										const neighbor = this.minesweeper.getCell(ni, nj);
										if (!neighbor.isRevealed && !neighbor.isFlagged) {
											hiddenSet.add(`${ni},${nj}`);
										}
									}
								}
							}
						}
						chain.setHiddenNeighbors(Array.from(hiddenSet).map((str) => str.split(",").map(Number)));
						this.chains.push(chain);
					}
				}
			}
		}
	}

	calculateEntropy() {
		this.calculateChains();
		this.entropy = 0;

		this.chains.forEach((chain, index) => {
			const { validCount, entropy, hiddenTileCount } = countValidStates(chain, this.minesweeper);
			console.log(`Chain ${index + 1}:`);
			console.log(`  Hidden tiles: ${hiddenTileCount}`);
			console.log(`  Valid configurations: ${validCount}`);
			console.log(`  Entropy (bits): ${entropy.toFixed(4)}`);
			this.entropy += entropy;
		});

		console.log(`\nTotal Entropy: ${this.entropy.toFixed(4)} bits`);
	}

	printChains() {
		if (this.chains.length === 0) {
			console.log("No chains found.");
			return;
		}

		this.chains.forEach((chain, index) => {
			console.log(`Chain ${index + 1}:`);
			chain.print(this.minesweeper);
		});
	}
}

function solveChainWithSAT(chain, minesweeper) {
	const hiddenTiles = chain.hiddenNeighbors; // [ [r, c], ... ]
	const clueCells = chain.getCells();

	// Map each hidden tile to a variable name
	const varNames = hiddenTiles.map(([r, c]) => `m_${r}_${c}`);

	const s = new solver.Solver();

	// For each clue cell, add a constraint
	for (const { row, col } of clueCells) {
		const clue = minesweeper.getCell(row, col);
		let flagged = 0;
		const vars = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				const ni = row + dx,
					nj = col + dy;
				if (ni >= 0 && ni < minesweeper.rows && nj >= 0 && nj < minesweeper.cols) {
					const neighbor = minesweeper.getCell(ni, nj);
					if (neighbor.isFlagged) flagged++;
					else if (!neighbor.isRevealed) {
						const idx = hiddenTiles.findIndex(([r, c]) => r === ni && c === nj);
						if (idx !== -1) vars.push(varNames[idx]);
					}
				}
			}
		}
		const minesNeeded = clue.adjacentMines - flagged;
		if (vars.length > 0) {
			s.require(solver.exactly(vars, minesNeeded));
		}
	}

	// Count solutions
	const solutions = s.solveAll(varNames);
	return {
		count: solutions.length,
		solutions // array of assignments, each is an object {varName: true/false, ...}
	};
}

export default entropyCalculator;
