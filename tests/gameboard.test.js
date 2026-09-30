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
  expect(board[0][1]).toBeNull();
  expect(board[1][0]).toBeNull();
  expect(board[1][5]).toBeNull();
  expect(board[1][1]).not.toBeNull();
  expect(board[1][2]).not.toBeNull();
  expect(board[1][3]).not.toBeNull();
  expect(board[1][4]).not.toBeNull();
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
  expect(board[1][5]).toBeNull();
});
