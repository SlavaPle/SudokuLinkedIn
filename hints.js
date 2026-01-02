/**
 * hints.js - Script for automatic note filling (Auto-Notes)
 * Implements Sudoku rules, candidate elimination, and 2-pass Hidden Single logic.
 */

const SudokuRules = {
    // Basic checks against fixed numbers on the board
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

/**
 * Elimination Pass:
 * If a cell has only 1 possible variant, remove that variant from all 
 * other cells in the same row, column, and region.
 */
function applyElimination(cellCandidates) {
    let changed = false;
    const next = cellCandidates.map(c => [...c]);

    for (let i = 0; i < 36; i++) {
        if (next[i].length === 1) {
            const fixed = next[i][0];
            const row = Math.floor(i / 6);
            const col = i % 6;
            const rStart = Math.floor(row / 2) * 2;
            const cStart = Math.floor(col / 3) * 3;

            for (let k = 0; k < 6; k++) {
                // Row
                const rIdx = row * 6 + k;
                if (rIdx !== i && next[rIdx].includes(fixed)) {
                    next[rIdx] = next[rIdx].filter(n => n !== fixed);
                    changed = true;
                }
                // Col
                const cIdx = k * 6 + col;
                if (cIdx !== i && next[cIdx].includes(fixed)) {
                    next[cIdx] = next[cIdx].filter(n => n !== fixed);
                    changed = true;
                }
            }
            // Region
            for (let r = rStart; r < rStart + 2; r++) {
                for (let c = cStart; c < cStart + 3; c++) {
                    const regIdx = r * 6 + c;
                    if (regIdx !== i && next[regIdx].includes(fixed)) {
                        next[regIdx] = next[regIdx].filter(n => n !== fixed);
                        changed = true;
                    }
                }
            }
        }
    }
    return { candidates: next, changed };
}

/**
 * Hidden Single Pass:
 * Checks if a candidate is unique among the "possible options" for its module.
 */
function applyHiddenSingle(cellCandidates) {
    let changed = false;
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
                changed = true;
                break;
            }
        }
    }
    return { candidates: next, changed };
}

window.triggerHints = function () {
    const cells = document.querySelectorAll('.sudoku-cell');

    // 1. Initial status
    const board = Array.from(cells).map(cell => {
        const content = cell.querySelector('.sudoku-cell-content');
        if (content.querySelector('.sudoku-cell-notes')) return 0;
        const val = parseInt(content.textContent.trim());
        return isNaN(val) ? 0 : val;
    });

    // 2. Generate initial candidates
    let cellCandidates = new Array(36).fill(null).map((_, i) => {
        if (cells[i].classList.contains('sudoku-cell-prefilled') || board[i] !== 0) return [];
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
        return possible;
    });

    // --- PASS 1 ---
    cellCandidates = applyElimination(cellCandidates).candidates;
    cellCandidates = applyHiddenSingle(cellCandidates).candidates;

    // --- PASS 2 ---
    // The second pass now works "among possible options" refined by the first pass
    cellCandidates = applyElimination(cellCandidates).candidates;
    cellCandidates = applyHiddenSingle(cellCandidates).candidates;

    // 5. Update DOM
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

    console.log("Strategic Double-Pass Hints triggered: Candidate check including 'possible variants' chain.");
};
