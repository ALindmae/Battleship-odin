import { Gameboard } from "./gameboard.js";

export class Player {
  #gameboard;
  constructor() {
    this.#gameboard = new Gameboard();
  }

  get gameboard() {
    return this.#gameboard;
  }
}
