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
} from "./dom";

const players = {
  player1: null,
  player2: null,
};

const gameState = {
  turn: null,
  winner: null,
  mode: null,
};

const GAME_MODES = {
  single: "single",
  multi: "multi",
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

  gameState.mode === GAME_MODES.single
    ? players[playerKey].type === PLAYER_TYPES.human
    : gameState.turn === playerKey;
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
  gameState.turn = opponentKey;
  renderBoards();
  renderAnnouncement(announcements.turn(opponent.name));
  playGame();
}

function playHumanTurn(coordinates, opponentKey) {
  if (
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

function playGame() {
  const player1NoShipsLeft = players.player1.gameboard.allShipsSunk();
  const player2NoShipsLeft = players.player2.gameboard.allShipsSunk();

  if (player1NoShipsLeft || player2NoShipsLeft) {
    gameState.winner = player1NoShipsLeft ? players.player2 : players.player1;
    gameState.turn = null;
    renderWinner(announcements.winner(gameState.winner.name));
    renderBoards();
    return;
  }

  switch (players[gameState.turn].type) {
    case PLAYER_TYPES.computer:
      playComputerTurn();
  }
}

function initGame(payload) {
  setUpGame(payload);
  showScreen(SCREENS.game);
  renderBoards();
  playGame();
}

function setUpGame(payload) {
  if (!Object.values(GAME_MODES).includes(payload.mode))
    throw new Error(`unknown game mode: ${payload.mode}`);

  gameState.mode = payload.mode;
  players.player1 = new Player({
    type: PLAYER_TYPES.human,
    name: `${payload.player1Name}`,
  });

  switch (payload.mode) {
    case GAME_MODES.single:
      players.player2 = new Player({ type: PLAYER_TYPES.computer });
  }

  placeShipsRandomly(players.player1);
  placeShipsRandomly(players.player2);

  gameState.turn = getRandomItem(Object.keys(players));
  renderAnnouncement(announcements.turn(players[gameState.turn].name));
}

showScreen(SCREENS.menu);
openMenu();
bindEvents({ onSquareClick: playHumanTurn, onMenuFormSubmit: initGame });
