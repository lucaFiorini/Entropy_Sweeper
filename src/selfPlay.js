/** @format */

import { Minesweeper, Cell } from "./minesweeper.js";

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
	_getAdjacentCells(row, col) {
		let size = this.ms.getSize();
		let adjacentCells = [];
		for (let i = Math.max(row - 1 , 0); i < size.rows && i <= row + 1; i++) {
			for (let j = Math.max(col - 1 , 0); j < size.cols && j <= col + 1; j++) {
				if (i != row || j != col) {
					adjacentCells.push(this.ms.getCell(i, j));
				}
			}
		}
		return adjacentCells;
	}

	/**
	 * Computes the best next possible move
	 * @returns {{number}row,{number}col}
	 */
	nextMove() {
		let size = this.ms.getSize();
		let retval = undefined;

		for (let col = 0; col < size.cols; col++) {
			for (let row = 0; row < size.rows; row++) {
		
				let cell = this.ms.getCell(row, col);
				if (cell.isRevealed && cell.adjacentMines > 0) {

					let adjacents = this._getAdjacentCells(row, col);
					let unknown_adjacents = 0;
					let known_bomb_adjacents = 0;
					
					adjacents.forEach((adjacent) => {
						if (adjacent.isHidden) unknown_adjacents++;
						else if (adjacent.isFlagged) known_bomb_adjacents++;
					});

					if (
						cell.adjacentMines == unknown_adjacents + known_bomb_adjacents
					) {
						adjacents.forEach((adjacent) => {
							if (!adjacent.isFlagged){
								this.ms.flagCell(adjacent.row, adjacent.col);
							}
						});
					} else if (retval === undefined && cell.adjacentMines == known_bomb_adjacents) {

						retval = undefined;
						adjacents.every((adjacent) => 
							{
								if (
									!adjacent.isFlagged &&
									!adjacent.isRevealed
								) {
									retval = {row: adjacent.row,col: adjacent.col}
									return false;
								} else return true;
							}
						)
					}
				}
			}
		}
		return retval;
	}
	
}

export default SelfPlay;
