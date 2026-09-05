export function createGame({ width, height }) {
  const rows = 6;
  const cols = 12;
  let paddle;
  let ball;
  let bricks;
  let score;
  let lives;
  let finished;

  function makeBricks() {
    const gap = 8;
    const margin = 48;
    const bw = (width - margin * 2 - gap * (cols - 1)) / cols;
    const bh = 24;
    return Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { x: margin + col * (bw + gap), y: 68 + row * (bh + gap), w: bw, h: bh, alive: true, hue: 190 + row * 22 };
    });
  }

  function resetBall() {
    ball = { x: width / 2, y: height - 100, vx: 250 * (Math.random() > .5 ? 1 : -1), vy: -330, r: 9 };
  }

  function reset() {
    paddle = { x: width / 2 - 70, y: height - 48, w: 140, h: 16 };
    bricks = makeBricks(); score = 0; lives = 3; finished = false; resetBall();
  }

  function update(dt, input) {
    if (finished) {
      if (input.isDown('Space')) reset();
      return { score, status: 'FIM — ESPAÇO PARA RECOMEÇAR' };
    }
    const speed = 520;
    if (input.isDown('ArrowLeft','KeyA')) paddle.x -= speed * dt;
    if (input.isDown('ArrowRight','KeyD')) paddle.x += speed * dt;
    paddle.x = clamp(paddle.x, 0, width - paddle.w);

    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x - ball.r <= 0 || ball.x + ball.r >= width) { ball.x = clamp(ball.x, ball.r, width - ball.r); ball.vx *= -1; }
    if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

    if (ball.vy > 0 && circleRect(ball, paddle)) {
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.vy = -Math.abs(ball.vy);
      ball.vx = hit * 430;
      ball.y = paddle.y - ball.r - 1;
    }

    for (const brick of bricks) {
      if (!brick.alive || !circleRect(ball, brick)) continue;
      brick.alive = false; score += 25; ball.vy *= -1; break;
    }

    if (bricks.every((brick) => !brick.alive)) { score += 500; bricks = makeBricks(); resetBall(); }
    if (ball.y - ball.r > height) { lives -= 1; if (lives <= 0) finished = true; else resetBall(); }
    return { score, status: finished ? 'GAME OVER' : `VIDAS ${lives}` };
  }

  function render(ctx) {
    ctx.fillStyle='#02070d';ctx.fillRect(0,0,width,height);
    for (const brick of bricks) {
      if (!brick.alive) continue;
      const color=`hsl(${brick.hue} 85% 60%)`;
      ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.fillRect(brick.x,brick.y,brick.w,brick.h);
    }
    ctx.shadowBlur=0;
    ctx.fillStyle='#19d8ff';ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
    if (finished) overlay(ctx);
  }

  reset(); return { update, render, reset };
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function circleRect(c,r){const x=clamp(c.x,r.x,r.x+r.w);const y=clamp(c.y,r.y,r.y+r.h);const dx=c.x-x,dy=c.y-y;return dx*dx+dy*dy<=c.r*c.r;}
function overlay(ctx){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 54px system-ui';ctx.fillText('GAME OVER',ctx.canvas.width/2,ctx.canvas.height/2);ctx.fillStyle='#19d8ff';ctx.font='700 18px system-ui';ctx.fillText('ESPAÇO PARA RECOMEÇAR',ctx.canvas.width/2,ctx.canvas.height/2+38);}
