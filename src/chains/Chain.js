class Chain {
	constructor(debugMode = false) {
		this.cells = [];
		this.hiddenNeighbors = [];
		this.debugMode = debugMode;
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

	expand(minesweeper, visited) {
		const DIRS = [
			[0, 1], // right
			[1, 0], // down
			[0, -1], // left
			[-1, 0], // up
			[-1, -1], // top-left
			[-1, 1], // top-right
			[1, -1], // bottom-left
			[1, 1], // bottom-right
			[2, 0], // two right
			[0, 2], // two down
			[-2, 0], // two left
			[0, -2], // two up
			[-1, -2], // top-left two
			[-1, 2], // top-right two
			[1, -2], // bottom-left two
			[1, 2], // bottom-right two
			[2, -1], // two right down
			[2, 1], // two right up
			[-2, -1], // two left down
			[-2, 1], // two left up
			[2, -2], // two right two down
			[2, 2], // two right two up
			[-2, -2], // two left two down
			[-2, 2] // two left two up
		];

		const ordered_stack = [
			[...this.cells], // Start with the current cells (and all lateral ones)
			[], // Diagonal neighbors
			[], // Two cells away (bilateral)
			[], // Two cells away (lateral and diagonal)
			[] // Two cells away (bidiagonal)
		];

		const isClueCell = (cell) => {
			return cell.isRevealed && cell.adjacentMines > 0;
		};

		const getStackIndex = (dx, dy) => {
			// 0: lateral, 1: diagonal, 2: bilateral, 3: lateral and diagonal, 4: bidiagonal
			if ((Math.abs(dx) === 1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1)) {
				return 0; // lateral
			}
			if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
				return 1; // diagonal
			}
			if ((Math.abs(dx) === 2 && dy === 0) || (dx === 0 && Math.abs(dy) === 2)) {
				return 2; // bilateral
			}
			if ((Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1)) {
				return 3; // lateral and diagonal
			}
			if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
				return 4; // bidiagonal
			}
			return -1;
		};

		const addNeighbors = (cell) => {
			for (const [dx, dy] of DIRS) {
				// Calculate the neighbor's position
				const ni = cell.row + dx;
				const nj = cell.col + dy;

				// Check if the neighbor is within bounds
				if (ni < 0 || ni >= minesweeper.rows || nj < 0 || nj >= minesweeper.cols) {
					continue;
				}

				// Get the neighbor cell
				const neighbor = minesweeper.getCell(ni, nj);

				// If the neighbor is already visited skip it
				if (visited[ni][nj]) {
					continue;
				}

				const getHiddenAround = (r, c) => {
					let hidden = [];
					for (let x = -1; x <= 1; x++) {
						for (let y = -1; y <= 1; y++) {
							if (x === 0 && y === 0) continue;
							const ni = r + x;
							const nj = c + y;
							if (ni >= 0 && ni < minesweeper.rows && nj >= 0 && nj < minesweeper.cols) {
								const n = minesweeper.getCell(ni, nj);
								if (!n.isRevealed) hidden.push(n);
							}
						}
					}
					return hidden;
				};

				// Check all the hidden neighbours of the current cell and of the neighbour to see if they have any amount in common, else skip it
				const currentHidden = getHiddenAround(cell.row, cell.col);

				const neighborHidden = getHiddenAround(ni, nj);

				let skip = true;
				for (const hiddenCell of currentHidden) {
					for (const nHiddenCell of neighborHidden) {
						if (hiddenCell === nHiddenCell) {
							skip = false;
							break;
						}
					}
					if (skip) {
						continue;
					}
				}
				if (skip) {
					continue;
				}

				if (isClueCell(neighbor)) {
					const stackIndex = getStackIndex(dx, dy);
					if (stackIndex === -1) {
						if (this.debugMode) {
							console.log(`Failing into queue ${stackIndex} for cell at (${ni}, ${nj}) with direction (${dx}, ${dy})`);
						}
						continue;
					}
					ordered_stack[stackIndex].push(neighbor);
					this.addCell(neighbor);
					visited[ni][nj] = true;
				}
			}
		};

		while (true) {
			let processed = false;
			for (let i = 0; i < ordered_stack.length; i++) {
				if (ordered_stack[i].length > 0) {
					const cell = ordered_stack[i].pop();
					addNeighbors(cell);
					processed = true;
					break;
				}
			}
			if (!processed) break; // All stacks are empty
		}

		this.getHiddenNeighbors(minesweeper);
	}

	print(minesweeper) {
		this.cells.forEach(({ row, col }) => {
			const cell = minesweeper.getCell(row, col);
			console.log(`Row: ${row}, Col: ${col}, Adjacent Mines: ${cell.adjacentMines}`);
		});
		console.log("Hidden neighbors:", this.hiddenNeighbors);
	}
}

export default Chain;
