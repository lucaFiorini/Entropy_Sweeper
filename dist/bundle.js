(() => {
	"use strict";
	class e {
		row = 0;
		col = 0;
		isMine = !1;
		isRevealed = !1;
		isFlagged = !1;
		adjacentMines = 0;
		adjacentCells = 8;
		constructor(e, t, s = !1, i = !1, n = !1, o = 0, l = 8) {
			(this.row = e), (this.col = t), (this.isMine = s), (this.isRevealed = i), (this.isFlagged = n), (this.adjacentMines = o), (this.adjacentCells = l);
		}
		toString() {
			return this.isRevealed ? (this.isMine ? "*" : this.adjacentMines.toString()) : this.isFlagged ? "F" : ".";
		}
		get isEmpty() {
			return !this.isMine && !this.isRevealed && !this.isFlagged;
		}
		get isHidden() {
			return !this.isRevealed && !this.isFlagged;
		}
		get isVisible() {
			return this.isRevealed || this.isFlagged;
		}
		get isExploded() {
			return this.isRevealed && this.isMine;
		}
	}
	class t {
		board = [];
		rows = 0;
		cols = 0;
		mineCount = 0;
		isFirstCellRevealed = !0;
		gameOver = !1;
		won = !1;
		constructor(e, t, s) {
			if (!Number.isInteger(e) || !Number.isInteger(t) || !Number.isInteger(s) || e <= 0 || t <= 0 || s < 0 || s >= e * t) throw new Error("Invalid board size or mine count");
			(this.rows = e), (this.cols = t), (this.mineCount = s), this.#e(), this.#t(), this.#s();
		}
		#e() {
			this.board = [];
			for (let t = 0; t < this.rows; t++) {
				this.board[t] = [];
				for (let s = 0; s < this.cols; s++) this.board[t][s] = new e(t, s);
			}
			this.gameOver = !1;
		}
		#t() {
			let e = 0;
			for (; e < this.mineCount; ) {
				const t = Math.floor(Math.random() * this.rows),
					s = Math.floor(Math.random() * this.cols),
					i = this.board[t][s];
				i.isMine || ((i.isMine = !0), e++);
			}
		}
		#s() {
			for (let e = 0; e < this.rows; e++)
				for (let t = 0; t < this.cols; t++) {
					const s = this.board[e][t];
					if (s.isMine) continue;
					let i = 0;
					for (let s = -1; s <= 1; s++)
						for (let n = -1; n <= 1; n++) {
							if (0 === s && 0 === n) continue;
							const o = e + s,
								l = t + n;
							o >= 0 && o < this.rows && l >= 0 && l < this.cols && this.board[o][l].isMine && i++;
						}
					s.adjacentMines = i;
				}
		}
		revealCell(e, t) {
			if (this.won || this.gameOver) return { mineHit: !1, revealed: 0 };
			if (e < 0 || e >= this.rows || t < 0 || t >= this.cols) return { mineHit: !1, revealed: 0 };
			const s = this.board[e][t];
			if (s.isRevealed || s.isFlagged) return { mineHit: !1, revealed: 0 };
			if (this.isFirstCellRevealed) for (this.isFirstCellRevealed = !1; s.isMine; ) (s.isMine = !1), this.#t(1), this.#s();
			this.board[e][t].isRevealed = !0;
			for (let s = -1; s <= 1; s++)
				for (let i = -1; i <= 1; i++) {
					if (0 === s && 0 === i) continue;
					const n = e + s,
						o = t + i;
					n >= 0 && n < this.rows && o >= 0 && o < this.cols && this.board[n][o].adjacentCells--;
				}
			if (this.board[e][t].isMine) return (this.gameOver = !0), { mineHit: !0, revealed: 1 };
			let i = 1;
			if (0 === this.board[e][t].adjacentMines) for (let s = -1; s <= 1; s++) for (let n = -1; n <= 1; n++) (0 === s && 0 === n) || (i += this.revealCell(e + s, t + n).revealed);
			return this.getRemainingMines() <= 0 && (this.won = !0), { mineHit: !1, revealed: i };
		}
		boardToString() {
			let e = "";
			for (let t = 0; t < this.rows; t++) {
				let s = "";
				for (let e = 0; e < this.cols; e++) this.board[t][e].isRevealed ? (this.board[t][e].isMine ? (s += "* ") : (s += this.board[t][e].adjacentMines + " ")) : this.board[t][e].isFlagged ? (s += "F ") : (s += ". ");
				e += s.trim() + "\n";
			}
			return e.trim();
		}
		printBoard() {
			console.log(this.boardToString());
		}
		flagCell(e, t) {
			if (this.gameOver) return !1;
			if (e < 0 || e >= this.rows || t < 0 || t >= this.cols) return !1;
			const s = this.board[e][t];
			if (s.isRevealed) return !1;
			(s.isFlagged = !s.isFlagged), s.isFlagged && this.getRemainingMines() <= 0 && (this.won = !0);
		}
		getCell(e, t) {
			return e < 0 || e >= this.rows || t < 0 || t >= this.cols ? null : this.board[e][t];
		}
		getRemainingMines() {
			let e = 0,
				t = 0;
			for (let s = 0; s < this.rows; s++) for (let i = 0; i < this.cols; i++) this.board[s][i].isMine && t++, this.board[s][i].isFlagged && e++;
			return Math.max(0, t - e);
		}
		getBoard() {
			return this.board;
		}
		getSize() {
			return { rows: this.rows, cols: this.cols };
		}
	}
	const s = t,
		i = class {
			constructor() {
				(this.cells = []), (this.hiddenNeighbors = []);
			}
			addCell(e) {
				this.cells.some((t) => t.row === e.row && t.col === e.col) || this.cells.push(e);
			}
			getCells() {
				return this.cells;
			}
			setHiddenNeighbors(e) {
				this.hiddenNeighbors = e;
			}
			getHiddenNeighbors(e) {
				if (this.hiddenNeighbors && this.hiddenNeighbors.length > 0) return this.hiddenNeighbors;
				const t = new Set();
				for (const { row: s, col: i } of this.cells)
					for (let n = -1; n <= 1; n++)
						for (let o = -1; o <= 1; o++) {
							if (0 === n && 0 === o) continue;
							const l = s + n,
								r = i + o;
							if (l >= 0 && l < e.rows && r >= 0 && r < e.cols) {
								const s = e.getCell(l, r);
								s.isRevealed || s.isFlagged || t.add(`${l},${r}`);
							}
						}
				return (this.hiddenNeighbors = Array.from(t).map((e) => e.split(",").map(Number))), this.hiddenNeighbors;
			}
			print(e) {
				this.cells.forEach(({ row: t, col: s }) => {
					const i = e.getCell(t, s);
					console.log(`Row: ${t}, Col: ${s}, Adjacent Mines: ${i.adjacentMines}`);
				}),
					console.log("Hidden neighbors:", this.hiddenNeighbors);
			}
		},
		n = class {
			entropy = 0;
			minesweeper = null;
			chains = [];
			constructor(e) {
				if (!(e instanceof s)) throw new Error("Invalid Minesweeper instance provided");
				(this.minesweeper = e), (this.entropy = 0);
			}
			calculateEntropy() {
				this.calculateChains(),
					(this.entropy = 0),
					this.chains.forEach((e, t) => {
						const {
							validCount: s,
							entropy: i,
							hiddenTileCount: n
						} = (function (e, t) {
							const s = e.getHiddenNeighbors(t),
								i = e.getCells(),
								n = 1 << s.length;
							let o = 0;
							for (let e = 0; e < n; e++) {
								const n = new Map();
								s.forEach(([t, s], i) => {
									const o = !!(e & (1 << i));
									n.set(`${t},${s}`, o);
								});
								let l = !0;
								for (const { row: e, col: s } of i) {
									let i = 0;
									for (let t = -1; t <= 1; t++)
										for (let o = -1; o <= 1; o++) {
											if (0 === t && 0 === o) continue;
											const l = `${e + t},${s + o}`;
											n.get(l) && i++;
										}
									if (i !== t.getCell(e, s).adjacentMines) {
										l = !1;
										break;
									}
								}
								l && o++;
							}
							return {
								validCount: o,
								entropy: o > 0 ? Math.log2(o) : 0,
								hiddenTileCount: s.length
							};
						})(e, this.minesweeper);
						console.log(`Chain ${t + 1}:`), console.log(`  Hidden tiles: ${n}`), console.log(`  Valid configurations: ${s}`), console.log(`  Entropy (bits): ${i.toFixed(4)}`), (this.entropy += i);
					}),
					console.log(`\nTotal Entropy: ${this.entropy.toFixed(4)} bits`);
			}
			printChains() {
				0 !== this.chains.length
					? this.chains.forEach((e, t) => {
							console.log(`Chain ${t + 1}:`), e.print(this.minesweeper);
						})
					: console.log("No chains found.");
			}
			calculateChains() {
				this.chains = [];
				const e = Array.from({ length: this.minesweeper.rows }, () => Array(this.minesweeper.cols).fill(!1)),
					t = (e) => e.isRevealed && e.adjacentMines > 0,
					s = (e, t) => {
						const s = [];
						for (let i = -1; i <= 1; i++)
							for (let n = -1; n <= 1; n++) {
								if (0 === i && 0 === n) continue;
								const o = e + i,
									l = t + n;
								if (o >= 0 && o < this.minesweeper.rows && l >= 0 && l < this.minesweeper.cols) {
									const e = this.minesweeper.getCell(o, l);
									e.isRevealed || e.isFlagged || s.push([o, l]);
								}
							}
						return s;
					},
					n = (e, t) => {
						const s = new Set(),
							i = [],
							n = (e) => {
								const o = `${e[0]},${e[1]}`;
								if (s.has(o)) return;
								s.add(o), i.push({ row: e[0], col: e[1] });
								let l = t.get(o) || [];
								for (const e of l) n(e);
							};
						return n(e), i;
					};
				for (let o = 0; o < this.minesweeper.rows; o++)
					for (let l = 0; l < this.minesweeper.cols; l++)
						if (t(this.minesweeper.getCell(o, l)) && !e[o][l]) {
							const r = new Map(),
								a = [[o, l]];
							for (e[o][l] = !0; a.length > 0; ) {
								const [i, n] = a.shift(),
									o = s(i, n);
								for (const [s, l] of o)
									for (let o = -1; o <= 1; o++)
										for (let c = -1; c <= 1; c++) {
											if (0 === o && 0 === c) continue;
											const d = s + o,
												h = l + c;
											d >= 0 && d < this.minesweeper.rows && h >= 0 && h < this.minesweeper.cols && t(this.minesweeper.getCell(d, h)) && (r.has(`${i},${n}`) || r.set(`${i},${n}`, []), r.get(`${i},${n}`).push([d, h]), e[d][h] || (a.push([d, h]), (e[d][h] = !0)));
										}
							}
							const c = n([o, l], r);
							if (c.length > 0) {
								const e = new i();
								c.forEach((t) => e.addCell(t)), this.chains.push(e);
							}
						}
			}
		},
		o = class {
			ms;
			constructor(e) {
				if ((!e) instanceof t) throw new Error("Invalid Minesweeper instance provided");
				this.ms = e;
			}
			_getAdjacentCells(e, t) {
				let s = this.ms.getSize(),
					i = [];
				for (let n = Math.max(e - 1, 0); n < s.rows && n <= e + 1; n++) for (let o = Math.max(t - 1, 0); o < s.cols && o <= t + 1; o++) (n == e && o == t) || i.push(this.ms.getCell(n, o));
				return i;
			}
			nextMove() {
				let e,
					t = this.ms.getSize();
				for (let s = 0; s < t.cols; s++)
					for (let i = 0; i < t.rows; i++) {
						let t = this.ms.getCell(i, s);
						if (t.isRevealed && t.adjacentMines > 0) {
							let n = this._getAdjacentCells(i, s),
								o = 0,
								l = 0;
							n.forEach((e) => {
								e.isHidden ? o++ : e.isFlagged && l++;
							}),
								t.adjacentMines == o + l
									? n.forEach((e) => {
											e.isFlagged || this.ms.flagCell(e.row, e.col);
										})
									: void 0 === e &&
										t.adjacentMines == l &&
										((e = void 0),
										n.every(
											(t) =>
												!(
													!t.isFlagged &&
													!t.isRevealed &&
													((e = {
														row: t.row,
														col: t.col
													}),
													1)
												)
										));
						}
					}
				return e;
			}
		};
	document.addEventListener("DOMContentLoaded", () => {
		const e = document.getElementById("game-board"),
			t = document.getElementById("reset-button"),
			i = document.getElementById("settings-form"),
			l = document.getElementById("next-move-button");
		let r,
			a,
			c,
			d = 10,
			h = 10,
			g = 10;
		function f() {
			try {
				(r = new s(d, h, g)),
					(a = new n(r)),
					(c = new o(r)),
					(function () {
						(e.innerHTML = ""), (e.style.gridTemplateColumns = `repeat(${h}, 30px)`);
						for (let t = 0; t < d; t++)
							for (let s = 0; s < h; s++) {
								const i = document.createElement("div");
								(i.className = "cell"),
									(i.dataset.row = t),
									(i.dataset.col = s),
									i.addEventListener("click", () => u(t, s)),
									i.addEventListener("contextmenu", (e) => {
										e.preventDefault(), m(t, s);
									}),
									e.appendChild(i);
							}
					})();
			} catch (e) {
				alert("Failed to initialize game: " + e.message);
			}
		}
		function u(e, t) {
			r.gameOver ||
				r.getCell(e, t).isFlagged ||
				(r.revealCell(e, t).mineHit
					? (alert("Game Over!"),
						(function () {
							for (let e = 0; e < d; e++) for (let t = 0; t < h; t++) r.getCell(e, t).isMine && v(e, t);
						})())
					: (console.clear(), a.calculateChains(), a.printChains(), w()));
		}
		function m(e, t) {
			r.gameOver || r.getCell(e, t).isRevealed || (r.flagCell(e, t), v(e, t));
		}
		function w() {
			for (let e = 0; e < d; e++) for (let t = 0; t < h; t++) v(e, t);
		}
		function v(e, t) {
			const s = r.getCell(e, t),
				i = document.querySelector(`.cell[data-row="${e}"][data-col="${t}"]`);
			s.isRevealed ? (i.classList.add("revealed"), s.isMine ? (i.classList.add("mine"), (i.textContent = "*")) : (i.textContent = s.adjacentMines > 0 ? s.adjacentMines : "")) : s.isFlagged ? (i.classList.add("flagged"), (i.textContent = "F")) : (i.classList.remove("revealed", "mine", "flagged"), (i.textContent = ""));
		}
		i.addEventListener("submit", (e) => {
			e.preventDefault(), (d = parseInt(document.getElementById("rows").value)), (h = parseInt(document.getElementById("cols").value)), (g = parseInt(document.getElementById("mines").value)), f();
		}),
			t.addEventListener("click", f),
			l.addEventListener("click", function () {
				let e = c.nextMove();
				console.log(e), void 0 !== e && r.revealCell(e.row, e.col), w();
			}),
			f();
	});
})();
//# sourceMappingURL=bundle.js.map
