// filepath: /Entropy_Sweeper/Entropy_Sweeper/src/entropy/entropyCalculator.js
/** @format */

import Minesweeper from "../minesweeper.js";
import countValidStates from "./countValidStates.js";
import Chain from "../chains/Chain.js";

class EntropyCalculator {
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

	calculateEntropy() {
		this.calculateChains();
		this.entropy = 0;

		this.chains.forEach((chain, index) => {
			const { validCount, entropy, hiddenTileCount } = countValidStates(
				chain,
				this.minesweeper
			);
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

	calculateChains() {
		this.chains = [];
		const visited = Array.from({ length: this.minesweeper.rows }, () =>
			Array(this.minesweeper.cols).fill(false)
		);

		const isClueCell = (cell) => cell.isRevealed && cell.adjacentMines > 0;

		const getHiddenNeighbors = (ci, cj) => {
			const hidden = [];
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					const ni = ci + dx;
					const nj = cj + dy;
					if (
						ni >= 0 &&
						ni < this.minesweeper.rows &&
						nj >= 0 &&
						nj < this.minesweeper.cols
					) {
						const neighbor = this.minesweeper.getCell(ni, nj);
						if (!neighbor.isRevealed && !neighbor.isFlagged) {
							hidden.push([ni, nj]);
						}
					}
				}
			}
			return hidden;
		};

		const buildGraphAndTraverse = (start, graph) => {
			const visitedNodes = new Set();
			const path = [];

			const dfs = (node) => {
				const key = `${node[0]},${node[1]}`;
				if (visitedNodes.has(key)) return;
				visitedNodes.add(key);
				path.push({ row: node[0], col: node[1] });

				let neighbors = graph.get(key) || [];
				for (const neighbor of neighbors) {
					dfs(neighbor);
				}
			};

			dfs(start);
			return path;
		};

		for (let i = 0; i < this.minesweeper.rows; i++) {
			for (let j = 0; j < this.minesweeper.cols; j++) {
				const cell = this.minesweeper.getCell(i, j);
				if (isClueCell(cell) && !visited[i][j]) {
					const graph = new Map();
					const queue = [[i, j]];
					visited[i][j] = true;

					while (queue.length > 0) {
						const [ci, cj] = queue.shift();
						const hiddenNeighbors = getHiddenNeighbors(ci, cj);

						for (const [hi, hj] of hiddenNeighbors) {
							for (let dx = -1; dx <= 1; dx++) {
								for (let dy = -1; dy <= 1; dy++) {
									if (dx === 0 && dy === 0) continue;
									const ni = hi + dx;
									const nj = hj + dy;
									if (
										ni >= 0 &&
										ni < this.minesweeper.rows &&
										nj >= 0 &&
										nj < this.minesweeper.cols
									) {
										const neighbor =
											this.minesweeper.getCell(ni, nj);
										if (isClueCell(neighbor)) {
											if (!graph.has(`${ci},${cj}`))
												graph.set(`${ci},${cj}`, []);
											graph
												.get(`${ci},${cj}`)
												.push([ni, nj]);
											if (!visited[ni][nj]) {
												queue.push([ni, nj]);
												visited[ni][nj] = true;
											}
										}
									}
								}
							}
						}
					}

					const startNode = [i, j];
					const chainCells = buildGraphAndTraverse(startNode, graph);

					if (chainCells.length > 0) {
						const chain = new Chain();
						chainCells.forEach((cell) => chain.addCell(cell));
						this.chains.push(chain);
					}
				}
			}
		}
	}
}

export default EntropyCalculator;
