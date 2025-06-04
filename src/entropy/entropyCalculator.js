/** @format */

import Minesweeper from "../minesweeper.js";
import solveChainWithSAT from "../sat/solveChainWithSAT.js";
import Chain from "../chains/Chain.js";

class EntropyCalculator {
	entropy = 0;
	minesweeper = null;
	chains = [];

	constructor(minesweeper, log = false) {
		if (!(minesweeper instanceof Minesweeper)) {
			throw new Error("Invalid Minesweeper instance provided");
		}
		this.minesweeper = minesweeper;
		this.entropy = 0;
	}

	calculateEntropy() {
		this.calculateChains();
		if (this.log) this.printChains();
		this.entropy = 0;

		this.chains.forEach((chain, index) => {
			const { count: validCount, solutions } = solveChainWithSAT(chain, this.minesweeper);
			const hiddenTileCount = chain.getHiddenNeighbors(this.minesweeper).length;
			const entropy = validCount > 0 ? Math.log2(validCount) : 0;
			if (this.log) {
				console.log(`Chain ${index + 1}:`);
				console.log(`  Hidden tiles: ${hiddenTileCount}`);
				console.log(`  Valid configurations: ${validCount}`);
				console.log(`  Entropy (bits): ${entropy.toFixed(4)}`);
			}
			this.entropy += entropy;
		});

		if (this.log) console.log(`\nTotal Entropy: ${this.entropy.toFixed(4)} bits`);
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
		let visited = Array.from({ length: this.minesweeper.rows }, () => Array(this.minesweeper.cols).fill(false));

		const isClueCell = (cell) => cell.isRevealed && cell.adjacentMines > 0;

		const findChainEdge = () => {
			// Find an element of the chain
			const edgeCandidate = {
				cell: this.minesweeper
					.getBoard()
					.flat()
					.find((cell) => !visited[cell.row][cell.col] && isClueCell(cell)),
				neighbours: []
			};

			// If no element found, return null
			if (!edgeCandidate.cell) return null;

			// After finding an element, follow it's neighbours to find an edge
			let queue = [edgeCandidate.cell];

			while (queue.length > 0) {
				const currentCell = queue.shift();

				visited[currentCell.row][currentCell.col] = true;

				let neighbors = [];

				for (const [dx, dy] of [
					[0, 1], // right
					[1, 0], // down
					[0, -1], // left
					[-1, 0] // up
				]) {
					const newRow = currentCell.row + dx;
					const newCol = currentCell.col + dy;

					// Check if the new row and column are within bounds
					if (newRow < 0 || newRow >= this.minesweeper.rows || newCol < 0 || newCol >= this.minesweeper.cols) {
						continue;
					}

					// Get the neighbor cell
					const neighborCell = this.minesweeper.getCell(newRow, newCol);

					// Skip the neighbor if it's not a clue cell
					if (!isClueCell(neighborCell)) {
						continue;
					}

					// Add the neighbor cell to the neighbors array
					neighbors.push(neighborCell);

					// If the neighbor cell is not visited add it to the queue
					if (!visited[newRow][newCol]) {
						queue.push(neighborCell);
					}
				}

				// If the element is the first one, we need to update it
				if (edgeCandidate.cell === currentCell) {
					edgeCandidate.neighbours = neighbors;
				}

				// Check for the number of neighbours and update the element if the new cell has less neighbours (but more than 0)
				if (neighbors.length < edgeCandidate.neighbours.length && neighbors.length > 0) {
					edgeCandidate.cell = currentCell;
					edgeCandidate.neighbours = neighbors;
				}
			}

			// Return the clue cell with the fewest clue neighbors (likely edge of chain)
			return edgeCandidate.cell;
		};

		while (true) {
			const oldVisited = visited.map((row) => row.slice()); // Create a deep copy of visited
			const edge = findChainEdge();
			if (!edge) break;

			const chain = new Chain(true);
			chain.addCell(edge);
			this.chains.push(chain);
			chain.expand(this.minesweeper, oldVisited);

			visited = Array.from({ length: this.minesweeper.rows }, () => Array(this.minesweeper.cols).fill(false));

			for (const ch of this.chains) {
				for (const cell of ch.getCells()) {
					visited[cell.row][cell.col] = true;
				}
			}
		}
	}
}

export default EntropyCalculator;
