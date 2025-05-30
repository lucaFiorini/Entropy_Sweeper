const entropyCalculator = (minesweeper) => {
	if (!minesweeper || !minesweeper?.board) {
		throw new Error("Invalid Minesweeper instance");
	}
	const revealedCells = minesweeper.board.flat().filter((cell) => cell.isRevealed);
	const totalCells = minesweeper.board.flat().length;
	const entropy = (-revealedCells.length / totalCells) * Math.log2(revealedCells.length / totalCells);
	return entropy;
};

export default entropyCalculator;
