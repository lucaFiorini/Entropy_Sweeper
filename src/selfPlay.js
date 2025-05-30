/** @format */

import { Minesweeper, Cell } from "./minesweeper";

class SelfPlay {
	ms;
	/**
	 *
	 * @param {Minesweeper} minesweeper
	 */
	constructor(minesweeper) {
		if ((!minesweeper) instanceof Minesweeper) {
			throw new Error("Invalid Minesweeper instance provided");
		}
		this.ms = minesweeper;
	}

	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns {Cell[]}
	 */
	#_getAdjacentCells(row, col) {
		let size = this.ms.getSize();
		let adjacentCells = [];
		for (let row2 = row - 1; row2 < size.rows && row2 < row + 1; row2++) {
			for (let col2 = col - 1; col2 < size.cols && col2 < col + 1; col2++) {
				if (row2 != row && col2 != col) {
					adjacentCells.push(this.ms.getCell(row2, col2));
				}
			}
		}
		return adjacentCells;
	}

	/**
	 * Computes the best next possible move
	 */
	nextMove() {
		let size = this.ms.getSize();
		for (let col = 0; col < size.cols; col++) {
			for (let row = 0; row < size.rows; row++) {
				let cell = this.ms.getCell(col, row);
				if (cell.isRevealed() && cell.adjacentMines() == 0) {
					let adjacents = this.#_getAdjacentCells(row, col);
					let unknown_adjacents = 0;
					let known_bomb_adjacents = 0;
					adjacents.forEach((adjcent) => {
						if (adjcent.isHidden()) unknown_adjacents++;
						else if (adjcent.isFlagged()) known_bomb_adjacents++;
					});

					if (cell.adjacentMines() == unknown_adjacents + known_bomb_adjacents) {
						adjacents.forEach((adjcent) => {
							if (!adjcent.isFlagged()) this.ms.flagCell(adjcent.row, adjcent.col);
						});
					} else if (cell.adjacentMines() == known_bomb_adjacents) {
						if (
							!adjacents.every((adjacent) => {
								if (!adjacent.isFlagged() && !adjacent.isRevealed()) {
									this.ms.revealCell();
									return false;
								} else return true;
							})
						) {
							return;
						}
					}
				}
			}
		}
	}
}

export default SelfPlay;
