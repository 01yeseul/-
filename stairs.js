const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const bird = new Image()
const bg = new Image()
const tile = new Image()

bird.src = "images/bird.png"
bg.src = "images/bg.png"
tile.src = "images/pipeSouth.png"

document.addEventListener("keydown", e => {
  console.log(e.keyCode)
  switch (e.keyCode) {
    case 38: // up
      console.log("up")
      up()
      break
    case 32: // space bar
      console.log("switch direction")
      changeDirection()
      up()
      break
  }
})

const stoneWidth = 40
const stoneHeight = 20
const stones = [
  {
    x: 100,
    y: 300
  },
  {
    x: 100 - stoneWidth,
    y: 300 - stoneHeight
  }
]
// console.log(Math.floor(400 / stoneHeight + 1))
for (let i = 0; i < Math.floor(400 / stoneHeight + 1); i++) {
  addNewStone()
}

let direction = -1

function up() {
  stones.forEach(stone => {
    stone.x += -1 * direction * stoneWidth
    stone.y += stoneHeight
  })
  addNewStone()
}

function changeDirection() {
  direction = direction === 1 ? -1 : 1
}

function addNewStone() {
  let lastStone = stones[stones.length - 1]
  let d = Math.random() < 0.5 ? -1 : 1
  stones.push({
    x: lastStone.x + d * stoneWidth,
    y: lastStone.y - stoneHeight
  })
}

function draw() {
  ctx.drawImage(bg, 0, 0)

  for (let stone of stones) {
    ctx.fillStyle = "black"
    ctx.fillRect(stone.x, stone.y, stoneWidth, stoneHeight)
  }

  // save the unrotated context of the canvas so we can restore it later
  // the alternative is to untranslate & unrotate after drawing
  ctx.save()
  // flip the canvas to the specified direction
  ctx.scale(direction, 1)
  // draw the image
  // since the context is rotated, the image will be scaled also
  let x = direction === 1 ? direction * 100 : direction * 100 - bird.width
  ctx.drawImage(bird, x, 270)
  // we’re done with the scaling so restore the unrotated context
  ctx.restore()

  //   ctx.drawImage(bird, 100, 270)

  requestAnimationFrame(draw)
}

draw()
