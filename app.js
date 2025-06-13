const cellSize = 40;
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
    container.style.maxWidth = '90vw';
    container.style.margin = 'auto';

    // Create two SVG layers
    const svgGrid = document.createElementNS(svgNS, "svg");
    const svgText = document.createElementNS(svgNS, "svg");

    const viewBox = `0 0 ${crossword.width * cellSize} ${crossword.height * cellSize}`;
    [svgGrid, svgText].forEach(svg => {
        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
    });

    svgGrid.style.zIndex = '0';
    svgText.style.zIndex = '1';  // IMPORTANT: text layer above inputs

    // Draw rectangles
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
            svgGrid.appendChild(rect);
        }
    }

    // Draw clue numbers
    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
            if (!isBlocked) {
                const num = crossword.numbers[`${row},${col}`];
                if (num) {
                    if ('down' in num) {
                        const downText = document.createElementNS(svgNS, "text");
                        downText.setAttribute("x", col * cellSize + 3);
                        downText.setAttribute("y", row * cellSize + 10);
                        downText.setAttribute("font-size", "12px");
                        downText.textContent = `${num.down}↓`;
                        svgText.appendChild(downText);
                    }
                    if ('across' in num) {
                        const acrossText = document.createElementNS(svgNS, "text");
                        acrossText.setAttribute("x", col * cellSize + 3);
                        acrossText.setAttribute("y", (row + 1) * cellSize - 5);
                        acrossText.setAttribute("font-size", "12px");
                        acrossText.textContent = `${num.across}→`;
                        svgText.appendChild(acrossText);
                    }
                }
            }
        }
    }

    // Draw solution letters
    for (const [letter, pos] of Object.entries(crossword.solutionMap)) {
        const [row, col] = pos;
        const sol = document.createElementNS(svgNS, "text");
        sol.setAttribute("x", col * cellSize + cellSize * 0.85);
        sol.setAttribute("y", row * cellSize + cellSize * 0.85);
        sol.setAttribute("font-size", "24px");
        sol.setAttribute("fill", "#00339980");
        sol.setAttribute("font-weight", "900");
        sol.setAttribute("text-anchor", "end");
        sol.textContent = letter;
        svgText.appendChild(sol);
    }

    // Create highlight layer
const highlightLayer = document.createElementNS(svgNS, "g");
highlightLayer.setAttribute("id", "highlightLayer");
svgGrid.appendChild(highlightLayer);


    // Append in correct stacking order
    container.appendChild(svgGrid);
    createInputs(svgText, cellSize);
    container.appendChild(svgText);    
    puzzleWrapper.appendChild(container);

    const renderedPuzzleWidth = container.getBoundingClientRect().width;
    const actualCellSize = renderedPuzzleWidth / crossword.width

    buildSolutionRow(cellSize);
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
function createInputs(svgText, cellSize) {
    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
            if (!isBlocked) {
                const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
                foreignObject.setAttribute("x", col * cellSize);
                foreignObject.setAttribute("y", row * cellSize);
                foreignObject.setAttribute("width", cellSize);
                foreignObject.setAttribute("height", cellSize);

                const input = document.createElement("input");
                input.type = "text";
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                input.style.width = '100%';
input.style.height = '100%';
input.style.fontSize = (cellSize * 0.8) + 'px';
input.style.fontWeight = '500';
input.style.textAlign = 'center';
input.style.lineHeight = '1';
input.style.verticalAlign = 'middle';
input.style.border = 'none';
input.style.outline = 'none';
input.style.background = 'transparent';
input.style.padding = '0';
input.style.margin = '0';


                input.style.pointerEvents = "auto";

        
                const XHTML_NS = "http://www.w3.org/1999/xhtml";
                const inputWrapper = document.createElementNS(XHTML_NS, "div");
                inputWrapper.appendChild(input);

                foreignObject.appendChild(inputWrapper);
                svgText.appendChild(foreignObject);

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
            }
        }
    }
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
function buildSolutionRow(cellSize) {
    const solutionContainer = document.getElementById('solution-container');
    solutionContainer.innerHTML = '';

    const boxSize = cellSize;

    // Create label container
    const label = document.createElement('div');
    label.innerText = 'Lösungswort:';
    label.style.fontSize = `${boxSize * 0.45}px`;
    label.style.fontWeight = 'bold';
    label.style.textAlign = 'center';
    label.style.marginBottom = '10px';
    solutionContainer.appendChild(label);

    // Create wrapper for the boxes
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.margin = '0 auto';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '5px';
    wrapper.style.maxWidth = '90vw';
    wrapper.style.aspectRatio = `${crossword.width} / 1`;
    wrapper.style.width = '100%';

    const sortedLetters = Object.keys(crossword.solutionMap).sort();

    sortedLetters.forEach(letter => {
        const box = document.createElement('div');
        box.style.position = 'relative';
        box.style.width = `3vh`;
        box.style.height = `3vh`;
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
        hint.style.color = '#00339980';
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
        input.style.fontWeight = '500';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        input.style.padding = '0';
        input.style.margin = '0';
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
    const highlightLayer = document.getElementById("highlightLayer");
    // Clear previous highlights
    while (highlightLayer.firstChild) {
        highlightLayer.removeChild(highlightLayer.firstChild);
    }

    if (!selectedClue.direction || !selectedClue.number) return;

    const clue = crossword.clues[selectedClue.direction][selectedClue.number];
    clue.cells.forEach(([r, c]) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", c * cellSize);
        rect.setAttribute("y", r * cellSize);
        rect.setAttribute("width", cellSize);
        rect.setAttribute("height", cellSize);
        rect.setAttribute("fill", "#cce5ff");
rect.setAttribute("stroke", "#333");  // match grid stroke
rect.setAttribute("stroke-width", "1");

        highlightLayer.appendChild(rect);
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
    popup.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    popup.style.opacity = 0;
    popup.style.transform = 'scale(0.95)';

    setTimeout(() => {
        popup.innerHTML = `
            <div style="
                font-weight: bold; 
                margin-bottom: 10px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
            ">
                <span style="font-size: 10px; margin-right: 8px;">💡</span>
                <span>In welchem Bundesland werden diese Feste gefeiert?</span>
            </div>
            <div style="
                display: flex;  
                justify-content: center;
                align-items: center; 
                font-size: 12px;
            ">
                ${selectedClue.number}. ${clueText}
            </div>
        `;

        popup.style.display = 'block';

        requestAnimationFrame(() => {
            popup.style.opacity = 1;
            popup.style.transform = 'scale(1)';
        });
    }, 150);
}







document.addEventListener("DOMContentLoaded", function () {
    buildGrid();
    buildSidebar();
    loadProgress();
    const popup = document.getElementById('active-clue-popup');
    popup.style.display = 'none';
});
