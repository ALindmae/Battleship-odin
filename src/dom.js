const SQUARE_CLASSES = {
  square: "square",
  ship: "ship",
  hit: "hit",
  miss: "miss",
};

const GRID_CLASSES = ["gameboard__grid"];

const SLOT_CLASSES = {
  locked: "locked",
};

export const SCREENS = {
  menu: "menu",
  game: "game",
  placement: "placement",
};

const MENU_STATES = {
  idle: "idle",
  player1Name: "player1Name",
  mode: "mode",
  player2Name: "player2Name",
};

const MENU_EVENTS = {
  setup: "setup",
  player1Submit: "player1Submit",
  multiChosen: "multiChosen",
  start: "start",
};

const menuStateMachine = {
  currentState: MENU_STATES.idle,
  states: {
    [MENU_STATES.idle]: {
      entry: {
        beforeRender: ["resetMenu"],
        afterRender: [],
      },
      on: {
        [MENU_EVENTS.setup]: {
          target: MENU_STATES.player1Name,
        },
      },
    },
    [MENU_STATES.player1Name]: {
      entry: {
        beforeRender: [],
        afterRender: ["preparePlayerNameField"],
      },
      on: {
        [MENU_EVENTS.player1Submit]: {
          target: MENU_STATES.mode,
        },
      },
    },
    [MENU_STATES.mode]: {
      entry: {
        beforeRender: [],
        afterRender: [],
      },
      on: {
        [MENU_EVENTS.start]: {
          target: MENU_STATES.idle,
        },
        [MENU_EVENTS.multiChosen]: {
          target: MENU_STATES.player2Name,
        },
      },
    },
    [MENU_STATES.player2Name]: {
      entry: {
        beforeRender: [],
        afterRender: ["preparePlayerNameField"],
      },
      on: {
        [MENU_EVENTS.start]: {
          target: MENU_STATES.idle,
        },
      },
    },
  },

  send(event) {
    const transition = this.states[this.currentState].on[event];
    if (!transition) return;
    this.transitionInto(transition.target);
  },

  transitionInto(target) {
    const menu = document.querySelector(".menu");
    this.currentState = target;

    this.runEntries({ menu, target, phase: "beforeRender" });
    this.render(menu);
    this.runEntries({ menu, target, phase: "afterRender" });
  },

  render(menu) {
    for (const step of menu.querySelectorAll("[data-step]")) {
      step.hidden = step.dataset.step !== this.currentState;
    }
  },

  runEntries({ menu, target, phase }) {
    const actions = this.states[target].entry[phase];

    actions.forEach((action) => {
      menuStateMachine.entries[action](menu);
    });
  },

  entries: {
    resetMenu(menu) {
      const inputs = menu.querySelectorAll("input");

      inputs.forEach((input) => {
        input.required = false;
        input.value = "";
      });
    },
    preparePlayerNameField(menu) {
      const playerInput = menu.querySelector(
        `[data-step="${menuStateMachine.currentState}"] input`,
      );
      playerInput.required = true;
      playerInput.focus();
    },
  },
};

export function openMenu() {
  menuStateMachine.send(MENU_EVENTS.setup);
}

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

function createShipElement({ length, type, direction, placed }) {
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
  body.addEventListener("submit", (e) => handleSubmit(e, callbacks));
  body.addEventListener("keydown", handleKeydown);
  body.addEventListener("pointerdown", (e) => handlePointerdown(e, callbacks));
}

function handleClick(e, callbacks) {
  const square = e.target.closest(".square");
  const board = e.target.closest("[data-board]");
  const menuButton = e.target.closest("[data-event]");
  const actionButton = e.target.closest("[data-action]");

  if (square && board)
    handleSquareClick({
      square,
      board,
      onSquareClick: callbacks.onSquareClick,
    });

  if (menuButton) handleMenuClick(menuButton);

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
  const ship = event.target.closest(".fleet__ships .ship:not(.placed)");
  if (ship) handleShipPointerdown({ event, ship, callbacks });
}

function handleShipPointerdown({ event, ship, callbacks }) {
  ship.setPointerCapture(event.pointerId);

  setTimeout(() => {
    if (ship.hasPointerCapture(event.pointerId)) {
      startShipDrag({ event, ship, callbacks });
    }
  }, 100);
}

