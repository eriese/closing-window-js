const colsAndRows = 20
const goalsPerLevel = 10
const readable = {
	level: "Level",
	moveCount: "Moves",
	goalCount: 'Goals'
}
class Board {
	currentGoals = []
	level = 1
	moveCount = 0
	goalCount = 0
	cells
	playerCell
	startScreen
	boardRows
	boardCells
	scoreboard

	get stats() {
		return [
			'level',
			'moveCount',
			'goalCount'
		]
	}

	constructor() {
		this.cells = Array.from({length: colsAndRows}, (_, i) => Array.from({length: colsAndRows}, (_, j) => new Cell(i, j)))
		this.boardRows = d3.select('.board-container')
			.append('table')
			.classed('board', true)
		  .selectAll("tr")
		  .data(this.cells)
		  .join("tr")

		this.boardCells = this.boardRows.selectAll("td")
		  .data(r => r)
		  .join('td')

		this.scoreboard = d3.select('.scoreboard')
			.selectAll('div')
			.data(this.stats)
			.join('div')
			.attr('class', k=>k)

		this.setupLevel()
		this.update()
	}

	setupLevel() {
		const level = this.level
		this.goalCount = 0

		const lowerlimit = level - 1
		const upperlimit = colsAndRows - level
		// reset all the squares according to the level
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				cell.clear()

				if (cell.row < lowerlimit || cell.column < lowerlimit || cell.row > upperlimit || cell.column > upperlimit) {
					cell.visited = true
				}

				if (cell.row === lowerlimit && cell.column === lowerlimit) {
					this.playerCell = cell
					cell.hasPlayer = true
				}
			})
		})

		this.setGoals()
	}

	setGoals() {
		this.currentGoals.forEach(c => c.hasGoal = false)

		this.currentGoals = []
		const allCells = this.cells.flat().filter(c => c.isAvailable)
		for (let i = 0; i < 3; i++) {
			let cellIndex = Math.floor(Math.random() * allCells.length)
			let cell = allCells[cellIndex]
			cell.hasGoal = true;
			this.currentGoals.push(cell)
		}
	}

	reachGoal() {
		this.goalCount++
		if (this.goalCount === goalsPerLevel) {
			this.level++
			this.setupLevel()
		} else {
			this.setGoals()
		}
	}

	update() {
		this.boardCells.classed('visited', c => c.visited)
		.classed('with-goal', c => c.hasGoal)
		.classed('with-player', c => c.hasPlayer)

		this.scoreboard.text(s => `${readable[s]}: ${this[s]}`)
	}

	movePlayer(key) {
		let nextRow = this.playerCell.row
		let nextCol = this.playerCell.column

		switch (key) {
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

		const nextCell = this.cells[nextRow]?.[nextCol]
		if (nextCell?.isAvailable) {
			this.playerCell.visit()
			this.playerCell = nextCell
			nextCell.hasPlayer = true
			this.moveCount++
		}

		nextCell?.hasGoal && this.reachGoal()

		this.update()
	}

	reset() {
		this.level = 1
		this.goalCount = 0
		this.moveCount = 0
		this.setupLevel()
		this.update()
	}

	hide() {
		d3.selectAll('.board-container, .expo').classed('hidden', true)
	}

	show() {
		d3.selectAll('.board-container, .expo').classed('hidden', false)
	}

	startScreen() {
	}
}
