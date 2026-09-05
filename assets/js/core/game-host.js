import { InputManager } from './input.js';

function assertGameContract(game, gameId) {
  if (!game || typeof game !== 'object') throw new Error(`Instância inválida: ${gameId}`);
  for (const method of ['update', 'render', 'reset']) {
    if (typeof game[method] !== 'function') throw new Error(`Contrato inválido (${method}): ${gameId}`);
  }
}

export class GameHost {
  #canvas;
  #ctx;
  #input;
  #game = null;
  #raf = 0;
  #last = 0;
  #paused = false;
  #hooks;
  #loadToken = 0;

  constructor(canvas, hooks = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('Canvas inválido');
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d', { alpha: false });
    if (!this.#ctx) throw new Error('Canvas 2D indisponível');
    this.#input = new InputManager(window);
    this.#hooks = hooks;
  }

  async load(modulePath, gameId) {
    const token = ++this.#loadToken;
    this.#teardown();
    const module = await import(modulePath);
    if (token !== this.#loadToken) return;
    if (typeof module.createGame !== 'function') throw new Error(`Módulo de jogo inválido: ${gameId}`);

    const game = module.createGame({ width: this.#canvas.width, height: this.#canvas.height });
    assertGameContract(game, gameId);
    if (token !== this.#loadToken) return;

    this.#game = game;
    this.#input.attach();
    this.#last = performance.now();
    this.#paused = false;
    this.#hooks.onStatus?.('A JOGAR');
    this.#raf = requestAnimationFrame(this.#tick);
  }

  #tick = (now) => {
    if (!this.#game) return;
    try {
      const dt = Math.min(Math.max((now - this.#last) / 1000, 0), 0.05);
      this.#last = now;
      if (!this.#paused) {
        const event = this.#game.update(dt, this.#input);
        if (event?.score !== undefined) this.#hooks.onScore?.(event.score);
        if (event?.status) this.#hooks.onStatus?.(String(event.status).slice(0, 48));
      }
      this.#game.render(this.#ctx);
      this.#raf = requestAnimationFrame(this.#tick);
    } catch (error) {
      this.#fail(error);
    }
  };

  #fail(error) {
    console.error('Falha no runtime do jogo:', error);
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#input.detach();
    this.#game = null;
    this.#hooks.onStatus?.('ERRO NO JOGO');
    this.#hooks.onError?.(error);
  }

  restart() {
    if (!this.#game) return;
    try {
      this.#game.reset();
      this.#input.clear();
      this.#hooks.onScore?.(0);
      this.#hooks.onStatus?.('A JOGAR');
    } catch (error) {
      this.#fail(error);
    }
  }

  setTouchKey(code, pressed) {
    if (pressed) this.#input.press(code); else this.#input.release(code);
  }

  pause(value = true) {
    if (!this.#game) return;
    this.#paused = Boolean(value);
    this.#input.clear();
    this.#hooks.onStatus?.(this.#paused ? 'PAUSA' : 'A JOGAR');
  }

  #teardown() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#input.detach();
    this.#game = null;
    this.#paused = false;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  destroy() {
    this.#loadToken += 1;
    this.#teardown();
  }
}
