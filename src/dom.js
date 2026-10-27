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

export function renderGameBoard({ board, boardSlot, showShips, isLocked }) {
  const slot = document.querySelector(`[data-board="${boardSlot}"]`);
  slot.classList.toggle(SLOT_CLASSES.locked, isLocked);
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
  const menuButton = e.target.closest("[data-event]");

  if (square && slot)
    handleSquareClick({ square, slot, onSquareClick: callbacks.onSquareClick });

  if (menuButton) handleMenuClick(menuButton);
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

export function renderWinner(text) {
  renderAnnouncement(text);
  const gameControls = document.querySelector(".game-controls");
  gameControls.hidden = false;
}

function handleMenuClick(button) {
  const player1NameField = button.closest("[data-step='player1Name']");
  if (player1NameField) {
    if (!player1NameField.querySelector("input").reportValidity()) return;
  }
  menuStateMachine.send(MENU_EVENTS[button.dataset.event]);
}

export function showScreen(screen) {
  if (!Object.values(SCREENS).includes(screen))
    throw new Error(`invalid screen variable passed: ${screen}`);

  for (const name of Object.values(SCREENS)) {
    document.querySelector(`[data-screen="${name}"]`).hidden = name !== screen;
  }
}
