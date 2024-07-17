// meta variables
let state = 0, 	// current game state
	count = 0, 		// number of games played
	highTime = 0, // best time
	highMove = 0, // best move count
	highLevel = 0 // best level reached

// game variables
const goalsPerLevel = 10
const colsAndRows = 20

let level = 1			// current level
	goalCount = 0,	// number of goals completetd on current level
	moveCount = 0,	// number of moves
	time = 0,				// time
	currentGoals = [], // the cells that currently have goals on them
	playerCell = undefined


const board = Array.from({length: colsAndRows}, (_, i) => Array.from({length: colsAndRows}, (_, j) => new Cell(i, j)))

function setupLevel() {
	if (playerCell) {
		playerCell.hasPlayer = false
	}
	const upperlimit = colsAndRows - (level + 1)
	// reset all the squares according to the level
	board.forEach((row) => {
		row.forEach((cell) => {
			if (cell.row < level || cell.column < level || cell.row > upperlimit || cell.column > upperlimit)
				cell.visited = true

			else if (cell.row === level && cell.column === level) {
				cell.hasPlayer = true
				playerCell = cell
			}

			else {
				cell.visited = false
			}
		})
	})

	setGoals()
}

function setGoals() {
	currentGoals.forEach(c => c.hasGoal = false)

	currentGoals = []
	const allCells = board.flat().filter(c => c.isAvailable)
	for (let i = 0; i < 3; i++) {
		let cellIndex = Math.floor(Math.random() * allCells.length)
		let cell = allCells[cellIndex]
		cell.hasGoal = true;
		currentGoals.push(cell)
	}
}

function updateBoard(cells) {
	cells.classed('visited', c => c.visited)
	.classed('with-goal', c => c.hasGoal)
	.classed('with-player', c => c.hasPlayer)
}

setupLevel()

window.onload = () => {

// set up the board
const cells = d3.select('body')
	.append('table')
	.classed('board', true)
  .selectAll("tr")
  .data(board)
  .join("tr")
  .selectAll("td")
  .data(r => r)
  .join('td')

updateBoard(cells)

window.addEventListener('keydown', e => {
	let nextRow = playerCell.row
	let nextCol = playerCell.column

	switch (e.key) {
	case 'ArrowRight':
		nextCol++;
		break;
	case 'ArrowLeft':
		nextCol--;
		break;
	case 'ArrowUp':
		nextRow--;
		break;
	case 'ArrowDown':
		nextRow++;
	}

	const nextCell = board[nextRow][nextCol]
	if (nextCell.isAvailable) {
		playerCell.visited = true
		playerCell.hasPlayer = false
		playerCell = nextCell
		nextCell.hasPlayer = true
		moveCount++
	}

	if (nextCell.hasGoal) {
		goalCount++

		if (goalCount === goalsPerLevel) {
			level++
			setupLevel()
			return
		} else {
			setGoals()
		}
	}

	updateBoard(cells)
})

}

