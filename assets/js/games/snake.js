const COLS = 32;
const ROWS = 18;

export function createGame({ width, height }) {
  const cellW = width / COLS;
  const cellH = height / ROWS;
  let snake;
  let direction;
  let nextDirection;
  let food;
  let accumulator;
  let score;
  let gameOver;

  function placeFood() {
    const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
    const free = [];
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
      }
    }
    food = free[Math.floor(Math.random() * free.length)] ?? { x: 2, y: 2 };
  }

  function reset() {
    snake = [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    accumulator = 0;
    score = 0;
    gameOver = false;
    placeFood();
  }

  function update(dt, input) {
    if (gameOver) {
      if (input.isDown('Space')) reset();
      return { score, status: gameOver ? 'FIM — ESPAÇO PARA RECOMEÇAR' : 'A JOGAR' };
    }

    const candidate = input.isDown('ArrowUp', 'KeyW') ? { x: 0, y: -1 }
      : input.isDown('ArrowDown', 'KeyS') ? { x: 0, y: 1 }
      : input.isDown('ArrowLeft', 'KeyA') ? { x: -1, y: 0 }
      : input.isDown('ArrowRight', 'KeyD') ? { x: 1, y: 0 }
      : null;

    if (candidate && !(candidate.x === -direction.x && candidate.y === -direction.y)) nextDirection = candidate;

    accumulator += dt;
    const step = Math.max(0.065, 0.125 - score * 0.0022);
    if (accumulator < step) return { score };
    accumulator = 0;
    direction = nextDirection;

    const head = snake[0];
    const next = { x: head.x + direction.x, y: head.y + direction.y };
    const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
    const hitSelf = snake.some((part) => part.x === next.x && part.y === next.y);
    if (hitWall || hitSelf) {
      gameOver = true;
      return { score, status: 'FIM — ESPAÇO PARA RECOMEÇAR' };
    }

    snake.unshift(next);
    if (next.x === food.x && next.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
    return { score };
  }

  function render(ctx) {
    ctx.fillStyle = '#02070d';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(25,216,255,.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath(); ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath(); ctx.moveTo(0, y * cellH); ctx.lineTo(width, y * cellH); ctx.stroke();
    }

    ctx.fillStyle = '#ff5a9f';
    ctx.shadowColor = '#ff5a9f';
    ctx.shadowBlur = 16;
    ctx.fillRect(food.x * cellW + 7, food.y * cellH + 7, cellW - 14, cellH - 14);

    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#e7fbff' : '#19d8ff';
      ctx.shadowColor = '#19d8ff';
      ctx.shadowBlur = index === 0 ? 18 : 8;
      ctx.fillRect(part.x * cellW + 4, part.y * cellH + 4, cellW - 8, cellH - 8);
    });
    ctx.shadowBlur = 0;

    if (gameOver) overlay(ctx, 'GAME OVER', 'ESPAÇO PARA RECOMEÇAR');
  }

  reset();
  return { update, render, reset };
}

function overlay(ctx, title, subtitle) {
  ctx.fillStyle = 'rgba(0,0,0,.58)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#eaf6ff';
  ctx.font = '900 54px system-ui';
  ctx.fillText(title, ctx.canvas.width / 2, ctx.canvas.height / 2 - 8);
  ctx.fillStyle = '#19d8ff';
  ctx.font = '700 18px system-ui';
  ctx.fillText(subtitle, ctx.canvas.width / 2, ctx.canvas.height / 2 + 34);
}
