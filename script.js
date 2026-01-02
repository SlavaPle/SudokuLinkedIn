document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.sudoku-cell');
    const inputButtons = document.querySelectorAll('.sudoku-input-button');

    function updateHighlights(activeCell) {
        if (!activeCell) return;

        const index = parseInt(activeCell.getAttribute('data-cell-idx'));
        const row = Math.floor(index / 6);
        const col = index % 6;
        const value = activeCell.querySelector('.sudoku-cell-content').textContent.trim();

        cells.forEach(c => {
            c.classList.remove('sudoku-cell-active', 'sudoku-cell-contextual');
        });

        activeCell.classList.add('sudoku-cell-active');

        cells.forEach(c => {
            const cIndex = parseInt(c.getAttribute('data-cell-idx'));
            if (cIndex === index) return;

            const cRow = Math.floor(cIndex / 6);
            const cCol = cIndex % 6;
            const cValue = c.querySelector('.sudoku-cell-content').textContent.trim();

            // Highlight same value
            if (value !== '' && cValue === value) {
                c.classList.add('sudoku-cell-contextual');
            }

            // Same row or same column
            if (cRow === row || cCol === col) {
                c.classList.add('sudoku-cell-contextual');
            }

            // Same region (3x2 for 6x6 grid)
            const regionRowStart = Math.floor(row / 2) * 2;
            const regionColStart = Math.floor(col / 3) * 3;
            if (cRow >= regionRowStart && cRow < regionRowStart + 2 &&
                cCol >= regionColStart && cCol < regionColStart + 3) {
                c.classList.add('sudoku-cell-contextual');
            }
        });
    }

    function handleInput(inputValue) {
        const activeCell = document.querySelector('.sudoku-cell.sudoku-cell-active');
        if (!activeCell || activeCell.classList.contains('sudoku-cell-prefilled')) {
            return;
        }

        const contentDiv = activeCell.querySelector('.sudoku-cell-content');
        if (inputValue === 'erase') {
            contentDiv.textContent = '';
        } else {
            contentDiv.textContent = inputValue;
        }

        // Update highlights after value change (e.g., same-value highlighting)
        updateHighlights(activeCell);
    }

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            updateHighlights(cell);
        });
    });

    inputButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-number');
            if (number) {
                handleInput(number);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        // Handle numbers 1-6
        if (event.key >= '1' && event.key <= '6') {
            handleInput(event.key);
        }
        // Handle Backspace or Delete for erasing
        else if (event.key === 'Backspace' || event.key === 'Delete') {
            handleInput('erase');
        }
    });
});
