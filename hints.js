/**
 * hints.js - Script for automatic note filling (Auto-Notes)
 * Based on Sudoku rules and custom condition mocks.
 */

const SudokuRules = {
    // Condition 1: Check if number exists in the same row
    checkRow: (num, row, board) => {
        for (let c = 0; c < 6; c++) {
            if (board[row * 6 + c] === num) return false;
        }
        return true;
    },

    // Condition 2: Check if number exists in the same column
    checkCol: (num, col, board) => {
        for (let r = 0; r < 6; r++) {
            if (board[r * 6 + col] === num) return false;
        }
        return true;
    },

    // Condition 3: Check if number exists in the same 3x2 region
    checkRegion: (num, row, col, board) => {
        const rStart = Math.floor(row / 2) * 2;
        const cStart = Math.floor(col / 3) * 3;
        for (let r = rStart; r < rStart + 2; r++) {
            for (let c = cStart; c < cStart + 3; c++) {
                if (board[r * 6 + c] === num) return false;
            }
        }
        return true;
    },

    // Mock Condition 4: Probability Rule (Just for demonstration)
    mockProbability: (num) => {
        // Example: Only suggest hints for numbers > 1 based on some "logic"
        return true; // Simple mock, always true
    }
};

window.triggerHints = function () {
    const cells = document.querySelectorAll('.sudoku-cell');

    // Create a snapshot of the current board (main numbers only)
    const board = Array.from(cells).map(cell => {
        const content = cell.querySelector('.sudoku-cell-content');
        // If it has notes container, we treat main value as 0
        if (content.querySelector('.sudoku-cell-notes')) return 0;

        const val = parseInt(content.textContent.trim());
        return isNaN(val) ? 0 : val;
    });

    cells.forEach((cell, index) => {
        // Never put hints in pre-filled cells or cells with a main number already set
        if (cell.classList.contains('sudoku-cell-prefilled') || board[index] !== 0) return;

        const contentDiv = cell.querySelector('.sudoku-cell-content');
        const row = Math.floor(index / 6);
        const col = index % 6;

        const validNumbers = [];

        // Apply conditions to find possible numbers
        for (let num = 1; num <= 6; num++) {
            const isPossible = SudokuRules.checkRow(num, row, board) &&
                SudokuRules.checkCol(num, col, board) &&
                SudokuRules.checkRegion(num, row, col, board) &&
                SudokuRules.mockProbability(num);

            if (isPossible) {
                validNumbers.push(num);
            }
        }

        // Generate notes grid HTML
        let notesHtml = '<div class="sudoku-cell-notes">';
        for (let i = 1; i <= 6; i++) {
            const valToDisplay = validNumbers.includes(i) ? i : '';
            notesHtml += `<div class="sudoku-cell-note sudoku-cell-note-color" data-note-val="${i}">${valToDisplay}</div>`;
        }
        notesHtml += '</div>';

        contentDiv.innerHTML = notesHtml;
    });

    console.log("Hints triggered: All eligible empty cells populated with notes based on Sudoku rules.");
};
