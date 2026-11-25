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

function handleClick(e, callbacks) {
  const button = e.target.closest("[data-action='confirmHandoff']");

  if (button) callbacks.onConfirmHandoffClick();
}

export function bindOverlayEvents(callbacks) {
  const overlay = document.querySelector(".handoff-overlay");

  overlay.addEventListener("click", (e) => handleClick(e, callbacks));
}
