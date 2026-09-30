import { Ship } from "./ship.js";

const BOARD_SIZE = {
  columns: 10,
  rows: 10,
};

export const PLACEMENT_DIRECTIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

export class Gameboard {
  #board;
  constructor() {
    this.#board = this.#createBoard();
  }

  get board() {
    return this.#board;
  }

  placeShip({ shipLength, coordinates, direction }) {
    if (!PLACEMENT_DIRECTIONS[direction])
      throw new Error("incorrect direction argument passed");

    if (!this.#isValidShipPlacement({ shipLength, coordinates, direction }))
      return false;

    const [row, column] = coordinates;
    const ship = new Ship(shipLength);

    for (let i = 0; i < shipLength; i++) {
      if (direction === PLACEMENT_DIRECTIONS.horizontal) {
        this.#board[row][column + i] = ship;
      } else {
        this.#board[row + i][column] = ship;
      }
    }

    return true;
  }

  #createBoard() {
    let board = [];
    for (let i = 0; i < BOARD_SIZE.rows; i++) {
      board[i] = [];
      for (let j = 0; j < BOARD_SIZE.columns; j++) {
        board[i][j] = null;
      }
    }
    return board;
  }

  #isOnBoard(coordinates) {
    return (
      coordinates[0] >= 0 &&
      coordinates[0] < BOARD_SIZE.rows &&
      coordinates[1] >= 0 &&
      coordinates[1] < BOARD_SIZE.columns
    );
  }

  #isValidShipPlacement({ shipLength, coordinates: [row, column], direction }) {
    // check if the coordinates are not out of the board or another ship is occupying the coordinates
    for (let i = 0; i < shipLength; i++) {
      if (direction === PLACEMENT_DIRECTIONS.horizontal) {
        if (
          !this.#isOnBoard([row, column + i]) ||
          this.#board[row][column + i] instanceof Ship
        )
          return false;
      } else {
        if (
          !this.#isOnBoard([row + i, column]) ||
          this.#board[row + i][column] instanceof Ship
        )
          return false;
      }
    }
    return true;
  }
}
