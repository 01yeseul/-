class BackGround {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.body = new Image();
    this.body.src = "images/bg.png";
    this.body.width = 300;
    this.body.height = 500;
    this.x = (this.canvas.width - this.body.width) / 2;
    this.y = (this.canvas.height - this.body.height) / 2;
  }

  show() {
    this.ctx.drawImage(this.body, this.x, this.y);
  }
}

class Bird {
  constructor(ctx) {
    this.ctx = ctx;
    this.body = new Image();
    this.body.src = "images/bird.png";
    this.dir = -1;
    this.x = 100;
    this.y = 270;
    this.width = 40;
    this.height = 30;
  }
  
  show() {
    this.ctx.save();
    this.ctx.scale(this.dir, 1);
    let flippedX = this.dir === 1 ? this.dir * this.x : this.dir * this.x - this.body.width;
    this.ctx.drawImage(this.body, flippedX, this.y, this.width, this.height);
    this.ctx.restore();
  }

  changeDirection() {
    this.dir = this.dir === 1 ? -1 : 1;
  }

  isOnStone(stone) {
    let condX = this.x === stone.x;
    let condY = this.y + this.height >= stone.y && this.y + this.height <= stone.y + stone.height;
    return condX && condY;
  }

  fall() {
    this.y += 3;
  }

  isOffScreen() {
    return this.y > 400; // canvas.height
  }
}

class Stone {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 20;
    this.image = new Image();
    this.image.src = "images/stone.png"
  
  }

  show() {
    if (this.image.complete) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // 이미지가 로드되지 않았을 때 대체할 내용
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
      this.ctx.beginPath();
      this.ctx.lineWidth = "1";
      this.ctx.strokeStyle = "black";
      this.ctx.rect(this.x, this.y, this.width, this.height);
      this.ctx.stroke();
    }
  }


  goDown(dir) {
    this.x += -1 * dir * this.width;
    this.y += this.height;
  }

  isOffScreen() {
    return this.y > 400; // canvas.height
  }

  nextStone(array) {
    let dir = Math.random() < 0.5 ? -1 : 1;
    return new Stone(this.ctx, this.x - dir * this.width, this.y - this.height);
  }
}


///////////////////////////////////////////////////
///////////////////////////////////////////////////

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameOn = false;
let bg;
let bird;
let stones;
let startTime;
let popupCount = 0;
const gameDuration = 30000; // 30 seconds in milliseconds

const modal = document.getElementById("myModal");
const modalText = document.getElementById("modalText");
const modalConfirmButton = document.getElementById("modalConfirmButton");
const closeButton = document.querySelector(".close");

function showModal(message, callback) {
  modalText.textContent = message;
  modal.style.display = "block";
  modalConfirmButton.addEventListener("click", function() {
    modal.style.display = "none";
    callback();
  });
  closeButton.addEventListener("click", function() {
    modal.style.display = "none";
  });
}

function setup() {
  console.log("setup game!");
  gameOn = true;
  startTime = Date.now();
  bg = new BackGround(ctx);
  bird = new Bird(ctx);
  stones = [];
  stones[0] = new Stone(ctx, 100, 300);
  stones[1] = new Stone(ctx, 60, 280);

  for (let i = 0; i < 400 / 20; i++) {
    stones.push(stones[stones.length - 1].nextStone(stones));
  }
}

function drawPlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bg.show();
  for (let stone of stones) {
    stone.show();
  }
  bird.show();

  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(0, gameDuration - elapsedTime);
  showTimer(remainingTime);

  if (remainingTime === 0 || !gameOn && bird.isOffScreen()) {
    gameOn = false;
    popupCount++;

    if (popupCount < 3) {
        showModal("이것도 못해?!?!? 다시해봐!", setup);
    } else if (popupCount == 3){
      showModal("잘 좀 해봐! 마지막 기회다!!", setup);
    
    } else {
        showModal("세 번이나 실패한다고? 이걸 끝내야 넘어갈 수 있으니 알아서 하라구~~", function(){
          window.location.href = "stair.html"; 
        });
    }
  }

  if (!gameOn && !bird.isOffScreen()) {
      requestAnimationFrame(drawGameOver);
  } else {
      requestAnimationFrame(drawPlay);
  }
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bg.show();
  for (let stone of stones) {
    stone.show();
  }
  bird.fall();
  bird.show();
  if (!gameOn && bird.isOffScreen()) {
    popupCount++;

    if (popupCount < 3) {
        showModal("이것도 못해?!?!? 다시해봐!",setup);
        setup();
    } else if (popupCount == 3){
        showModal("잘 좀 해봐! 마지막 기회다!!",setup);
        setup();
    } else {
        showModal("세 번이나 실패한다고? 이걸 끝내야 넘어갈 수 있으니 알아서 하라구~~", function() {
          window.location.href = "it.html"; 
        });
        
    }

    requestAnimationFrame(drawPlay);
} else {
    requestAnimationFrame(drawGameOver);
}
}

function showTimer(time) {
  const seconds = Math.floor(time / 1000);
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Time: ${seconds}s`, canvas.width - 150, 50);
}

document.addEventListener("keydown", e => {
  if (gameOn) {
    switch (e.keyCode) {
      case 38: // up
        upAndCheck();
        break;
      case 32: // spacebar
        turnUpAndCheck();
        break;
    }
  }
});

function upAndCheck() {
  let safe = false;
  for (let i = stones.length - 1; i >= 0; i--) {
    stones[i].goDown(bird.dir);
    if (bird.isOnStone(stones[i])) {
      safe = true;
    }
    if (stones[i].isOffScreen()) {
      stones.splice(i, 1);
    }
  }
  if (!safe) {
    gameOn = false;
    console.log("gameover");
  }

  stones.push(stones[stones.length - 1].nextStone(stones));
}

function turnUpAndCheck() {
  bird.changeDirection();
  upAndCheck();
}

setup();
drawPlay();


window.addEventListener('keydown', function(event) {
  // 엔터 키를 눌렀을 때
  if (event.code === 'Enter') {
    // 오디오 재생
    const audio = new Audio('MP_픽셀 아트존.mp3');
    audio.play();
  }
});

