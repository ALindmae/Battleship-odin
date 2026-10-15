import { Player, PLAYER_TYPES } from "./player";
import "./styles.css";
import {
  PLACEMENT_DIRECTIONS,
  BOARD_SIZE,
  FLEET,
  ATTACK_RESULTS,
} from "./gameboard";
import { renderGameBoard, bindEvents } from "./dom";

const players = {
  player1: null,
  player2: null,
};

const gameState = {
  turn: "player1",
};

players.player1 = new Player({ type: PLAYER_TYPES.human, name: "John" });
players.player2 = new Player({ type: PLAYER_TYPES.computer });

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

function playHumanTurn(coordinates, opponentKey) {
  if (
    !gameState.turn ||
    players[gameState.turn].type === PLAYER_TYPES.computer ||
    gameState.turn === opponentKey
  )
    return;

  const opponent = players[opponentKey];

  const result = opponent.gameboard.receiveAttack(coordinates);
  if (result === ATTACK_RESULTS.rejected) return;

  gameState.turn = opponentKey;

  renderGameBoard({
    board: opponent.gameboard.board,
    boardSlot: opponentKey,
    showShips: opponentKey === "player1",
  });
}

placeShipsRandomly(players.player1);
placeShipsRandomly(players.player2);

for (const [key, player] of Object.entries(players)) {
  renderGameBoard({
    board: player.gameboard.board,
    boardSlot: key,
    showShips: key === "player1",
  });
}

bindEvents({ onSquareClick: playHumanTurn });
