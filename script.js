const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const SCALE = 20;               // 每格像素
const COLS = canvas.width / SCALE;
const ROWS = canvas.height / SCALE;
let snake = [];
let dir = {x:1, y:0};
let food = null;
let running = false;
let timer = null;
let speed = 100; // ms

function randPos() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS)
  };
}

function placeFood() {
  let pos;
  do {
    pos = randPos();
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function resetGame() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x:1, y:0};
  placeFood();
  scoreEl.textContent = 0;
  running = false;
  stopLoop();
  draw();
}

function startLoop() {
  if (running) return;
  running = true;
  timer = setInterval(tick, speed);
}

function stopLoop() {
  running = false;
  if (timer) { clearInterval(timer); timer = null; }
}

function tick() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // 撞墙
  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
    gameOver();
    return;
  }
  // 自撞
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // 吃到食物
  if (food && head.x === food.x && head.y === food.y) {
    scoreEl.textContent = parseInt(scoreEl.textContent) + 1;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  stopLoop();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, canvas.height/2 - 30, canvas.width, 60);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束 — 按 重置 或 开始 再试一次', canvas.width/2, canvas.height/2 + 7);
}

function drawGrid() {
  ctx.fillStyle = '#071827';
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function draw() {
  // 背景
  drawGrid();

  // 食物
  if (food) {
    ctx.fillStyle = '#ff3860';
    ctx.fillRect(food.x * SCALE, food.y * SCALE, SCALE, SCALE);
  }

  // 蛇
  ctx.fillStyle = '#3ecf8e';
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    ctx.fillRect(s.x * SCALE, s.y * SCALE, SCALE - 1, SCALE - 1);
  }
}

document.addEventListener('keydown', e => {
  const key = e.key;
  // 防止反向直接掉头
  if ((key === 'ArrowUp' || key === 'w' || key === 'W') && dir.y !== 1) { dir = {x:0,y:-1}; }
  if ((key === 'ArrowDown' || key === 's' || key === 'S') && dir.y !== -1) { dir = {x:0,y:1}; }
  if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && dir.x !== 1) { dir = {x:-1,y:0}; }
  if ((key === 'ArrowRight' || key === 'd' || key === 'D') && dir.x !== -1) { dir = {x:1,y:0}; }
  // 空格切换暂停/开始
  if (key === ' '){ if (running) stopLoop(); else startLoop(); }
});

startBtn.addEventListener('click', startLoop);
pauseBtn.addEventListener('click', () => { if (running) stopLoop(); else startLoop(); });
resetBtn.addEventListener('click', resetGame);

resetGame(); // 初始化并绘制一次
