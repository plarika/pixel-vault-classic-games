const ALLOWED_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space']);

export class InputManager {
  #pressed = new Set();
  #target;
  #keydown;
  #keyup;

  constructor(target = window) {
    this.#target = target;
    this.#keydown = (event) => {
      if (!ALLOWED_KEYS.has(event.code)) return;
      event.preventDefault();
      this.#pressed.add(event.code);
    };
    this.#keyup = (event) => {
      if (!ALLOWED_KEYS.has(event.code)) return;
      event.preventDefault();
      this.#pressed.delete(event.code);
    };
  }

  attach() {
    this.#target.addEventListener('keydown', this.#keydown, { passive: false });
    this.#target.addEventListener('keyup', this.#keyup, { passive: false });
  }

  detach() {
    this.#target.removeEventListener('keydown', this.#keydown);
    this.#target.removeEventListener('keyup', this.#keyup);
    this.#pressed.clear();
  }

  isDown(...codes) { return codes.some((code) => this.#pressed.has(code)); }
  press(code) { if (ALLOWED_KEYS.has(code)) this.#pressed.add(code); }
  release(code) { this.#pressed.delete(code); }
  clear() { this.#pressed.clear(); }
}
