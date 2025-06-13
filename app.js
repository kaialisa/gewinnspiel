let selectedClue = { direction: null, number: null };
function buildGrid() {
    const puzzleWrapper = document.getElementById('puzzle');
    puzzleWrapper.innerHTML = '';

    const cellSize = 40;
    const svgNS = "http://www.w3.org/2000/svg";

    const container = document.createElement('div');
    container.classList.add('puzzle-scaler');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.aspectRatio = `${crossword.width} / ${crossword.height}`;
    container.style.maxWidth = '90vw'; // Optional: limit size
    container.style.margin = 'auto';

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${crossword.width * cellSize} ${crossword.height * cellSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Draw cells
    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", col * cellSize);
            rect.setAttribute("y", row * cellSize);
            rect.setAttribute("width", cellSize);
            rect.setAttribute("height", cellSize);
            rect.setAttribute("fill", isBlocked ? "transparent" : "white");
            rect.setAttribute("stroke", isBlocked ? "none" : "#333");
            rect.setAttribute("stroke-width", "1");
            svg.appendChild(rect);

            const num = crossword.numbers[`${row},${col}`];
            if (num && !isBlocked) {
                if (num.down !== undefined) {
                    const downText = document.createElementNS(svgNS, "text");
                    downText.setAttribute("x", col * cellSize + 3);
                    downText.setAttribute("y", row * cellSize + 10);
                    downText.setAttribute("font-size", "12px");
                    downText.textContent = `${num.down}↓`;
                    svg.appendChild(downText);
                }
                if (num.across !== undefined) {
                    const acrossText = document.createElementNS(svgNS, "text");
                    acrossText.setAttribute("x", col * cellSize + 3);
                    acrossText.setAttribute("y", (row + 1) * cellSize - 5);
                    acrossText.setAttribute("font-size", "12px");
                    acrossText.textContent = `${num.across}→`;
                    svg.appendChild(acrossText);
                }
            }

            for (const [letter, pos] of Object.entries(crossword.solutionMap)) {
                if (pos[0] === row && pos[1] === col) {
                    const sol = document.createElementNS(svgNS, "text");
                    sol.setAttribute("x", (col + 1) * cellSize - 6);
                    sol.setAttribute("y", (row + 1) * cellSize - 5);
                    sol.setAttribute("font-size", "14px");
                    sol.setAttribute("fill", "#003399");
                    sol.setAttribute("font-weight", "900");
                    sol.setAttribute("text-anchor", "end");
                    sol.textContent = letter;
                    svg.appendChild(sol);
                }
            }
        }
    }

    container.appendChild(svg);
    createInputs(container, cellSize);
    puzzleWrapper.appendChild(container);
    buildSolutionRow();
    checkSolution();
}



function buildSidebar() {
    const sidebar = document.getElementById('clue-sidebar');
    sidebar.innerHTML = '';
// Add static question at top
    const header = document.createElement('div');
    header.innerText = 'In welchem Bundesland werden diese Feste gefeiert?';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '20px';
    sidebar.appendChild(header);
    const clueOrder = getClueOrder();

    clueOrder.forEach(clueRef => {
        const clueData = crossword.clues[clueRef.direction][clueRef.number];
        const clueText = clueData.text || `Clue ${clueRef.number}`;
        const fullText = `${clueRef.number}. ${clueText}`;
// Desktop clue
const clueElement = document.createElement('div');
clueElement.classList.add('clue-item'); 
clueElement.dataset.direction = clueRef.direction;  
clueElement.dataset.number = clueRef.number;

clueElement.innerText = fullText;
clueElement.style.marginBottom = '10px';
clueElement.style.cursor = 'pointer';

clueElement.addEventListener('click', () => {
    selectedClue = clueRef;
    highlightClueCells();
    const [firstRow, firstCol] = clueData.cells[0];
    const input = document.querySelector(`#puzzle input[data-row="${firstRow}"][data-col="${firstCol}"]`);
    if (input) input.focus();
});

sidebar.appendChild(clueElement);


        // Mobile clue 
        const mobileClue = document.createElement('div');
        mobileClue.innerText = fullText;
        mobileClue.style.marginBottom = '10px';
        
    });
}



