import { Ship } from "../src/ship.js";

test("ship is sunk after length hits", () => {
  const ship = new Ship(3);
  ship.hit();
  expect(ship.isSunk()).toBeFalsy();
  ship.hit();
  expect(ship.isSunk()).toBeFalsy();
  ship.hit();
  expect(ship.isSunk()).toBeTruthy();
});
