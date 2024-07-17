// meta variables
let state = 0, 	// current game state
	count = 0, 		// number of games played
	highTime = 0, // best time
	highMove = 0, // best move count
	highLevel = 0 // best level reached

window.onload = () => {

// set up the board
const board = new Board()
board.hide()
window.addEventListener('keydown', e => {
	switch (state) {
	case 0:
	case 2:
		if (e.code.startsWith('Arrow')) {
			state = 1;
			d3.selectAll('.game-state').classed('hidden', true)
			board.show()
		}
	break;
	case 1:
		if (e.code === 'Space') {
			board.hide()
			d3.select('.post-game').classed('hidden', false)
			board.reset()
			state++
		} else {
			board.movePlayer(e.code)
		}
	break;
	}
})

}