// Build input fields over the SVG grid
function createInputs(container, cellSize) {
    const inputLayer = document.createElement('div');
    inputLayer.style.position = 'absolute';
    inputLayer.style.top = '0';
    inputLayer.style.left = '0';
    inputLayer.style.width = '100%';
    inputLayer.style.height = '100%';
    inputLayer.style.zIndex = '1';
    inputLayer.style.pointerEvents = 'none';

    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
            if (!isBlocked) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('cell-wrapper');
                wrapper.dataset.row = row;
                wrapper.dataset.col = col;
                wrapper.style.position = 'absolute';

                // Calculate % based positioning
                wrapper.style.left = `${(col / crossword.width) * 100}%`;
                wrapper.style.top = `${(row / crossword.height) * 100}%`;
                wrapper.style.width = `${(1 / crossword.width) * 100}%`;
                wrapper.style.height = `${(1 / crossword.height) * 100}%`;

                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                input.style.width = '100%';
                input.style.height = '100%';
                input.style.textAlign = 'center';
                input.style.fontSize = '18px';
                input.style.fontWeight = 'bold';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.background = 'transparent';
                input.style.pointerEvents = 'auto';
                input.style.zIndex = '2';

                // Keep your event listeners exactly as before:
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (e.target.selectionStart === 0) {
                            const moved = moveToPreviousInput(e.target);
                            if (moved) {
                                moved.value = '';
                                e.preventDefault();
                            }
                        }
                    }
                });

                input.addEventListener('click', (e) => {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    const availableClues = getCluesAtCell(row, col);
                    if (availableClues.length === 0) return;
                    if (selectedClue.row === row && selectedClue.col === col) {
                        const currentIndex = availableClues.findIndex(c =>
                            c.direction === selectedClue.direction && c.number === selectedClue.number
                        );
                        const nextIndex = (currentIndex + 1) % availableClues.length;
                        selectedClue = { ...availableClues[nextIndex], row, col };
                    } else {
                        const acrossFirst = availableClues.find(c => c.direction === 'across') || availableClues[0];
                        selectedClue = { ...acrossFirst, row, col };
                    }
                    highlightClueCells();
                    updateActiveCluePopup();
                });

                input.addEventListener('input', (e) => {
                    const val = e.target.value.toUpperCase();
                    e.target.value = val;
                    if (val.length === 1) {
                        moveToNextInput(e.target);
                    }
                    checkSolution();
                    saveProgress();
                });

                wrapper.appendChild(input);
                inputLayer.appendChild(wrapper);
            }
        }
    }

    container.appendChild(inputLayer);
}



// Auto-advance logic
function moveToNextInput(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    const possibleClues = getCluesAtCell(row, col);
    let activeClue = null;

    if (selectedClue && possibleClues.some(c => c.direction === selectedClue.direction && c.number === selectedClue.number)) {
        activeClue = selectedClue;
    } else if (possibleClues.length > 0) {
        activeClue = possibleClues[0];
    } else {
        return defaultMoveToNextInput(currentInput);
    }

    const clue = crossword.clues[activeClue.direction][activeClue.number];
    const idx = clue.cells.findIndex(([r, c]) => r === row && c === col);

    // Try to find next empty cell inside current clue
    for (let i = idx + 1; i < clue.cells.length; i++) {
        const [nextRow, nextCol] = clue.cells[i];
        const nextInput = document.querySelector(`#puzzle input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput && nextInput.value === '') {
            nextInput.focus();
            return;
        }
    }

    // End of current clue reached, move to next clue
    const nextClue = getNextClue(activeClue);
    if (nextClue) {
        selectedClue = nextClue;
        highlightClueCells();

        const nextClueObj = crossword.clues[nextClue.direction][nextClue.number];
        for (let [nextRow, nextCol] of nextClueObj.cells) {
            const nextInput = document.querySelector(`#puzzle input[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextInput && nextInput.value === '') {
                nextInput.focus();
                return;
            }
        }
    }
}




