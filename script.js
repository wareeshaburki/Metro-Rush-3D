const game = document.getElementById("game");
const character = document.getElementById("character");
const distanceDisplay = document.getElementById("distance");
const coinsDisplay = document.getElementById("coins");
const highScoreDisplay = document.getElementById("highScore");
const finalScoreDisplay = document.getElementById("finalScore");
const gameOverScreen = document.getElementById("gameOverScreen");

let distance = 0;
let coins = 0;
let highScore = localStorage.getItem("highScore") || 0;
let speed = 4;
let obstacles = [];
let coinItems = [];
let gameRunning = true;

const characterWidth = 75;
const obstacleWidth = 30;
const coinWidth = 22;
const laneWidth = game.clientWidth / 3;

const characterLanePositions = [];
for(let i = 0; i < 3; i++){
  characterLanePositions.push(i * laneWidth + (laneWidth - characterWidth) / 2);
}

let characterCurrentLane = 1;
let isJumping = false;
const jumpHeight = 90;
const jumpDuration = 700;
const originalCharacterBottom = 40;
const jumpBufferTime = 100;
let jumpEndTime = 0;
let colors = ["#555", "#4a1101", "#2392b7", "#1ddbe9"];
let currentColorIndex = 0;

function changeBackgroundColor(){
  currentColorIndex = (currentColorIndex + 1) % colors.length;
  document.documentElement.style.setProperty(
    "--gradient-color",
    colors[currentColorIndex]
  );
}

window.addEventListener("load",() =>{
  character.style.left = characterLanePositions[characterCurrentLane] + "px";
  character.style.bottom = originalCharacterBottom + "px";
  document.documentElement.style.setProperty(
    "--gradient-color",
    colors[currentColorIndex]
  );
  document.getElementById("bgMusic").play();
});

function jump(){
  if (!gameRunning || isJumping){
    return;
  }
  isJumping = true;
  jumpEndTime = performance.now() + jumpDuration + jumpBufferTime;
  document.getElementById("jumpSound").play();
  character.style.transition = `bottom ${jumpDuration / 2}ms ease-out`;
  character.style.bottom = originalCharacterBottom + jumpHeight + "px";
  setTimeout(() => {
    character.style.transition = `bottom ${jumpDuration / 2}ms ease-in`;
    character.style.bottom = originalCharacterBottom + "px";
    setTimeout(() => {
      character.style.transition = "";
      isJumping = false;
    }, jumpDuration / 2);
  }, jumpDuration / 2);
}

function moveLeft() {
  if (!gameRunning){
    return;
  }
  if (characterCurrentLane > 0) {
    characterCurrentLane--;
    character.style.left = characterLanePositions[characterCurrentLane] + "px";
  }
}

function moveRight() {
  if(!gameRunning){
    return;
  }
  if (characterCurrentLane < 2) {
    characterCurrentLane++;
    character.style.left = characterLanePositions[characterCurrentLane] + "px";
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowUp") jump();
});

document.getElementById("leftButton").addEventListener("click", moveLeft);
document.getElementById("upButton").addEventListener("click", jump);
document.getElementById("rightButton").addEventListener("click", moveRight);

function createObstacle() {
  if (!gameRunning) {
    return;
  }
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  let lane = Math.floor(Math.random() * 3);
  const obstacleLeft = lane * laneWidth + (laneWidth - obstacleWidth) / 2;
  obstacle.style.left = obstacleLeft + "px";
  obstacle.style.top = "-50px";
  game.appendChild(obstacle);
  obstacles.push(obstacle);
}

function createCoin() {
  if (!gameRunning) {
    return;
  }
  const coin = document.createElement("div");
  coin.classList.add("coin");
  let lane = Math.floor(Math.random() * 3);
  const coinLeft = lane * laneWidth + (laneWidth - coinWidth) / 2;
  coin.style.left = coinLeft + "px";
  coin.style.top = "-30px";
  game.appendChild(coin);
  coinItems.push(coin);
}

function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    let top = parseInt(
      window.getComputedStyle(obstacle).getPropertyValue("top")
    );
    if (top > game.clientHeight) {
      obstacle.remove();
      obstacles.splice(index, 1);
    } else {
      obstacle.style.top = top + speed + "px";
    }
  });
}

function moveCoins() {
  coinItems.forEach((coin, index) => {
    let top = parseInt(window.getComputedStyle(coin).getPropertyValue("top"));
    if (top > game.clientHeight) {
      coin.remove();
      coinItems.splice(index, 1);
    } else {
      coin.style.top = top + speed + "px";
    }
  });
}

function checkCollision() {
  if (isJumping && performance.now() > jumpEndTime) {
    isJumping = false;
  }
  const charRect = character.getBoundingClientRect();
  obstacles.forEach((obstacle) => {
    if (isJumping) {
      return;
    }
    const obsRect = obstacle.getBoundingClientRect();
    if (
      !(
        charRect.top > obsRect.bottom ||
        charRect.bottom < obsRect.top ||
        charRect.right < obsRect.left ||
        charRect.left > obsRect.right
      )
    ) {
      endGame();
    }
  });

  for (let i = coinItems.length - 1; i >= 0; i--) {
    const coin = coinItems[i];
    const coinRect = coin.getBoundingClientRect();
    if (
      !(
        charRect.top > coinRect.bottom ||
        charRect.bottom < coinRect.top ||
        charRect.right < coinRect.left ||
        charRect.left > coinRect.right
      )
    ) {
      coins++;
      coinsDisplay.textContent = coins;
      document.getElementById("coinSound").play();
      coin.remove();
      coinItems.splice(i, 1);
    }
  }
}

function endGame() {
  if (!gameRunning) {
    return;
  }
  gameRunning = false;
  updateHighScore();
  finalScoreDisplay.textContent = coins;
  gameOverScreen.style.display = "block";
}

function updateHighScore() {
  if (coins > highScore) {
    highScore = coins;
    localStorage.setItem("highScore", highScore);
  }
  highScoreDisplay.textContent = highScore;
}

function restartGame() {
  obstacles.forEach((obstacle) => obstacle.remove());
  coinItems.forEach((coin) => coin.remove());
  distance = 0;
  coins = 0;
  speed = 4;
  gameRunning = true;
  distanceDisplay.textContent = "Distance: 0";
  coinsDisplay.textContent = "Coins: 0";
  gameOverScreen.style.display = "none";
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;
  moveObstacles();
  moveCoins();
  checkCollision();
  distance++;
  distanceDisplay.textContent = "Distance: " + distance;
  requestAnimationFrame(gameLoop);
}

setInterval(() => {
  if (gameRunning){
    createObstacle();
  }
}, 1500);
setInterval(() => {
  if (gameRunning){
    createCoin();
  }
}, 1000);
setInterval(changeBackgroundColor, 15000);
gameLoop();
