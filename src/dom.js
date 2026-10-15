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

  square.classList.add(...getSquareClasses(cell, showShips));

  return square;
}

function createGridElement({ board, showShips }) {
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

export function renderGameBoard({ board, boardSlot, showShips }) {
  const slot = document.querySelector(`[data-board="${boardSlot}"]`);
  if (!slot)
    throw new Error(
      `no matching element found in the DOM: data-board=${boardSlot}`,
    );
  slot.replaceChildren(createGridElement({ board, showShips }));
}

export function bindEvents(callbacks) {
  const body = document.body;

  body.addEventListener("click", (e) => handleClick(e, callbacks));
}

function handleClick(e, callbacks) {
  const square = e.target.closest(".square");
  const slot = e.target.closest("[data-board]");
  if (square && slot)
    handleSquareClick({ square, slot, onSquareClick: callbacks.onSquareClick });
}

function handleSquareClick({ square, slot, onSquareClick }) {
  const coordinates = [
    Number(square.dataset.row),
    Number(square.dataset.column),
  ];
  const playerKey = slot.dataset.board;
  onSquareClick(coordinates, playerKey);
}

export function renderAnnouncement(text) {
  const gameStatus = document.querySelector(".game-status");
  gameStatus.textContent = text;
}