function moveToPreviousInput(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    const possibleClues = getCluesAtCell(row, col);
    let activeClue = null;

    if (selectedClue && possibleClues.some(c => c.direction === selectedClue.direction && c.number === selectedClue.number)) {
        activeClue = selectedClue;
    } else if (possibleClues.length > 0) {
        activeClue = possibleClues[0];
    } else {
        return defaultMoveToPreviousInput(currentInput);
    }

    const clue = crossword.clues[activeClue.direction][activeClue.number];
    const idx = clue.cells.findIndex(([r, c]) => r === row && c === col);

    // Try to find previous cell inside current clue
    for (let i = idx - 1; i >= 0; i--) {
        const [prevRow, prevCol] = clue.cells[i];
        const prevInput = document.querySelector(`#puzzle input[data-row="${prevRow}"][data-col="${prevCol}"]`);
        if (prevInput) {
            prevInput.focus();
            return;
        }
    }

    // Beginning of clue reached, move to previous clue
    const prevClue = getPreviousClue(activeClue);
    if (prevClue) {
        selectedClue = prevClue;
        highlightClueCells();

        const prevClueObj = crossword.clues[prevClue.direction][prevClue.number];
        for (let i = prevClueObj.cells.length - 1; i >= 0; i--) {
            const [prevRow, prevCol] = prevClueObj.cells[i];
            const prevInput = document.querySelector(`#puzzle input[data-row="${prevRow}"][data-col="${prevCol}"]`);
            if (prevInput) {
                prevInput.focus();
                return;
            }
        }
    }
}



// Build solution row based on solutionMap letters
function buildSolutionRow() {
    const solutionContainer = document.getElementById('solution-container');
    solutionContainer.innerHTML = '';

    const boxSize = 40;  // <-- replace later with dynamic size if desired

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.margin = '20px auto';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '5px';

    const label = document.createElement('div');
    label.innerText = 'Lösungswort:';
    label.style.fontSize = `${boxSize * 0.45}px`;
    label.style.fontWeight = 'bold';
    label.style.marginRight = '10px';
    wrapper.appendChild(label);

    const sortedLetters = Object.keys(crossword.solutionMap).sort();

    sortedLetters.forEach(letter => {
        const box = document.createElement('div');
        box.style.position = 'relative';
        box.style.width = `${boxSize}px`;
        box.style.height = `${boxSize}px`;
        box.style.border = '1px solid #333';
        box.style.background = 'white';
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';

        const hint = document.createElement('div');
        hint.innerText = letter;
        hint.style.position = 'absolute';
        hint.style.bottom = '2px';
        hint.style.right = '2px';
        hint.style.fontSize = `${boxSize * 0.4}px`;
        hint.style.color = '#003399';
        hint.style.fontWeight = '900';
        box.appendChild(hint);

        const input = document.createElement('input');
        input.maxLength = 1;
        input.dataset.solutionLetter = letter;
        input.style.position = 'absolute';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.fontSize = `${boxSize * 0.45}px`;
        input.style.textAlign = 'center';
        input.style.fontWeight = 'bold';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        box.appendChild(input);

        wrapper.appendChild(box);
    });

    solutionContainer.appendChild(wrapper);
}




// Update the solution row
function checkSolution() {
    const sortedLetters = Object.keys(crossword.solutionMap).sort();

    sortedLetters.forEach(letter => {
        const [row, col] = crossword.solutionMap[letter];
        const matchingInput = document.querySelector(`#puzzle input[data-row="${row}"][data-col="${col}"]`);
        const value = matchingInput && matchingInput.value ? matchingInput.value.toUpperCase() : '';

        const solutionInput = document.querySelector(`input[data-solution-letter="${letter}"]`);
        if (solutionInput) solutionInput.value = value;
    });
}

