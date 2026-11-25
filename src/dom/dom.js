import { bindMenuEvents } from "./screens/menu";
import { bindPlacementEvents } from "./screens/placement";
import { bindBattleEvents } from "./screens/battle";

// TODO: remove when index.js exists
export { SCREENS, showScreen } from "./navigation";
export { openMenu } from "./screens/menu";
export { renderFleet, renderPlacementBoard } from "./screens/placement";
export {
  renderGameBoard,
  renderGameboardTitle,
  renderAnnouncement,
  renderWinner,
} from "./screens/battle";

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
  document.body.addEventListener("click", (e) =>
    handleOverlayClick(e, callbacks),
  );

  bindMenuEvents(callbacks);
  bindPlacementEvents(callbacks);
  bindBattleEvents(callbacks);
}

function handleOverlayClick(e, callbacks) {
  const button = e.target.closest(
    ".handoff-overlay [data-action='confirmHandoff']",
  );
  if (button) callbacks.onConfirmHandoffClick();
}
