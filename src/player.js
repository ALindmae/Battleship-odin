import { Gameboard } from "./gameboard.js";

export const PLAYER_TYPES = {
  human: "human",
  computer: "computer",
};

const NAME_DEFAULTS = {
  [PLAYER_TYPES.human]: "Player",
  [PLAYER_TYPES.computer]: "Computer",
};

function isValidPlayerType(type) {
  return Object.values(PLAYER_TYPES).includes(type);
}

export class Player {
  #gameboard;
  #type;
  #name;

  constructor({ type, name }) {
    if (!isValidPlayerType(type))
      throw new Error(
        `attempt to create player with incorrect player type: ${type}`,
      );
    this.#gameboard = new Gameboard();
    this.#type = type;
    this.#name = name ? name : NAME_DEFAULTS[type];
  }

  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }

  get gameboard() {
    return this.#gameboard;
  }
}