function saveProgress() {
    const allInputs = document.querySelectorAll('#puzzle input');
    const data = {};

    allInputs.forEach(input => {
        const key = `${input.dataset.row},${input.dataset.col}`;
        data[key] = input.value || '';
    });

    localStorage.setItem('crosswordProgress', JSON.stringify(data));
}

function loadProgress() {
    const stored = localStorage.getItem('crosswordProgress');
    if (!stored) return;

    const data = JSON.parse(stored);

    for (const key in data) {
        const [row, col] = key.split(',').map(Number);
        const input = document.querySelector(`#puzzle input[data-row="${row}"][data-col="${col}"]`);
        if (input) {
            input.value = data[key];
        }
    }

    checkSolution();
}


function getCluesAtCell(row, col) {
    const clues = [];

    for (let num in crossword.clues.across) {
        const clue = crossword.clues.across[num];
        if (clue.cells.some(([r, c]) => r === row && c === col)) {
            clues.push({ direction: 'across', number: num });
        }
    }

    for (let num in crossword.clues.down) {
        const clue = crossword.clues.down[num];
        if (clue.cells.some(([r, c]) => r === row && c === col)) {
            clues.push({ direction: 'down', number: num });
        }
    }

    return clues;
}
function getClueOrder() {
    const allClues = [];

    for (let num in crossword.clues.across) {
        allClues.push({ direction: 'across', number: num });
    }

    for (let num in crossword.clues.down) {
        allClues.push({ direction: 'down', number: num });
    }

    allClues.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    return allClues;
}
function getNextClue(activeClue) {
    const clueOrder = getClueOrder();
    const idx = clueOrder.findIndex(c => c.direction === activeClue.direction && c.number === activeClue.number);
    if (idx >= 0 && idx < clueOrder.length - 1) {
        return clueOrder[idx + 1];
    }
    return null;
}
function getPreviousClue(activeClue) {
    const clueOrder = getClueOrder();
    const idx = clueOrder.findIndex(c => c.direction === activeClue.direction && c.number === activeClue.number);
    if (idx > 0) {
        return clueOrder[idx - 1];
    }
    return null;
}



function highlightClueCells() {
    document.querySelectorAll('#puzzle .cell-wrapper').forEach(wrapper => wrapper.classList.remove('highlighted'));

    if (!selectedClue.direction || !selectedClue.number) return;

    const clue = crossword.clues[selectedClue.direction][selectedClue.number];
    clue.cells.forEach(([r, c]) => {
        const wrapper = document.querySelector(`#puzzle .cell-wrapper[data-row="${r}"][data-col="${c}"]`);
        if (wrapper) wrapper.classList.add('highlighted');
    });

    // Update sidebar active state
    document.querySelectorAll('#clue-sidebar .clue-item').forEach(item => item.classList.remove('active'));

    const activeSidebarItem = document.querySelector(`#clue-sidebar .clue-item[data-direction="${selectedClue.direction}"][data-number="${selectedClue.number}"]`);
    if (activeSidebarItem) {
        activeSidebarItem.classList.add('active');
    }

    updateActiveCluePopup();
}


function updateActiveCluePopup() {
    const popup = document.getElementById('active-clue-popup');

    if (!selectedClue.direction || !selectedClue.number) {
        popup.style.display = 'none';
        return;
    }

    const clue = crossword.clues[selectedClue.direction][selectedClue.number];
    const clueText = clue.text || 'Hinweis nicht gefunden';

    popup.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">
            In welchem Bundesland werden diese Feste gefeiert?
        </div>
        <div>
            ${selectedClue.number}. ${clueText}
        </div>
    `;
    popup.style.display = 'block';
}





document.addEventListener("DOMContentLoaded", function () {
    buildGrid();
    buildSidebar();
    loadProgress();
});
