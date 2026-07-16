import DeskDock from "./DeskDock";

/**
 * Site chrome entry: the floating "Desk Dock" nav card (logo chip, sliding
 * sticker nav, social chips, mini CONTACT stamp, scroll progress, mobile
 * panel). Replaces the old full-width 64px header bar.
 */
export function Header() {
  return <DeskDock />;
}

export default Header;
