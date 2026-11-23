import { Ship } from "./ship.js";

export const BOARD_SIZE = {
  columns: 10,
  rows: 10,
};

export const PLACEMENT_DIRECTIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

export const FLEET = [
  { type: "carrier", length: 5 },
  { type: "battleship", length: 4 },
  { type: "cruiser", length: 3 },
  { type: "submarine", length: 3 },
  { type: "destroyer", length: 2 },
];

export const ATTACK_RESULTS = {
  hit: "hit",
  miss: "miss",
  rejected: "rejected",
};

export class Gameboard {
  #board;
  #ships;

  constructor() {
    this.#board = this.#createBoard();
    this.#ships = [];
  }

  get board() {
    return this.#board;
  }

  get ships() {
    return [...this.#ships];
  }

  resetBoard() {
    this.#ships.length = 0;
    this.#board = this.#createBoard();
  }

  isFleetPlaced() {
    return this.#ships.length === FLEET.length;
  }

  #getShipCells({ startCoordinates, direction, length }) {
    const [row, column] = startCoordinates;
    const cells = [startCoordinates];

    for (let i = 1; i < length; i++) {
      if (direction === PLACEMENT_DIRECTIONS.horizontal) {
        cells.push([row, column + i]);
      } else {
        cells.push([row + i, column]);
      }
    }
    return cells;
  }

  getShipPlacement(type) {
    const placement = this.#ships.find(
      (placement) => placement.ship.type === type,
    );
    if (!placement) return null;

    return {
      length: placement.ship.length,
      direction: placement.direction,
      startCoordinates: [...placement.startCoordinates],
    };
  }

  #isShipAlreadyPlaced(type) {
    return this.#ships.some((placement) => placement.ship?.type === type);
  }

  #removeShip(type, cells) {
    const index = this.#ships.findIndex(
      (placement) => placement.ship.type === type,
    );

    if (index !== -1) {
      this.#ships.splice(index, 1);
    }

    cells.forEach(([row, column]) => {
      this.#board[row][column].ship = null;
    });
  }

  placeShip({ shipType, startCoordinates, direction }) {
    if (!PLACEMENT_DIRECTIONS[direction])
      throw new Error("incorrect direction argument passed");

    const length = getShipLength(shipType);

    if (!length) throw new Error(`unknown ship type: ${shipType}`);

    const cells = this.#getShipCells({
      startCoordinates,
      direction,
      length,
    });

    if (!this.#isValidShipPlacement(cells, shipType)) return false;
    if (this.#isShipAlreadyPlaced(shipType))
      this.#removeShip(
        shipType,
        this.#getShipCells(this.getShipPlacement(shipType)),
      );

    const ship = new Ship(shipType, length);

    cells.forEach(([row, column]) => (this.#board[row][column].ship = ship));
    this.#ships.push({ ship, startCoordinates, direction });

    return true;
  }

  receiveAttack(coordinates) {
    if (!this.#isOnBoard(coordinates)) return ATTACK_RESULTS.rejected;

    const [row, column] = coordinates;

    if (this.#board[row][column].attacked) return ATTACK_RESULTS.rejected;

    this.#board[row][column].attacked = true;

    if (this.#board[row][column].ship) {
      this.#board[row][column].ship.hit();
      return ATTACK_RESULTS.hit;
    }
    return ATTACK_RESULTS.miss;
  }

  allShipsSunk() {
    if (this.#ships.length === 0) return false;

    for (const placement of this.#ships) {
      if (!placement.ship.isSunk()) return false;
    }
    return true;
  }

  #createBoard() {
    let board = [];
    for (let i = 0; i < BOARD_SIZE.rows; i++) {
      board[i] = [];
      for (let j = 0; j < BOARD_SIZE.columns; j++) {
        board[i][j] = { ship: null, attacked: false };
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

  #isValidShipPlacement(cells, shipType) {
    for (const [row, column] of cells) {
      if (!this.#isOnBoard([row, column])) return false;

      const ship = this.#board[row][column].ship;

      if (ship && ship.type !== shipType) {
        return false;
      }
    }
    return true;
  }

  getUnattackedCoordinates() {
    const coordinates = [];
    for (let row = 0; row < this.#board.length; row++) {
      for (let column = 0; column < this.#board[row].length; column++) {
        if (!this.#board[row][column].attacked) coordinates.push([row, column]);
      }
    }
    return coordinates;
  }
}

export function getShipLength(type) {
  return FLEET.find((item) => item.type === type)?.length;
}
