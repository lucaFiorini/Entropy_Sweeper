/**
 * @module minesweeper-solver
 */

import fs from "fs";
import SelfPlay from "../src/selfPlay.js";
import Minesweeper from "../src/minesweeper.js";
import EntropyCalculator from "../src/entropy/entropyCalculator.js";

function initGame(rows = 10, cols = 10, mines = 10) {
    try {
        const minesweeper = new Minesweeper(rows, cols, mines);
        const selfPlay = new SelfPlay(minesweeper);
        return { minesweeper, selfPlay };
    } catch (error) {
        console.log("Failed to initialize game: " + error.message);
    }
}

function solveGame(minesweeper, selfPlay) {
    if (minesweeper.gameOver) {
        return { result: "aborted", entropy: [] };
    }

    const entropyInstance = new EntropyCalculator(minesweeper);
    const startTime = Date.now();
    const TIMEOUT_MS = 10000;

    let entropy = [];

    while (!minesweeper.gameOver) {
        if (Date.now() - startTime > TIMEOUT_MS) {
            return { result: "aborted", entropy };
        }
        let move;
        try {
            move = selfPlay.nextMove();
        } catch (error) {
            console.log("Error during self-play move: " + error.message);
            return { result: "aborted", entropy };
        }
        if (!move) {
            return { result: "aborted", entropy };
        }
        minesweeper.revealCell(move.row, move.col);
		entropyInstance.calculateChains();
        entropy.push(entropyInstance.calculateEntropy());
    }

    if (minesweeper.won) {
        return { result: "won", entropy };
    } else if (minesweeper.gameOver) {
        return { result: "lost", entropy };
    }
    return { result: "aborted", entropy };
}

function main() {
    const diffs = [
        { name: "Beginner", rows: 9, cols: 9, mines: 10 },
		{ name: "Intermediate", rows: 16, cols: 16, mines: 40 },
		{ name: "Expert", rows: 16, cols: 30, mines: 99 }
    ];
    const n_runs = 2;
    const stats = {};
    const entropyLog = {};

    for (const diff of diffs) {
        console.log(`Starting game with ${diff.rows} rows, ${diff.cols} cols, and ${diff.mines} mines.`);
        let totalTime = 0;
        let won = 0, lost = 0, aborted = 0;
        entropyLog[diff.name] = [];
        for (let i = 0; i < n_runs; i++) {
            const { minesweeper, selfPlay } = initGame(diff.rows, diff.cols, diff.mines);
            if (!minesweeper || !selfPlay) {
                aborted++;
                entropyLog[diff.name].push([]);
                continue;
            }

            const startTime = Date.now();
            const { result, entropy } = solveGame(minesweeper, selfPlay);
            const endTime = Date.now();
            totalTime += (endTime - startTime);

            if (result === "won") won++;
            else if (result === "lost") lost++;
            else aborted++;

            entropyLog[diff.name].push(entropy);
        }
        console.log(`Average time for ${n_runs} runs: ${(totalTime / n_runs).toFixed(2)} ms`);
        console.log(`Results for ${diff.name}: Won: ${won}, Lost: ${lost}, Aborted: ${aborted}`);
        stats[diff.name] = { won, lost, aborted, avgTime: (totalTime / n_runs).toFixed(2) };
    }

    // Write stats and entropy to files
    fs.writeFileSync("logs/run_stats.json", JSON.stringify(stats, null, 2));
    fs.writeFileSync("logs/entropy_log.json", JSON.stringify(entropyLog, null, 2));
    console.log("Stats written to run_stats.json");
    console.log("Entropy log written to entropy_log.json");
}

main();