const SQUARE_CLASSES = {
  square: "square",
  ship: "ship",
  hit: "hit",
  miss: "miss",
};

const GRID_CLASSES = ["gameboard__grid"];

function getSquareClasses(cell, showShips) {
  const classes = [SQUARE_CLASSES.square];
  if (cell.ship && showShips) classes.push(SQUARE_CLASSES.ship);
  if (cell.attacked)
    classes.push(cell.ship ? SQUARE_CLASSES.hit : SQUARE_CLASSES.miss);

  return classes;
}

function createSquareElement({ cell, coordinates, showShips }) {
  const square = document.createElement("div");
  square.dataset.row = coordinates.row;
  square.dataset.column = coordinates.column;

  if (cell.ship && showShips) square.dataset.shipType = cell.ship.type;

  square.classList.add(...getSquareClasses(cell, showShips));

  return square;
}

export function createGridElement({ board, showShips }) {
  const gridElement = document.createElement("div");
  gridElement.classList.add(...GRID_CLASSES);

  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[row].length; column++) {
      const squareElement = createSquareElement({
        cell: board[row][column],
        coordinates: { row, column },
        showShips,
      });
      gridElement.append(squareElement);
    }
  }

  return gridElement;
}

export function createShipElement({ length, type, direction, placed }) {
  const ship = document.createElement("div");
  ship.classList.add("ship");
  ship.classList.add(type);
  if (placed) ship.classList.add("placed");
  ship.dataset.length = length;
  ship.dataset.direction = direction;
  ship.dataset.shipType = type;

  for (let i = 0; i < length; i++) {
    ship.append(document.createElement("div"));
  }

  return ship;
}
