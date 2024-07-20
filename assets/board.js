const colsAndRows = 20
const goalsPerLevel = 10
const readable = {
	level: "Level",
	moveCount: "Moves",
	goalCount: 'Goals'
}

function transitionInOut(selection, duration, toStyle) {
	return selection.transition()
		.duration(duration)
		.style('transform', toStyle)
	.transition()
		.duration(duration)
		.style('transform', '')
}

function blink(selection, total = 2, count = 0) {
	return transitionInOut(selection, 150, 'scale(1.1)')
	.on('end', () => {
		if (total >= count) {
			count++
			blink(selection, total, count)
		}
	})
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

		this.boardCells.append('span').classed('box', true)

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
		d3.selectAll('.visited').classed('util', true).classed('anchor-down anchor-up', false)
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				cell.clear()

				if (cell.row < lowerlimit || cell.column < lowerlimit || cell.row > upperlimit || cell.column > upperlimit) {
					cell.visited = true
				}

				if (cell.row === lowerlimit && cell.column === lowerlimit) {
					this.playerCell?.leave()
					this.playerCell = cell.visit()
					this.placePlayer()
				}
			})
		})

		// this.boardCells.classed('anchor-down anchor-up util', false)
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

		this.update()
		blink(d3.selectAll('.with-goal'))
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
		this.boardCells
		.classed('visited', c => c.visited)
		.classed('with-goal', c => c.hasGoal)

		this.scoreboard.text(s => `${readable[s]}: ${this[s]}`)
	}

	movePlayer(key) {
		let nextRow = this.playerCell.row
		let nextCol = this.playerCell.column
		let anchor = key.replace('Arrow','').toLowerCase()
		let translateX = 0
		let translateY = 0

		switch (key) {
		case 'ArrowRight':
			nextCol++;
			translateX = 1;
			break;
		case 'ArrowLeft':
			nextCol--;
			translateX = -1
			break;
		case 'ArrowUp':
			nextRow--;
			translateY = -1
			break;
		case 'ArrowDown':
			nextRow++;
			translateY = 1
		}

		const nextCell = this.cells[nextRow]?.[nextCol]
		const playerNode = this.player.node()
		const moveSize = playerNode.clientWidth * (nextCell?.isAvailable ? -1 : 0.3)
		const translation = `translate(${translateX * moveSize}px, ${translateY * moveSize}px)`

		if (nextCell?.isAvailable) {
			const hadGoal = nextCell.hasGoal
			this.playerCell.leave()
			this.playerCell = nextCell.visit()
			this.moveCount++
			this.placePlayer(translation, anchor)
			hadGoal && this.reachGoal()
			this.update()
		} else {
			transitionInOut(this.player, 250, translation)
		}
	}

	placePlayer(translation = '', anchor='left') {
		const playerCellRef = this.boardCells.filter(d => d === this.playerCell)
		this.player?.remove()

		this.player = playerCellRef.append('span')
			.classed('player', true)
			.style('transform', translation)


		playerCellRef.classed(`anchor-${anchor}`, true)
		this.player.transition()
			.duration(150)
			.ease(d3.easeQuadOut)
			.style('transform','')
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

}
