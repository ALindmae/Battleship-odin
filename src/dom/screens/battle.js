import { createGridElement } from "../elements.js";

const SLOT_CLASSES = {
  locked: "locked",
};

export function renderGameBoard({ board, boardSlot, showShips, isLocked }) {
  const slot = document.querySelector(
    `[data-board="${boardSlot}"] .gameboard__slot`,
  );

  if (!slot)
    throw new Error(
      `no matching element found in the DOM: data-board=${boardSlot}`,
    );

  slot.classList.toggle(SLOT_CLASSES.locked, isLocked);
  slot.replaceChildren(createGridElement({ board, showShips }));
}

export function renderGameboardTitle(boardKey, text) {
  const board = document.querySelector(
    `[data-screen="game"] [data-board="${boardKey}"]`,
  );

  if (!board)
    throw new Error(
      `no board matching the boardKey = ${boardKey} found: [data-screen="game"] [data-board="${boardKey}"]`,
    );

  const title = board.querySelector(".gameboard__title");
  title.textContent = text;
}

export function renderAnnouncement(text) {
  const gameStatus = document.querySelector(".game-status");
  gameStatus.textContent = text;
}

export function renderWinner(text) {
  renderAnnouncement(text);
  const gameControls = document.querySelector(".game-controls");
  gameControls.hidden = false;
}

function handleClick(e, callbacks) {
  const square = e.target.closest(".square");
  const board = e.target.closest("[data-board]");
  if (!square || !board) return;

  const coordinates = [
    Number(square.dataset.row),
    Number(square.dataset.column),
  ];

  callbacks.onSquareClick(coordinates, board.dataset.board);
}

export function bindBattleEvents(callbacks) {
  const screen = document.querySelector("[data-screen='game']");

  screen.addEventListener("click", (e) => handleClick(e, callbacks));
}
