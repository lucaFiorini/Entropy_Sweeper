function countValidStates(chain, minesweeper) {
	const hiddenTiles = chain.getHiddenNeighbors(minesweeper);
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

export default countValidStates;
