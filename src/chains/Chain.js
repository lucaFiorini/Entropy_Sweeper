class Chain {
	constructor() {
		this.cells = [];
		this.hiddenNeighbors = [];
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
					if (
						ni >= 0 &&
						ni < minesweeper.rows &&
						nj >= 0 &&
						nj < minesweeper.cols
					) {
						const neighbor = minesweeper.getCell(ni, nj);
						if (!neighbor.isRevealed && !neighbor.isFlagged) {
							hidden.add(`${ni},${nj}`);
						}
					}
				}
			}
		}
		this.hiddenNeighbors = Array.from(hidden).map((str) =>
			str.split(",").map(Number)
		);
		return this.hiddenNeighbors;
	}
}

export default Chain;
