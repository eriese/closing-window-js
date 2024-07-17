class Cell {
	row
	column
	visited
	hasGoal

	constructor(row, column) {
		this.row = row
		this.column = column
		this.visited = false
		this.hasGoal = false
		this.hasPlayer = false
	}

	get isAvailable() {
		return !this.visited && !this.hasPlayer
	}
}
