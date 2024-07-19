// meta variables
let state = 0, 	// current game state
	count = 0, 		// number of games played
	highTime = 0, // best time
	highMove = 0, // best move count
	highLevel = 0 // best level reached

function is_touch_enabled() {
	return ( 'ontouchstart' in window ) ||
	( navigator.maxTouchPoints > 0 ) ||
	( navigator.msMaxTouchPoints > 0 );
}

const counterUrl = "https://simple-counter-eriese-erieses-projects.vercel.app/count?source=Closing Window";
const fetchOpts = {
  method: "PUT",
  headers: {
  	Authorization: 'Basic ZW5vY2g6anVzdEFkZGluZ1RvVGhlUGlsZQ==' // semi insecure, but this server is basically just a counting engine and it validates the origin
  }
}
window.onload = () => {
if (!localStorage.getItem('cw-visited')) {
  fetch(counterUrl + '&name=Unique Visitors', fetchOpts).then(r => {
  	if (r.status === 200) {
  		localStorage.setItem('cw-visited', true)
  	}
  }).catch(e => console.log(e)) // don't care much about the error
}

d3.selectAll('.game-state .btn')
	.on('click', e => {
		e.preventDefault();
		state = 1;
		d3.selectAll('.game-state').classed('hidden', true)
		board.show()
		fetch(counterUrl + '&name=Game Plays', fetchOpts
	  ).catch(e => console.log(e))
	})

d3.select('.expo .quit')
	.on('click', e => {
		e.preventDefault()
		state = 2;
		board.hide()
		d3.select('.post-game').classed('hidden', false)
		board.reset()
		state++
	})

// set up the board
const board = new Board()
board.hide()
window.addEventListener('keydown', e => {
	if (state === 1 && e.code.startsWith('Arrow')) {
		board.movePlayer(e.code)
	}
})

d3.selectAll('button.ctrl')
	.on('click', e => {
		e.preventDefault()
		board.movePlayer(`Arrow${e.currentTarget.getAttribute('arrow-type')}`)
	})

// let touchstartX = 0
// let touchstartY = 0
// let touchendX = 0
// let touchendY = 0

// function checkDirection() {
//   const xDir = touchendX - touchstartX
//   const yDir = touchendY - touchstartY

//   const absX = Math.abs(xDir)
//   const absY = Math.abs(yDir)

//   if (Math.max(absX, absY) < 20) return

//   if (absX > absY) {
//   	board.movePlayer(xDir > 0 ? 'ArrowRight' : 'ArrowLeft' )
//   } else {
//   	board.movePlayer(yDir > 0 ? 'ArrowDown' : 'ArrowUp')
//   }
// }

// document.addEventListener('touchstart', e => {
//   touchstartX = e.changedTouches[0].screenX
//   touchstartY = e.changedTouches[0].screenY
// })

// document.addEventListener('touchend', e => {
//   touchendX = e.changedTouches[0].screenX
//   touchendY = e.changedTouches[0].screenY
//   checkDirection()
// })
}

