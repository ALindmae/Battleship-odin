import { Player } from "../src/player.js";

test("players have two different boards, one placed ship the other not", () => {
  const realPlayer = new Player();
  const realPlayerBoard = realPlayer.gameboard.board;

  const compPlayer = new Player();
  const compPlayerBoard = compPlayer.gameboard.board;

  const realPlayerShipPlaced = realPlayer.gameboard.placeShip({
    shipLength: 3,
    coordinates: [1, 4],
    direction: "horizontal",
  });

  expect(realPlayerShipPlaced).toBeTruthy();
  expect(realPlayerBoard[1][5].ship).not.toBeNull();
  expect(compPlayerBoard[1][5].ship).toBeNull();
});
