const colsAndRows = 20
const goalsPerLevel = 10

const readable = {
	level: "Level",
	moveCount: "Moves",
	goalCount: 'Goals'
}

const directions = {
	'up': 'top',
	'down': 'bottom',
	'left': 'left',
	'right': 'right'
}

function transitionOut(transition, styleKey) {
	if (styleKey) {
		return transition
			.style(styleKey, '0%')
			.transition()
				.duration(0)
				.style(styleKey, null)
	}

	return transition
}

function blink(selection, total = 2, count = 0) {
	selection.transition()
		.duration(150)
	 	.style('transform', 'scale(1.1)')
	 	.transition()
	 	.duration(150)
	 	.style('transform', 'scale(1)')
	.on('end', () => {
		if (total >= count) {
			count++
			blink(selection, total, count)
		} else {
			selection.style('transform', null)
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

		this.boardCells = d3.select('.board-container')
			.append('table')
			.classed('board', true)
		  .selectAll("tr")
		  .data(this.cells)
		  .join("tr")
		  .selectAll("td")
			.data(r => r)
			.join('td')

		this.scoreboard = d3.select('.scoreboard')
			.selectAll('div')
			.data(this.stats)
			.join('div')
			.attr('class', k=>k)
	}

	setupLevel() {
		this.goalCount = 0
		const level = this.level
		const lowerlimit = level - 1
		const upperlimit = colsAndRows - level

		// reset all the squares according to the level
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				cell.clear()

				// close the window
				if (cell.row < lowerlimit || cell.column < lowerlimit || cell.row > upperlimit || cell.column > upperlimit) {
					cell.visited = true
				}

				// place the player in the top left corner
				if (cell.row === lowerlimit && cell.column === lowerlimit) {
					this.playerCell?.leave()
					this.playerCell = cell.visit()
				}
			})
		})

		this.setGoals()
		this.update('right')
	}

	setGoals() {
		// clear old goals
		this.currentGoals.forEach(c => c.hasGoal = false)

		// make new goals randomly placed among available cells
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
			return true
		} else {
			this.setGoals()
			return false
		}
	}

	updateBoxes(dir, t) {
		const leaveStyle = dir?.match(/(up|down)/) ? 'height' : 'width'
		// add the boxes
		this.boardCells.selectAll('span.box')
			.data(c => {
				if (c.hasPlayer) return []
					if (c.visited) return []
					// only put a box if it's not visited or holding the player
						return [`box ${c.proximity(this.playerCell) || ''}`]
				})
			.join(
				// add a span and animate its width in
				enter => enter.append('span')
				.attr('class', d => d)
				.classed('box', true)
				.call(enter => enter
					.style('width', '0%')
					.transition(t)
					.style('width', '100%')
					),
				// set the appropriate class (handles proximity classes which are used during exit)
				update => update.attr('class', d => d),
				// animate only cells that are not already being animated out
				exit => exit.filter(':not(.leaving)')
				.classed('leaving', true)
				.style(leaveStyle, '100%')
				.transition(t)
				.style(leaveStyle, '0%')
				.remove()
			)
	}

	updateGoals() {
		// add the goals
		this.boardCells.selectAll('span.goal')
			.data(c => c.hasGoal ? [true] : [])
			//blink on entry
			.join(enter => enter.append('span')
				.classed('goal', true)
				.call(s => blink(s))
			)
	}

	updatePlayer(dir, t) {
		const direction = directions[dir]
		// add the player
		this.player = this.boardCells.selectAll('span.player')
			// only one cell has the player
			.data(c => c.hasPlayer ? [true] : [])
			.join(
				// enter is called when it moves
				// so we animate the movement
				enter => enter.append('span')
					.attr('class', `player`)
					.style(direction, '100%')
					.transition()
					.duration(150)
					.call(transitionOut, direction),
				// update is called when it can't move, so we animate the hesistation
				update => update.transition(t)
					.style(direction, '-25%')
					.transition(t)
					.call(transitionOut, direction)
			)
	}

	update(dir) {
		const t = this.boardCells.transition()
			.duration(300)
			.ease(d3.easeQuadInOut)

		this.updateBoxes(dir, t)
		this.updateGoals()
		this.updatePlayer(dir, t)

		// update the scoreboard
		this.scoreboard.text(s => `${readable[s]}: ${this[s]}`)
	}

	movePlayer(key) {
		let nextRow = this.playerCell.row
		let nextCol = this.playerCell.column
		let anchor = key.replace('Arrow','').toLowerCase()

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
			const hadGoal = nextCell.hasGoal
			this.playerCell.leave()
			this.playerCell = nextCell.visit()
			this.moveCount++
			if (hadGoal && this.reachGoal()) return
		}

		this.update(anchor)
	}

	reset() {
		this.level = 1
		this.goalCount = 0
		this.moveCount = 0
		this.setupLevel()
	}

	hide() {
		d3.selectAll('.board-container, .expo').classed('hidden', true)
	}

	show() {
		d3.selectAll('.board-container, .expo').classed('hidden', false)
		this.reset()
	}

}