function startShipDrag({ event, ship, callbacks }) {
  const dragState = {
    pointerId: event.pointerId,
    shipType: ship.dataset.shipType,
  };

  const ghostShip = ship.cloneNode(true);
  const fleet = document.querySelector(".fleet__ships");

  ghostShip.classList.add("ghost");
  ghostShip.style.left = `${event.clientX}px`;
  ghostShip.style.top = `${event.clientY}px`;

  fleet.appendChild(ghostShip);
  ghostShip.setPointerCapture(dragState.pointerId);

  const controller = new AbortController();

  ghostShip.addEventListener(
    "pointermove",
    (e) => handleShipDragMove(e, dragState.shipType),
    { signal: controller.signal },
  );

  ghostShip.addEventListener(
    "pointerup",
    (e) => {
      handleShipDragEnd({
        e,
        shipType: dragState.shipType,
        direction: ghostShip.dataset.direction,
        callbacks,
      });

      controller.abort();
    },
    { signal: controller.signal },
  );

  ghostShip.addEventListener(
    "pointercancel",
    () => {
      ghostShip.remove();
      controller.abort();
    },
    { signal: controller.signal },
  );
}

function handleShipDragMove(event, shipType) {
  const ship = document.querySelector(`.ghost[data-ship-type='${shipType}']`);
  if (!ship)
    throw new Error(`No element found in the query with the id: ${shipType}`);
  ship.style.left = `${event.clientX}px`;
  ship.style.top = `${event.clientY}px`;
}

function handleShipDragEnd({ e, shipType, direction, callbacks }) {
  const ghostShip = document.querySelector(
    `.ghost[data-ship-type='${shipType}']`,
  );
  ghostShip.remove();

  const square = document
    .elementFromPoint(e.clientX, e.clientY)
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

function handleMenuClick(button) {
  const player1NameField = button.closest("[data-step='player1Name']");
  if (player1NameField) {
    if (!player1NameField.querySelector("input").reportValidity()) return;
  }
  menuStateMachine.send(MENU_EVENTS[button.dataset.event]);
}

function handleSubmit(e, callbacks) {
  e.preventDefault();
  const form = e.target.closest(".menu__form");
  if (form)
    handleMenuFormSubmit({
      event: e,
      form,
      onMenuFormSubmit: callbacks.onMenuFormSubmit,
    });
}

function handleMenuFormSubmit({ event, form, onMenuFormSubmit }) {
  const player1Name = form.elements["player1Name"].value;
  const player2Name = form.elements["player2Name"].value || null;
  const mode = event.submitter.value;

  onMenuFormSubmit({
    player1Name,
    player2Name,
    mode,
  });

  menuStateMachine.send(MENU_EVENTS.start);
}

function handleKeydown(event) {
  if (
    event.key === "Enter" &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    handleEnterKeydown(event);
  }
}

function handleEnterKeydown(event) {
  const isFocusedElement = event.target !== document.body;
  const form = event.target.closest(".menu__form");

  if (form) handleMenuFormEnterKeydown({ event, form });
  if (!isFocusedElement) {
    if (menuStateMachine.currentState !== MENU_STATES.idle)
      handleMenuFormEnterKeydown({
        event,
        form: document.querySelector(".menu__form"),
      });
  }
}

function handleMenuFormEnterKeydown({ event, form }) {
  if (event.target.closest("button")) return;
  event.preventDefault();

  const state = menuStateMachine.currentState;
  const button = form.querySelector(
    `[data-step="${state}"] .name-form__submit`,
  );
  if (!button) return;

  switch (state) {
    case MENU_STATES.player1Name:
      handleMenuClick(button);
      break;

    case MENU_STATES.player2Name:
      form.requestSubmit(button);
      break;
  }
}

export function showScreen(screen) {
  if (!Object.values(SCREENS).includes(screen))
    throw new Error(`invalid screen variable passed: ${screen}`);

  for (const name of Object.values(SCREENS)) {
    document.querySelector(`[data-screen="${name}"]`).hidden = name !== screen;
  }
}
