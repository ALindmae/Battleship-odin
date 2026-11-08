import { Player, PLAYER_TYPES } from "./player";
import "./styles.css";
import {
  PLACEMENT_DIRECTIONS,
  BOARD_SIZE,
  FLEET,
  ATTACK_RESULTS,
} from "./gameboard";
import {
  renderGameBoard,
  bindEvents,
  renderAnnouncement,
  renderWinner,
  showScreen,
  SCREENS,
  openMenu,
  renderHandoffOverlay,
  renderPlacementBoard,
  closeHandoffOverlay,
  renderGameboardTitle,
} from "./dom";

const players = {
  player1: null,
  player2: null,
};

const gameState = {
  turn: null,
  winner: null,
  mode: null,
  phase: null,
};

const GAME_MODES = {
  single: "single",
  multi: "multi",
};

const GAME_PHASES = {
  placement: "placement",
  handoff: "handoff",
  battle: "battle",
  resolving: "resolving",
  over: "over",
};

const HANDOFF_TEMPLATES = {
  placement: {
    message: (name) => `${name} it's time to prepare your fleet.`,
    buttonText: "Prepare fleet",
  },
  battle: {
    message: (name) => `${name} prepare to attack!`,
    buttonText: "Start turn!",
  },
};

const announcements = {
  winner(name) {
    return `Game Over! ${name} won!`;
  },
  turn(name) {
    return `${name}'s turn.`;
  },
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getShowShips(playerKey) {
  if (gameState.winner) return true;

  return gameState.mode === GAME_MODES.single
    ? players[playerKey].type === PLAYER_TYPES.human
    : gameState.turn === playerKey;
}

function getHandoffPayload() {
  const kind = bothPlayersFleetsPlaced() ? "battle" : "placement";
  const template = HANDOFF_TEMPLATES[kind];

  return {
    message: template.message(players[gameState.turn].name),
    buttonText: template.buttonText,
  };
}

function bothPlayersFleetsPlaced() {
  return (
    players.player1.gameboard.isFleetPlaced() &&
    players.player2.gameboard.isFleetPlaced()
  );
}

function renderBoards() {
  for (const [key, player] of Object.entries(players)) {
    renderGameBoard({
      board: player.gameboard.board,
      boardSlot: key,
      showShips: getShowShips(key),
      isLocked: key === gameState.turn || !!gameState.winner,
    });
  }
}

function renderBoardTitles() {
  let text;
  for (const key of Object.keys(players)) {
    if (gameState.mode === GAME_MODES.multi)
      text = gameState.turn === key ? "Your grid" : "Opponent's grid";
    else text = key === "player1" ? "Your grid" : "Opponent's grid";
    renderGameboardTitle(key, text);
  }
}

// place ships randomly on gameboard (use for both players while producing game features)
function placeShipsRandomly(player) {
  const directions = Object.values(PLACEMENT_DIRECTIONS);

  for (const ship of FLEET) {
    let placed;
    do {
      const direction = getRandomItem(directions);
      const coordinates = [];
      if (direction === PLACEMENT_DIRECTIONS.horizontal)
        coordinates.push(
          Math.floor(Math.random() * BOARD_SIZE.rows),
          Math.floor(Math.random() * (BOARD_SIZE.columns - ship.length + 1)),
        );
      else if (direction === PLACEMENT_DIRECTIONS.vertical)
        coordinates.push(
          Math.floor(Math.random() * (BOARD_SIZE.rows - ship.length + 1)),
          Math.floor(Math.random() * BOARD_SIZE.columns),
        );
      else throw new Error(`unknown direction: ${direction}`);

      placed = player.gameboard.placeShip({
        shipLength: ship.length,
        coordinates,
        direction,
      });
    } while (!placed);
  }
}

function resolveAttack(coordinates, opponentKey) {
  const opponent = players[opponentKey];
  const result = opponent.gameboard.receiveAttack(coordinates);
  if (result === ATTACK_RESULTS.rejected) return result;
  endTurn();
}

function playHumanTurn(coordinates, opponentKey) {
  if (
    gameState.phase !== GAME_PHASES.battle ||
    !gameState.turn ||
    players[gameState.turn].type === PLAYER_TYPES.computer ||
    gameState.turn === opponentKey
  )
    return;

  resolveAttack(coordinates, opponentKey);
}

function playComputerTurn() {
  if (!gameState.turn) return;

  setTimeout(() => {
    const opponentKey = Object.keys(players).find(
      (playerKey) => playerKey !== gameState.turn,
    );
    const opponent = players[opponentKey];

    const coordinates = getRandomItem(
      opponent.gameboard.getUnattackedCoordinates(),
    );

    const result = resolveAttack(coordinates, opponentKey);

    if (result === ATTACK_RESULTS.rejected)
      throw new Error(`Invalid coordinates passed: ${coordinates}`);
  }, 1500);
}

function initSetup(payload) {
  if (!Object.values(GAME_MODES).includes(payload.mode))
    throw new Error(`unknown game mode: ${payload.mode}`);

  gameState.mode = payload.mode;

  players.player1 = new Player({
    type: PLAYER_TYPES.human,
    name: payload.player1Name.trim(),
  });

  gameState.turn = "player1";

  switch (payload.mode) {
    case GAME_MODES.single:
      players.player2 = new Player({ type: PLAYER_TYPES.computer });
      placeShipsRandomly(players.player2);
      break;
    case GAME_MODES.multi:
      players.player2 = new Player({
        type: PLAYER_TYPES.human,
        name: payload.player2Name.trim(),
      });
      break;
  }

  if (payload.mode === GAME_MODES.single) startPlacement();
  else startHandoff();
}

function initBattle() {
  showScreen(SCREENS.game);
  gameState.turn = getRandomItem(Object.keys(players));
  if (gameState.mode === GAME_MODES.multi) startHandoff();
  else startTurn();
}

function passTurn() {
  const player1NoShipsLeft = players.player1.gameboard.allShipsSunk();
  const player2NoShipsLeft = players.player2.gameboard.allShipsSunk();

  if (player1NoShipsLeft || player2NoShipsLeft) {
    gameState.winner = player1NoShipsLeft ? players.player2 : players.player1;
    gameState.turn = null;
    gameState.phase = GAME_PHASES.over;
    renderWinner(announcements.winner(gameState.winner.name));
    renderBoards();
    return;
  }

  gameState.turn = Object.keys(players).find((key) => key !== gameState.turn);

  if (gameState.mode === GAME_MODES.multi) startHandoff();
  else startTurn();
}

function endTurn() {
  gameState.phase = GAME_PHASES.resolving;
  renderBoards();
  setTimeout(passTurn, 1200);
}

function startTurn() {
  const player = players[gameState.turn];
  gameState.phase = GAME_PHASES.battle;
  renderBoards();
  renderBoardTitles();
  renderAnnouncement(announcements.turn(player.name));
  if (player.type === PLAYER_TYPES.computer) playComputerTurn();
}

function startHandoff() {
  gameState.phase = GAME_PHASES.handoff;
  renderHandoffOverlay(getHandoffPayload());
}

function startPlacement() {
  gameState.phase = GAME_PHASES.placement;
  showScreen(SCREENS.placement);
  renderPlacementBoard(players[gameState.turn].gameboard.board);
}

function handleRandomizePlacement() {
  const player = players[gameState.turn];
  player.gameboard.resetBoard();
  placeShipsRandomly(player);
  renderPlacementBoard(player.gameboard.board);
}

function handleConfirmPlacement() {
  // might render an error message later
  if (!players[gameState.turn].gameboard.isFleetPlaced()) return;
  if (bothPlayersFleetsPlaced()) initBattle();
  else {
    gameState.turn = "player2";
    startHandoff();
  }
}

function handleConfirmHandoff() {
  if (bothPlayersFleetsPlaced()) startTurn();
  else startPlacement();
  closeHandoffOverlay();
}

showScreen(SCREENS.menu);
openMenu();
bindEvents({
  onSquareClick: playHumanTurn,
  onMenuFormSubmit: initSetup,
  onRandomizePlacementClick: handleRandomizePlacement,
  onConfirmPlacementClick: handleConfirmPlacement,
  onConfirmHandoffClick: handleConfirmHandoff,
});
