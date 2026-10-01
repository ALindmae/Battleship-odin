import { Gameboard } from "../source/gameboard.js";

let gameboard;

beforeEach(() => {
  gameboard = new Gameboard();
});

test("ship is placed on the board", () => {
  const board = gameboard.board;

  const shipPlaced = gameboard.placeShip({
    shipLength: 4,
    coordinates: [1, 1],
    direction: "horizontal",
  });

  expect(shipPlaced).toBeTruthy();
  expect(board[0][1].ship).toBeNull();
  expect(board[1][0].ship).toBeNull();
  expect(board[1][5].ship).toBeNull();
  expect(board[1][1].ship).not.toBeNull();
  expect(board[1][2].ship).not.toBeNull();
  expect(board[1][3].ship).not.toBeNull();
  expect(board[1][4].ship).not.toBeNull();
});

test("ship with coordinates out of the board is not placed", () => {
  const shipPlaced = gameboard.placeShip({
    shipLength: 4,
    coordinates: [0, 10],
    direction: "vertical",
  });
  expect(shipPlaced).toBeFalsy();
});

test("ship with length that goes out of the board is not placed", () => {
  const shipPlaced = gameboard.placeShip({
    shipLength: 4,
    coordinates: [1, 7],
    direction: "horizontal",
  });
  expect(shipPlaced).toBeFalsy();
});

test("ship that is placed on coordinates that another ship occupies is not placed", () => {
  const board = gameboard.board;

  const ship1Placed = gameboard.placeShip({
    shipLength: 4,
    coordinates: [2, 2],
    direction: "horizontal",
  });

  const ship2Placed = gameboard.placeShip({
    shipLength: 4,
    coordinates: [2, 3],
    direction: "horizontal",
  });
  expect(ship2Placed).toBeFalsy();
  expect(board[2][6].ship).toBeNull();
});

test("cell displays attacked ship", () => {
  const board = gameboard.board;

  const shipPlaced = gameboard.placeShip({
    shipLength: 4,
    coordinates: [1, 1],
    direction: "horizontal",
  });

  expect(gameboard.receiveAttack([1, 4])).toBeTruthy();
  expect(board[1][4].attacked).toBeTruthy();
});

test("empty cell displays missed hit", () => {
  const board = gameboard.board;

  expect(gameboard.receiveAttack([1, 6])).toBeFalsy();
  expect(board[1][6].attacked).toBeTruthy();
});

test("identifies that all ships are not sunk", () => {
  expect(gameboard.allShipsSunk()).toBeFalsy();
});

test("identifies that all ships are sunk", () => {
  const ship1Placed = gameboard.placeShip({
    shipLength: 4,
    coordinates: [1, 1],
    direction: "horizontal",
  });

  const ship2Placed = gameboard.placeShip({
    shipLength: 3,
    coordinates: [2, 2],
    direction: "vertical",
  });

  gameboard.receiveAttack([1, 1]);
  gameboard.receiveAttack([1, 2]);
  gameboard.receiveAttack([1, 3]);
  gameboard.receiveAttack([1, 4]);

  gameboard.receiveAttack([2, 2]);
  gameboard.receiveAttack([3, 2]);
  gameboard.receiveAttack([4, 2]);

  expect(gameboard.allShipsSunk()).toBeTruthy();
});
