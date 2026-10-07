import { Player } from "../src/player.js";

test("player with correct type and name is created", () => {
  const humanPlayer = new Player({ type: "human", name: "John" });
  expect(humanPlayer.type).toEqual("human");
  expect(humanPlayer.name).toEqual("John");
});

test("player with incorrect type is not created", () => {
  expect(() => new Player({ type: "humang", name: "John" })).toThrow();
});

test("player with empty name is created with default name", () => {
  const computerPlayer = new Player({ type: "computer", name: "" });
  expect(computerPlayer.name).toEqual("Computer");
});

test("player with no name argument is created with default name", () => {
  const humanPlayer = new Player({ type: "human" });
  expect(humanPlayer.name).toEqual("Player");
});

test("players do not share a gameboard", () => {
  const humanPlayer = new Player({ type: "human", name: "John" });
  const humanPlayerBoard = humanPlayer.gameboard.board;

  const computerPlayer = new Player({ type: "computer", name: "" });
  const computerPlayerBoard = computerPlayer.gameboard.board;

  const humanPlayerShipPlaced = humanPlayer.gameboard.placeShip({
    shipLength: 3,
    coordinates: [1, 4],
    direction: "horizontal",
  });

  expect(humanPlayerShipPlaced).toBeTruthy();
  expect(humanPlayerBoard[1][5].ship).not.toBeNull();
  expect(computerPlayerBoard[1][5].ship).toBeNull();
});
