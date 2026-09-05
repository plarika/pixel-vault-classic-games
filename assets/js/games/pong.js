export function createGame({ width, height }) {
  const paddleH = 108;
  const paddleW = 14;
  let playerY;
  let aiY;
  let ball;
  let playerScore;
  let aiScore;
  let finished;

  function serve(direction = Math.random() > 0.5 ? 1 : -1) {
    ball = { x: width / 2, y: height / 2, vx: 330 * direction, vy: (Math.random() * 220) - 110, r: 10 };
  }

  function reset() {
    playerY = height / 2 - paddleH / 2;
    aiY = playerY;
    playerScore = 0;
    aiScore = 0;
    finished = false;
    serve(1);
  }

  function update(dt, input) {
    if (finished) {
      if (input.isDown('Space')) reset();
      return { score: playerScore * 100, status: finished ? 'FIM — ESPAÇO PARA RECOMEÇAR' : 'A JOGAR' };
    }

    const speed = 420;
    if (input.isDown('ArrowUp', 'KeyW')) playerY -= speed * dt;
    if (input.isDown('ArrowDown', 'KeyS')) playerY += speed * dt;
    playerY = clamp(playerY, 0, height - paddleH);

    const aiCenter = aiY + paddleH / 2;
    const error = ball.y - aiCenter;
    aiY += clamp(error, -250 * dt, 250 * dt);
    aiY = clamp(aiY, 0, height - paddleH);

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.y - ball.r <= 0 || ball.y + ball.r >= height) {
      ball.y = clamp(ball.y, ball.r, height - ball.r);
      ball.vy *= -1;
    }

    const playerX = 34;
    const aiX = width - 34 - paddleW;
    if (ball.vx < 0 && intersects(playerX, playerY, paddleW, paddleH, ball)) bounceFromPaddle(playerY, 1);
    if (ball.vx > 0 && intersects(aiX, aiY, paddleW, paddleH, ball)) bounceFromPaddle(aiY, -1);

    if (ball.x < -40) { aiScore += 1; if (aiScore >= 7) finished = true; else serve(1); }
    if (ball.x > width + 40) { playerScore += 1; if (playerScore >= 7) finished = true; else serve(-1); }

    return { score: playerScore * 100, status: finished ? (playerScore > aiScore ? 'VITÓRIA!' : 'DERROTA') : `${playerScore} — ${aiScore}` };
  }

  function bounceFromPaddle(paddleY, direction) {
    const relative = (ball.y - (paddleY + paddleH / 2)) / (paddleH / 2);
    ball.vx = Math.min(Math.abs(ball.vx) * 1.055, 620) * direction;
    ball.vy = relative * 360;
    ball.x += direction * 8;
  }

  function render(ctx) {
    ctx.fillStyle = '#02070d'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(139,92,246,.3)'; ctx.setLineDash([12, 14]); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(width / 2, 20); ctx.lineTo(width / 2, height - 20); ctx.stroke(); ctx.setLineDash([]);
    drawPaddle(ctx, 34, playerY, paddleW, paddleH, '#19d8ff');
    drawPaddle(ctx, width - 34 - paddleW, aiY, paddleW, paddleH, '#8b5cf6');
    ctx.fillStyle = '#f3fbff'; ctx.shadowColor = '#f3fbff'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (finished) overlay(ctx, playerScore > aiScore ? 'VITÓRIA' : 'GAME OVER');
  }

  reset();
  return { update, render, reset };
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function intersects(x, y, w, h, ball) { return ball.x + ball.r >= x && ball.x - ball.r <= x + w && ball.y + ball.r >= y && ball.y - ball.r <= y + h; }
function drawPaddle(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0; }
function overlay(ctx, title) { ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 54px system-ui';ctx.fillText(title,ctx.canvas.width/2,ctx.canvas.height/2);ctx.fillStyle='#19d8ff';ctx.font='700 18px system-ui';ctx.fillText('ESPAÇO PARA RECOMEÇAR',ctx.canvas.width/2,ctx.canvas.height/2+38); }
