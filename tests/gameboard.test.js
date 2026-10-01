import { Gameboard } from "../source/gameboard.js";

const gameboard = new Gameboard();
const board = gameboard.board;

test("ship is placed on the board", () => {
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
  const shipPlaced = gameboard.placeShip({
    shipLength: 4,
    coordinates: [1, 4],
    direction: "horizontal",
  });
  expect(shipPlaced).toBeFalsy();
  expect(board[1][5].ship).toBeNull();
});

test("cell displays attacked ship", () => {
  expect(gameboard.receiveAttack([1, 4])).toBeTruthy();
  expect(board[1][4].attacked).toBeTruthy();
});

test("empty cell displays missed hit", () => {
  expect(gameboard.receiveAttack([1, 6])).toBeFalsy();
  expect(board[1][6].attacked).toBeTruthy();
});

test("identifies that all ships are not sunk", () => {
  expect(gameboard.allShipsSunk()).toBeFalsy();
});

test("identifies that all ships are sunk", () => {
  gameboard.receiveAttack([1, 1]);
  gameboard.receiveAttack([1, 2]);
  gameboard.receiveAttack([1, 3]);

  expect(gameboard.allShipsSunk()).toBeTruthy();
});
