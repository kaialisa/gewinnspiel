# Crossword Builder

This project contains:

- The playable crossword puzzle (`index.html`, `app.js`, `data.js`)
- A helper tool to build and export crossword grids (`grid-helper.html`)

---

## How to build a new crossword

1. Open `grid-helper.html`.
2. Define your crossword grid by clicking cells to block/unblock them.
3. Right-click a cell (highlighted red) and scroll down to assign it a clue number and direction. This will define that column or row. 
4. When you're finished, click **Export to JSON**.
5. Copy this data into the data.js converter.
5. Copy the generated content into `data.js`:
6. The main puzzle (`index.html`) will automatically load from `data.js`.
