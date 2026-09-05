export function createGame({ width, height }) {
  let ship, bullets, enemies, enemyBullets, score, lives, wave, spawnTimer, shotCooldown, finished;

  function reset() {
    ship={x:width/2,y:height-58,w:42,h:26}; bullets=[]; enemies=[]; enemyBullets=[];
    score=0;lives=3;wave=1;spawnTimer=0;shotCooldown=0;finished=false;
  }

  function spawnEnemy() {
    const speed=70+wave*8;
    enemies.push({x:30+Math.random()*(width-60),y:-28,w:34,h:24,vx:(Math.random()-.5)*80,vy:speed,shot:1+Math.random()*1.6});
  }

  function update(dt,input){
    if(finished){if(input.isDown('Space'))reset();return{score,status:'FIM — ESPAÇO PARA RECOMEÇAR'};}
    const move=420;
    if(input.isDown('ArrowLeft','KeyA'))ship.x-=move*dt;
    if(input.isDown('ArrowRight','KeyD'))ship.x+=move*dt;
    ship.x=clamp(ship.x,ship.w/2,width-ship.w/2);
    shotCooldown-=dt;
    if(input.isDown('Space')&&shotCooldown<=0){bullets.push({x:ship.x,y:ship.y-18,vy:-650,r:4});shotCooldown=.16;}

    spawnTimer-=dt;
    if(spawnTimer<=0){spawnEnemy();spawnTimer=Math.max(.22,.8-wave*.045);}
    if(score>0&&score%1000===0)wave=Math.min(12,1+Math.floor(score/1000));

    for(const b of bullets)b.y+=b.vy*dt;
    for(const e of enemies){e.x+=e.vx*dt;e.y+=e.vy*dt;e.shot-=dt;if(e.x<18||e.x>width-18)e.vx*=-1;if(e.shot<=0){enemyBullets.push({x:e.x,y:e.y+12,vy:220+wave*10,r:4});e.shot=1.2+Math.random()*1.7;}}
    for(const b of enemyBullets)b.y+=b.vy*dt;

    for(const e of enemies){if(e.dead)continue;for(const b of bullets){if(b.dead)continue;if(Math.abs(b.x-e.x)<e.w/2&&Math.abs(b.y-e.y)<e.h/2){e.dead=true;b.dead=true;score+=100;break;}}}
    for(const b of enemyBullets){if(b.dead)continue;if(Math.abs(b.x-ship.x)<ship.w/2&&Math.abs(b.y-ship.y)<ship.h/2){b.dead=true;lives-=1;if(lives<=0)finished=true;}}
    for(const e of enemies){if(!e.dead&&e.y>height+30){e.dead=true;lives-=1;if(lives<=0)finished=true;}}

    bullets=bullets.filter(b=>!b.dead&&b.y>-20);enemies=enemies.filter(e=>!e.dead&&e.y<height+40);enemyBullets=enemyBullets.filter(b=>!b.dead&&b.y<height+20);
    return{score,status:finished?'GAME OVER':`VIDAS ${lives} · VAGA ${wave}`};
  }

  function render(ctx){
    ctx.fillStyle='#02060c';ctx.fillRect(0,0,width,height);
    drawStars(ctx,width,height);
    ctx.fillStyle='#19d8ff';ctx.shadowColor='#19d8ff';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(ship.x,ship.y-18);ctx.lineTo(ship.x-22,ship.y+14);ctx.lineTo(ship.x,ship.y+6);ctx.lineTo(ship.x+22,ship.y+14);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#fff';for(const b of bullets){ctx.fillRect(b.x-2,b.y-8,4,12);}
    ctx.fillStyle='#ff8a3d';for(const e of enemies){ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);ctx.fillStyle='#ffcf66';ctx.fillRect(e.x-5,e.y+4,10,5);ctx.fillStyle='#ff8a3d';}
    ctx.fillStyle='#ff4d78';for(const b of enemyBullets){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
    if(finished)overlay(ctx);
  }

  reset();return{update,render,reset};
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function drawStars(ctx,w,h){ctx.fillStyle='rgba(255,255,255,.48)';for(let i=0;i<65;i++){const x=(i*149)%w;const y=(i*83)%h;ctx.fillRect(x,y,(i%3)+1,(i%3)+1);}}
function overlay(ctx){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 54px system-ui';ctx.fillText('GAME OVER',ctx.canvas.width/2,ctx.canvas.height/2);ctx.fillStyle='#19d8ff';ctx.font='700 18px system-ui';ctx.fillText('ESPAÇO PARA RECOMEÇAR',ctx.canvas.width/2,ctx.canvas.height/2+38);}
