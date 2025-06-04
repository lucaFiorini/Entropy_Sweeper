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
        return { result: "aborted", entropy: [], board: minesweeper.boardToString() };
    }

    const startTime = Date.now();
    const TIMEOUT_MS = 10000;

    let entropyArr = [];

    while (!minesweeper.gameOver) {
        if (Date.now() - startTime > TIMEOUT_MS) {
            return { result: "aborted", entropyArr, board: minesweeper.boardToString() };
        }
        let move, entropy;
        try {
            let result = selfPlay.nextMove();
			move = result.move;
			entropy = result.entropy;
			entropyArr.push(entropy);
        } catch (error) {
            console.log("Error during self-play move: " + error.message);
            return { result: "aborted", entropyArr, board: minesweeper.boardToString() };
        }
        if (!move) {
            return { result: "aborted", entropyArr, board: minesweeper.boardToString() };
        }
        minesweeper.revealCell(move.row, move.col);
    }

    if (minesweeper.won) {
        return { result: "won", entropyArr };
    } else if (minesweeper.gameOver) {
        return { result: "lost", entropyArr };
    }
    return { result: "aborted", entropyArr, board: minesweeper.boardToString() };
}

function appendJSONLine(filename, obj) {
    fs.appendFileSync(filename, JSON.stringify(obj) + "\n");
}

function writeRunStats(stats) {
    // Overwrite the file with all current stats (one line per diff)
    const lines = Object.entries(stats).map(
        ([diff, stat]) => JSON.stringify({ diff, stats: stat })
    );
    fs.writeFileSync("logs/run_stats.jsonl", lines.join("\n") + "\n");
}

function main() {
    const diffs = [
        { name: "Intermediate", rows: 16, cols: 16, mines: 40 },
    ];
    const n_runs = 1000;
    const stats = {};

    // Prepare log files (clear or create)
    fs.writeFileSync("logs/run_stats.jsonl", "");
    fs.writeFileSync("logs/entropy_log.jsonl", "");
    fs.writeFileSync("logs/aborted_boards.jsonl", "");

    for (const diff of diffs) {
        console.log(`Starting game with ${diff.rows} rows, ${diff.cols} cols, and ${diff.mines} mines.`);
        let totalTime = 0;
        let won = 0, lost = 0, aborted = 0;
        for (let i = 0; i < n_runs; i++) {
            console.log(`Run ${i + 1} for ${diff.name}`);
            const { minesweeper, selfPlay } = initGame(diff.rows, diff.cols, diff.mines);
            if (!minesweeper || !selfPlay) {
                aborted++;
                appendJSONLine("logs/entropy_log.jsonl", { run: i + 1, entropy: [] });
                appendJSONLine("logs/aborted_boards.jsonl", { run: i + 1, cause: "Initialization failed", board: "Initialization failed" });
                stats[diff.name] = { won, lost, aborted, avgTime: `${(totalTime / (i + 1)).toFixed(2)} ms` };
                writeRunStats(stats);
                continue;
            }

            const startTime = Date.now();
            const { result, entropyArr, board } = solveGame(minesweeper, selfPlay);
            const endTime = Date.now();
            totalTime += (endTime - startTime);

            // Always save entropy for every run, regardless of result, and include run type
            appendJSONLine("logs/entropy_log.jsonl", { run: i + 1, type: result, entropy: entropyArr });

            if (result === "won") {
                won++;
            } else if (result === "lost") {
                lost++;
            } else {
                aborted++;
                i--; // Decrement i to repeat this run
                // Determine abort cause
                let cause = "Unknown";
                if (Date.now() - startTime > 30000) {
                    cause = "Timeout";
                } else if (!board || board === "No board state") {
                    cause = "No moves left or error";
                }
                appendJSONLine("logs/aborted_boards.jsonl", { run: i + 1, cause, board: board || "No board state" });
            }

            // Update stats and write after each run (overwrite file)
            stats[diff.name] = { won, lost, aborted, avgTime: `${(totalTime / (i + 1)).toFixed(2)} ms` };
            writeRunStats(stats);
        }
        console.log(`Average time for ${n_runs} runs: ${(totalTime / n_runs).toFixed(2)} ms`);
        console.log(`Results for ${diff.name}: Won: ${won}, Lost: ${lost}, Aborted: ${aborted}`);
    }

    console.log("Stats written to logs/run_stats.jsonl");
    console.log("Entropy log written to logs/entropy_log.jsonl");
    console.log("Aborted boards written to logs/aborted_boards.jsonl");
}

main();