import { InputManager } from './input.js';

export class GameHost {
  #canvas;
  #ctx;
  #input;
  #game = null;
  #raf = 0;
  #last = 0;
  #paused = false;
  #hooks;

  constructor(canvas, hooks = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('Canvas inválido');
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d', { alpha: false });
    if (!this.#ctx) throw new Error('Canvas 2D indisponível');
    this.#input = new InputManager(window);
    this.#hooks = hooks;
  }

  async load(modulePath, gameId) {
    this.destroy();
    const module = await import(modulePath);
    if (typeof module.createGame !== 'function') throw new Error(`Módulo de jogo inválido: ${gameId}`);
    this.#game = module.createGame({ width: this.#canvas.width, height: this.#canvas.height });
    this.#input.attach();
    this.#last = performance.now();
    this.#paused = false;
    this.#hooks.onStatus?.('A JOGAR');
    this.#raf = requestAnimationFrame(this.#tick);
  }

  #tick = (now) => {
    if (!this.#game) return;
    const dt = Math.min((now - this.#last) / 1000, 0.05);
    this.#last = now;
    if (!this.#paused) {
      const event = this.#game.update(dt, this.#input);
      if (event?.score !== undefined) this.#hooks.onScore?.(event.score);
      if (event?.status) this.#hooks.onStatus?.(event.status);
    }
    this.#game.render(this.#ctx);
    this.#raf = requestAnimationFrame(this.#tick);
  };

  restart() {
    if (!this.#game) return;
    this.#game.reset();
    this.#input.clear();
    this.#hooks.onScore?.(0);
    this.#hooks.onStatus?.('A JOGAR');
  }

  setTouchKey(code, pressed) {
    if (pressed) this.#input.press(code); else this.#input.release(code);
  }

  pause(value = true) {
    this.#paused = value;
    this.#hooks.onStatus?.(value ? 'PAUSA' : 'A JOGAR');
  }

  destroy() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#input.detach();
    this.#game = null;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}
