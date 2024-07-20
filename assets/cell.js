class Cell {
	row
	column
	visited
	hasGoal

	constructor(row, column) {
		this.id = `${row}${column}`
		this.row = row
		this.column = column
		this.visited = false
		this.hasGoal = false
		this.hasPlayer = false
	}

	get isAvailable() {
		return !this.visited && !this.hasPlayer
	}

	clear() {
		this.visited = false
		this.hasGoal = false
		this.hasPlayer = false
		return this
	}

	visit() {
		this.hasGoal = false
		this.visited = true
		this.hasPlayer = true
		return this
	}

	leave() {
		this.hasPlayer = false
		return this
	}
}
