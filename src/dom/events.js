import { bindMenuEvents } from "./screens/menu";
import { bindPlacementEvents } from "./screens/placement";
import { bindBattleEvents } from "./screens/battle";
import { bindOverlayEvents } from "./overlay";

export function bindEvents(callbacks) {
  bindMenuEvents(callbacks);
  bindPlacementEvents(callbacks);
  bindBattleEvents(callbacks);
  bindOverlayEvents(callbacks);
}
