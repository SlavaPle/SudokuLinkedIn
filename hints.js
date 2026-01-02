/**
 * hints.js - Script for automatic note filling (Auto-Notes)
 * Implements Sudoku rules and Hidden Single logic.
 */

const SudokuRules = {
    // Basic candidate checks
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

window.triggerHints = function () {
    const cells = document.querySelectorAll('.sudoku-cell');

    // 1. Snapshot board
    const board = Array.from(cells).map(cell => {
        const content = cell.querySelector('.sudoku-cell-content');
        if (content.querySelector('.sudoku-cell-notes')) return 0;
        const val = parseInt(content.textContent.trim());
        return isNaN(val) ? 0 : val;
    });

    // 2. Find all possible candidates for each empty cell
    const cellCandidates = new Array(36).fill(null).map((_, i) => {
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

    // 3. Apply Hidden Single Logic
    // If a number is a candidate for ONLY ONE cell in a row/col/region, 
    // then that cell must contain that number.
    const refinedCandidates = cellCandidates.map((candidates, i) => {
        if (candidates.length <= 1) return candidates; // Already unique or empty

        const row = Math.floor(i / 6);
        const col = i % 6;
        const rStart = Math.floor(row / 2) * 2;
        const cStart = Math.floor(col / 3) * 3;

        for (const num of candidates) {
            let isUniqueInRow = true;
            let isUniqueInCol = true;
            let isUniqueInRegion = true;

            for (let k = 0; k < 6; k++) {
                // Check Row
                const rIdx = row * 6 + k;
                if (rIdx !== i && cellCandidates[rIdx].includes(num)) isUniqueInRow = false;

                // Check Col
                const cIdx = k * 6 + col;
                if (cIdx !== i && cellCandidates[cIdx].includes(num)) isUniqueInCol = false;
            }

            // Check Region
            for (let r = rStart; r < rStart + 2; r++) {
                for (let c = cStart; c < cStart + 3; c++) {
                    const regIdx = r * 6 + c;
                    if (regIdx !== i && cellCandidates[regIdx].includes(num)) isUniqueInRegion = false;
                }
            }

            if (isUniqueInRow || isUniqueInCol || isUniqueInRegion) {
                return [num]; // Found a Hidden Single! Only this value is possible.
            }
        }
        return candidates;
    });

    // 4. Update the DOM
    cells.forEach((cell, index) => {
        const candidates = refinedCandidates[index];
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

    console.log("Advanced Hints triggered: Candidates refined using Hidden Single logic.");
};
