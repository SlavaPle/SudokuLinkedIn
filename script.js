document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.sudoku-cell');

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = parseInt(cell.getAttribute('data-cell-idx'));
            const row = Math.floor(index / 6);
            const col = index % 6;
            const value = cell.querySelector('.sudoku-cell-content').textContent.trim();

            // Clear previous highlight classes
            cells.forEach(c => {
                c.classList.remove('sudoku-cell-active', 'sudoku-cell-contextual', 'sudoku-cell-scrim-highlight');
            });

            // Add active class to clicked cell
            cell.classList.add('sudoku-cell-active');

            cells.forEach(c => {
                const cIndex = parseInt(c.getAttribute('data-cell-idx'));
                if (cIndex === index) return;

                const cRow = Math.floor(cIndex / 6);
                const cCol = cIndex % 6;
                const cValue = c.querySelector('.sudoku-cell-content').textContent.trim();

                // Highlight same value
                if (value !== '' && cValue === value) {
                    // LinkedIn uses 'sudoku-cell-scrim-highlight' or similar for this
                    // but 'sudoku-cell-active' is usually only for the focused cell.
                    // Let's use 'sudoku-cell-contextual' or find a better class.
                    // Actually, let's look at the CSS again.
                    // Line 135305: .sudoku-cell-scrim.sudoku-cell-scrim-highlight
                    // But our cells don't have the scrim div.
                    // Let's just use 'sudoku-cell-contextual' for same row/col/region
                    // and maybe a custom highlight or just 'sudoku-cell-contextual' for same value too.
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
        });
    });
});
