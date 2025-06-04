import solver from "logic-solver";
import Chain from "../chains/Chain";
import Minesweeper from "../minesweeper";

function solveAllSolutions(solverInstance, varNames) {
	const solutions = [];

	while (true) {
		const solution = solverInstance.solve();
		if (!solution) break; // No more solutions

		const assignment = solution.getMap();
		solutions.push(assignment);

		// Block this exact assignment in the future
		const clause = [];
		for (const name of varNames) {
			const literal = assignment[name] ? solver.not(name) : name;
			clause.push(literal);
		}
		solverInstance.require(solver.or(clause)); // Correct way to forbid exact match
	}

	return solutions;
}

/**
 *
 * @param {Chain} chain
 * @param {Minesweeper} minesweeper
 * @returns {{number} count, {Array} solutions}
 */
function solveChainWithSAT(chain, minesweeper) {
	const hiddenTiles = chain.hiddenNeighbors;
	const clueCells = chain.getCells();

	// Map each hidden tile to a variable name
	const varNames = hiddenTiles.map(([r, c]) => `${r},${c}`);

	const s = new solver.Solver();

	// For each clue cell, add a constraint
	for (const { row, col } of clueCells) {
		const clue = minesweeper.getCell(row, col);
		let flagged = 0;
		const vars = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				const ni = row + dx;
				const nj = col + dy;
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
			const sum = solver.sum(vars);
			const target = solver.constantBits(minesNeeded);
			s.require(solver.equalBits(sum, target));
		}
	}

	// Count solutions
	const solutions = solveAllSolutions(s, varNames);
	return {
		count: solutions.length,
		solutions // array of assignments, each is an object {varName: true/false, ...}
	};
}

export default solveChainWithSAT;
