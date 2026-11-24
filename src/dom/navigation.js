export const SCREENS = {
  menu: "menu",
  game: "game",
  placement: "placement",
};

export function showScreen(screen) {
  if (!Object.values(SCREENS).includes(screen))
    throw new Error(`invalid screen variable passed: ${screen}`);

  for (const name of Object.values(SCREENS)) {
    document.querySelector(`[data-screen="${name}"]`).hidden = name !== screen;
  }
}
