document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.sudoku-cell');
    const inputButtons = document.querySelectorAll('.sudoku-input-button');
    const hintBtn = document.querySelector('[data-control-btn="hint"]');
    const notesBtn = document.querySelector('[data-control-btn="notes"]');

    let notesMode = false;
    let hintMode = false;

    function toggleControl(btn, type) {
        if (type === 'hint') {
            hintMode = !hintMode;
            updateControlUI(btn, hintMode);
        } else if (type === 'notes') {
            notesMode = !notesMode;
            updateControlUI(btn, notesMode);
        }

        // If both Hint and Notes are ON, trigger automatic hints calculation
        if (hintMode && notesMode) {
            if (typeof window.triggerHints === 'function') {
                window.triggerHints();
            }
        }
    }

    function updateControlUI(btn, isActive) {
        const span = btn.querySelector('span');
        if (!span) return;

        if (isActive) {
            span.classList.remove('sudoku-under-board__text--disabled');
            span.classList.add('sudoku-under-board__text--active');
            span.textContent = 'ON';
        } else {
            span.classList.remove('sudoku-under-board__text--active');
            span.classList.add('sudoku-under-board__text--disabled');
            span.textContent = 'OFF';
        }
    }

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

            const contentDiv = c.querySelector('.sudoku-cell-content');
            const cHasNotes = contentDiv.querySelector('.sudoku-cell-notes');
            const cValue = cHasNotes ? '' : contentDiv.textContent.trim();

            // Highlight same value
            if (value !== '' && !activeCell.querySelector('.sudoku-cell-notes') && cValue === value) {
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
            contentDiv.innerHTML = '';
            updateHighlights(activeCell);
            return;
        }

        if (notesMode) {
            let notesContainer = contentDiv.querySelector('.sudoku-cell-notes');
            if (!notesContainer) {
                contentDiv.innerHTML = '<div class="sudoku-cell-notes"></div>';
                notesContainer = contentDiv.querySelector('.sudoku-cell-notes');
                for (let i = 1; i <= 6; i++) {
                    const noteSlot = document.createElement('div');
                    noteSlot.className = 'sudoku-cell-note sudoku-cell-note-color';
                    noteSlot.setAttribute('data-note-val', i);
                    notesContainer.appendChild(noteSlot);
                }
            }

            const slot = notesContainer.querySelector(`[data-note-val="${inputValue}"]`);
            if (slot.textContent === inputValue) {
                slot.textContent = '';
            } else {
                slot.textContent = inputValue;
            }
        } else {
            contentDiv.innerHTML = '';
            contentDiv.textContent = inputValue;
        }

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

    if (hintBtn) {
        hintBtn.addEventListener('click', () => toggleControl(hintBtn, 'hint'));
    }

    if (notesBtn) {
        notesBtn.addEventListener('click', () => toggleControl(notesBtn, 'notes'));
    }

    document.addEventListener('keydown', (event) => {
        if (event.key >= '1' && event.key <= '6') {
            handleInput(event.key);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            handleInput('erase');
        } else if (event.key.toLowerCase() === 'n') {
            if (notesBtn) toggleControl(notesBtn, 'notes');
        } else if (event.key.toLowerCase() === 'h') {
            if (hintBtn) toggleControl(hintBtn, 'hint');
        }
    });
});
