/**
 * hints.js - Script for automatic note filling (Auto-Notes)
 * Implements Sudoku rules, candidate elimination, and 2-pass Hidden Single logic with granular visual delays.
 */

const SudokuRules = {
    checkRow: (num, row, board) => {
        for (let c = 0; c < 6; c++) {
            if (board[row * 6 + c] === num) return false;
        }
        return true;
    },
    checkCol: (num, col, board) => {
        for (let r = 0; r < 6; r++) {
            if (board[r * 6 + col] === num) return false;
        }
        return true;
    },
    checkRegion: (num, row, col, board) => {
        const rStart = Math.floor(row / 2) * 2;
        const cStart = Math.floor(col / 3) * 3;
        for (let r = rStart; r < rStart + 2; r++) {
            for (let c = cStart; c < cStart + 3; c++) {
                if (board[r * 6 + c] === num) return false;
            }
        }
        return true;
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function renderCandidates(cellCandidates, cells, board) {
    cells.forEach((cell, index) => {
        const candidates = cellCandidates[index];
        if (candidates.length === 0 && (cell.classList.contains('sudoku-cell-prefilled') || board[index] !== 0)) return;

        const contentDiv = cell.querySelector('.sudoku-cell-content');
        let notesHtml = '<div class="sudoku-cell-notes">';
        for (let i = 1; i <= 6; i++) {
            const valToDisplay = candidates.includes(i) ? i : '';
            notesHtml += `<div class="sudoku-cell-note sudoku-cell-note-color" data-note-val="${i}">${valToDisplay}</div>`;
        }
        notesHtml += '</div>';
        contentDiv.innerHTML = notesHtml;
    });
}

/**
 * Granular Elimination:
 * Wipes candidates cell-by-cell when a fixed number is found.
 */
async function applyEliminationGranular(cellCandidates, cells, board) {
    const next = cellCandidates.map(c => [...c]);
    for (let i = 0; i < 36; i++) {
        if (next[i].length === 1) {
            const fixed = next[i][0];
            const row = Math.floor(i / 6);
            const col = i % 6;
            const rStart = Math.floor(row / 2) * 2;
            const cStart = Math.floor(col / 3) * 3;

            let changedLocally = false;
            for (let k = 0; k < 6; k++) {
                // Row
                const rIdx = row * 6 + k;
                if (rIdx !== i && next[rIdx].includes(fixed)) {
                    next[rIdx] = next[rIdx].filter(n => n !== fixed);
                    changedLocally = true;
                }
                // Col
                const cIdx = k * 6 + col;
                if (cIdx !== i && next[cIdx].includes(fixed)) {
                    next[cIdx] = next[cIdx].filter(n => n !== fixed);
                    changedLocally = true;
                }
            }
            // Region
            for (let r = rStart; r < rStart + 2; r++) {
                for (let c = cStart; c < cStart + 3; c++) {
                    const regIdx = r * 6 + c;
                    if (regIdx !== i && next[regIdx].includes(fixed)) {
                        next[regIdx] = next[regIdx].filter(n => n !== fixed);
                        changedLocally = true;
                    }
                }
            }

            if (changedLocally) {
                renderCandidates(next, cells, board);
                await delay(500);
            }
        }
    }
    return next;
}

/**
 * Granular Hidden Single:
 * Checks uniqueness cell-by-cell.
 */
async function applyHiddenSingleGranular(cellCandidates, cells, board) {
    const next = cellCandidates.map(c => [...c]);
    for (let i = 0; i < 36; i++) {
        if (next[i].length <= 1) continue;

        const row = Math.floor(i / 6);
        const col = i % 6;
        const rStart = Math.floor(row / 2) * 2;
        const cStart = Math.floor(col / 3) * 3;

        for (const num of next[i]) {
            let uniqueInRow = true;
            let uniqueInCol = true;
            let uniqueInRegion = true;

            for (let k = 0; k < 6; k++) {
                if (uniqueInRow && row * 6 + k !== i && next[row * 6 + k].includes(num)) uniqueInRow = false;
                if (uniqueInCol && k * 6 + col !== i && next[k * 6 + col].includes(num)) uniqueInCol = false;
            }

            for (let r = rStart; r < rStart + 2; r++) {
                for (let c = cStart; c < cStart + 3; c++) {
                    const regIdx = r * 6 + c;
                    if (uniqueInRegion && regIdx !== i && next[regIdx].includes(num)) uniqueInRegion = false;
                }
            }

            if (uniqueInRow || uniqueInCol || uniqueInRegion) {
                next[i] = [num];
                renderCandidates(next, cells, board);
                await delay(500);
                break;
            }
        }
    }
    return next;
}

window.triggerHints = async function () {
    const cells = document.querySelectorAll('.sudoku-cell');

    // 1. Snapshot board
    const board = Array.from(cells).map(cell => {
        const content = cell.querySelector('.sudoku-cell-content');
        if (content.querySelector('.sudoku-cell-notes')) return 0;
        const val = parseInt(content.textContent.trim());
        return isNaN(val) ? 0 : val;
    });

    // 2. Initial candidates - Cell by cell
    let cellCandidates = new Array(36).fill([]);
    for (let i = 0; i < 36; i++) {
        if (cells[i].classList.contains('sudoku-cell-prefilled') || board[i] !== 0) {
            continue;
        }

        const row = Math.floor(i / 6);
        const col = i % 6;
        const possible = [];
        for (let num = 1; num <= 6; num++) {
            if (SudokuRules.checkRow(num, row, board) &&
                SudokuRules.checkCol(num, col, board) &&
                SudokuRules.checkRegion(num, row, col, board)) {
                possible.push(num);
            }
        }
        cellCandidates[i] = possible;
        renderCandidates(cellCandidates, cells, board);
        await delay(200); // Faster for initial fill
    }

    // --- PASS 1 ---
    cellCandidates = await applyEliminationGranular(cellCandidates, cells, board);
    cellCandidates = await applyHiddenSingleGranular(cellCandidates, cells, board);

    // --- PASS 2 ---
    cellCandidates = await applyEliminationGranular(cellCandidates, cells, board);
    cellCandidates = await applyHiddenSingleGranular(cellCandidates, cells, board);

    console.log("Strategic Granular Hints completed.");
};
