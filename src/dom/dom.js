import { bindMenuEvents } from "./screens/menu";
import { bindPlacementEvents } from "./screens/placement";
import { bindBattleEvents } from "./screens/battle";
import { bindOverlayEvents } from "./overlay";

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
export { renderHandoffOverlay, closeHandoffOverlay } from "./overlay";

export function bindEvents(callbacks) {
  bindMenuEvents(callbacks);
  bindPlacementEvents(callbacks);
  bindBattleEvents(callbacks);
  bindOverlayEvents(callbacks);
}
