export class Ship {
  #type;
  #length;
  #hits;

  constructor(type, length) {
    this.#type = type;
    this.#length = length;
    this.#hits = 0;
  }

  get type() {
    return this.#type;
  }

  get length() {
    return this.#length;
  }

  hit() {
    this.#hits++;
  }

  isSunk() {
    return this.#hits >= this.#length;
  }
}
