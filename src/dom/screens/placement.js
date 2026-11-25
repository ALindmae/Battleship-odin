import { createShipElement, createGridElement } from "../elements.js";

const PLACEMENT_STATE = {
  idle: "idle",
  shipDrag: "shipDrag",
  placementError: "placementError",
  incompleteFleet: "incompleteFleet",
};

const ANNOUNCEMENT_MESSAGES = {
  [PLACEMENT_STATE.idle]:
    "Drag and drop ships from the tray onto the grid or randomize placement.",
  [PLACEMENT_STATE.shipDrag]: "Drop the ship onto a grid square to place it.",
  [PLACEMENT_STATE.placementError]: "Incorrect placement area, try again!",
  [PLACEMENT_STATE.incompleteFleet]: "Place all your ships before confirming.",
};

const TIMED_STATES = [
  PLACEMENT_STATE.placementError,
  PLACEMENT_STATE.incompleteFleet,
];

const PLACEMENT_ERROR_TIMEOUT_MS = 5000;
let errorTimer = null;

function renderPlacementAnnouncement(text) {
  document.querySelector(".ship-placement__announcement").textContent = text;
}

function setPlacementState(next) {
  clearTimeout(errorTimer);
  renderPlacementAnnouncement(ANNOUNCEMENT_MESSAGES[next]);

  if (TIMED_STATES.includes(next)) {
    errorTimer = setTimeout(
      () => setPlacementState(PLACEMENT_STATE.idle),
      PLACEMENT_ERROR_TIMEOUT_MS,
    );
  }
}

export function resetPlacementAnnouncement() {
  setPlacementState(PLACEMENT_STATE.idle);
}

export function renderPlacementError() {
  setPlacementState(PLACEMENT_STATE.placementError);
}

export function renderIncompleteFleetError() {
  setPlacementState(PLACEMENT_STATE.incompleteFleet);
}

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

export function renderPlacementBoard(board) {
  const slot = document.querySelector(
    "[data-board='placement'] .gameboard__slot",
  );
  slot.replaceChildren(createGridElement({ board, showShips: true }));
}

function handleClick(e, callbacks) {
  const actionButton = e.target.closest("[data-action]");
  if (!actionButton) return;

  switch (actionButton.dataset.action) {
    case "randomize":
      callbacks.onRandomizePlacementClick();
      break;
    case "confirmPlacement":
      callbacks.onConfirmPlacementClick();
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
  setPlacementState(PLACEMENT_STATE.shipDrag);

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
      setPlacementState(PLACEMENT_STATE.idle);
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
    setPlacementState(PLACEMENT_STATE.placementError);
    return;
  }

  callbacks.onShipDrop({
    startCoordinates: [
      Number(square.dataset.row),
      Number(square.dataset.column),
    ],
    shipType,
    direction,
  });
}

export function bindPlacementEvents(callbacks) {
  const screen = document.querySelector("[data-screen='placement']");

  screen.addEventListener("click", (e) => handleClick(e, callbacks));
  screen.addEventListener("pointerdown", (e) =>
    handlePointerdown(e, callbacks),
  );
}
