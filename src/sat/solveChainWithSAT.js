import solver from "logic-solver";

function solveChainWithSAT(chain, minesweeper) {
	const hiddenTiles = chain.hiddenNeighbors;
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
				if (
					ni >= 0 &&
					ni < minesweeper.rows &&
					nj >= 0 &&
					nj < minesweeper.cols
				) {
					const neighbor = minesweeper.getCell(ni, nj);
					if (neighbor.isFlagged) flagged++;
					else if (!neighbor.isRevealed) {
						const idx = hiddenTiles.findIndex(
							([r, c]) => r === ni && c === nj
						);
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

export default solveChainWithSAT;
