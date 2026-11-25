import { SCREENS } from "./navigation";
import { createShipElement, createGridElement } from "./elements";
import { bindMenuEvents } from "./screens/menu";
export { SCREENS, showScreen } from "./navigation";
export { openMenu } from "./screens/menu.js";

const SLOT_CLASSES = {
  locked: "locked",
};

function getPlacementShipData(ship) {
  const { shipType: type, direction, length } = ship.dataset;

  return {
    type,
    direction: direction,
    length: Number(length),
  };
}

function setShipSquaresLifted(shipType, isLifted) {
  const placedShipSquares = document.querySelectorAll(
    `[data-board="placement"] [data-ship-type="${shipType}"]`,
  );

  placedShipSquares.forEach((square) =>
    square.classList.toggle("lifted", isLifted),
  );
}

function setDragging(active) {
  document.body.classList.toggle("is-dragging", active);
}

function createGhostShip({ length, type, direction }) {
  const ship = createShipElement({ length, type, direction });
  ship.classList.add("ghost");

  return ship;
}

function positionGhostShip(event, ship) {
  ship.style.left = `${event.clientX}px`;
  ship.style.top = `${event.clientY}px`;
}

export function renderFleet(fleet) {
  const fleetElement = document.querySelector(".fleet__ships");
  const ships = [];

  for (const item of fleet) {
    ships.push(createShipElement(item));
  }
  fleetElement.replaceChildren(...ships);
}

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

export function renderPlacementBoard(board) {
  const slot = document.querySelector(
    "[data-board='placement'] .gameboard__slot",
  );
  slot.replaceChildren(createGridElement({ board, showShips: true }));
}

export function renderHandoffOverlay({ message, buttonText }) {
  const overlay = document.querySelector(".handoff-overlay");
  const overlayMessage = overlay.querySelector(".handoff-overlay__message");
  const overlayButton = overlay.querySelector(".handoff-overlay__button");

  overlayMessage.textContent = message;
  overlayButton.textContent = buttonText;
  overlay.hidden = false;
}

export function closeHandoffOverlay() {
  const overlay = document.querySelector(".handoff-overlay");
  overlay.hidden = true;
}

export function bindEvents(callbacks) {
  const body = document.body;

  body.addEventListener("click", (e) => handleClick(e, callbacks));
  body.addEventListener("pointerdown", (e) => handlePointerdown(e, callbacks));

  bindMenuEvents(callbacks);
}

function handleClick(e, callbacks) {
  const square = e.target.closest(".square");
  const board = e.target.closest("[data-board]");
  const actionButton = e.target.closest("[data-action]");

  if (square && board)
    handleSquareClick({
      square,
      board,
      onSquareClick: callbacks.onSquareClick,
    });

  if (actionButton) {
    switch (actionButton.dataset.action) {
      case "randomize":
        callbacks.onRandomizePlacementClick();
        break;
      case "confirmPlacement":
        callbacks.onConfirmPlacementClick();
        break;
      case "confirmHandoff":
        callbacks.onConfirmHandoffClick();
        break;
    }
  }
}

function handleSquareClick({ square, board, onSquareClick }) {
  const screenName = board.closest("[data-screen]").dataset.screen;

  switch (screenName) {
    case SCREENS.game:
      const coordinates = [
        Number(square.dataset.row),
        Number(square.dataset.column),
      ];

      const playerKey = board.dataset.board;

      onSquareClick(coordinates, playerKey);
      break;
  }
}

function handlePointerdown(event, callbacks) {
  const placementShip = event.target.closest(
    ".fleet__ships .ship:not(.placed)",
  );
  const placedShip = event.target.closest(
    "[data-board='placement'] .square.ship:not(.lifted)",
  );

  if (placementShip || placedShip)
    handleShipPointerdown({
      event,
      ship: placementShip || placedShip,
      callbacks,
    });
}

function handleShipPointerdown({ event, ship, callbacks }) {
  ship.setPointerCapture(event.pointerId);

  setTimeout(() => {
    if (ship.hasPointerCapture(event.pointerId)) {
      handleStartShipDrag({ event, ship, callbacks });
    }
  }, 100);
}

function handleStartShipDrag({ event, ship, callbacks }) {
  if (ship.classList.contains("square")) {
    const type = ship.dataset.shipType;
    startShipDrag({
      event,
      shipData: callbacks.getPlacedShipData(type),
      callbacks,
      onEnter: () => setShipSquaresLifted(type, true),
      onEnd: () => setShipSquaresLifted(type, false),
    });
  } else {
    startShipDrag({
      event,
      shipData: getPlacementShipData(ship),
      callbacks,
    });
  }
}

function startShipDrag({ event, shipData, callbacks, onEnter, onEnd }) {
  const body = document.querySelector("body");
  const dragState = {
    pointerId: event.pointerId,
  };

  const ghostShip = createGhostShip(shipData);
  positionGhostShip(event, ghostShip);

  body.appendChild(ghostShip);

  ghostShip.setPointerCapture(dragState.pointerId);

  const controller = new AbortController();

  onEnter?.();
  setDragging(true);

  ghostShip.addEventListener(
    "pointermove",
    (e) =>
      handleShipDragMove({
        event: e,
        ship: ghostShip,
      }),
    { signal: controller.signal },
  );

  ghostShip.addEventListener(
    "pointerup",
    (e) => {
      handleShipDragEnd({
        event: e,
        shipType: shipData.type,
        direction: shipData.direction,
        callbacks,
      });

      endShipDrag({ ghostShip, controller, onEnd });
    },
    { signal: controller.signal },
  );

  ghostShip.addEventListener(
    "pointercancel",
    () => {
      endShipDrag({ ghostShip, controller, onEnd });
    },
    {
      signal: controller.signal,
    },
  );
}

function endShipDrag({ ghostShip, controller, onEnd }) {
  onEnd?.();
  setDragging(false);
  ghostShip.remove();
  controller.abort();
}

function handleShipDragMove({ event, ship }) {
  ship.style.left = `${event.clientX}px`;
  ship.style.top = `${event.clientY}px`;
}

function handleShipDragEnd({ event, shipType, direction, callbacks }) {
  const square = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest("[data-board='placement'] .square");

  if (!square) {
    // TODO: render an "invalid drop area" message
    return;
  } else {
    callbacks.onShipDrop({
      startCoordinates: [
        Number(square.dataset.row),
        Number(square.dataset.column),
      ],
      shipType,
      direction,
    });
  }
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
