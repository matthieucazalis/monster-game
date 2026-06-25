// Gestion des couleurs personnalisables (fond de bureau + barre de titre
// des fenêtres). S'appuie sur le système de tokens --win-* déjà défini
// dans home.css / inventory.css (--win-bg, --win-accent, --win-accent2).
// Les valeurs sont stockées dans le localStorage et appliquées sur <html>,
// donc valables sur toutes les pages, y compris l'écran de connexion.

export const THEME_STORAGE_KEY = "theme-colors";

export interface ThemeColors {
  bgColor: string; // --win-bg : fond du bureau
  titlebarColor: string; // --win-accent : côté gauche du dégradé de titre
}

// Couleurs d'origine du thème "Windows 98"
export const DEFAULT_THEME: ThemeColors = {
  bgColor: "#008080",
  titlebarColor: "#000080",
};

function clampHex(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export function getStoredTheme(): ThemeColors {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    const parsed = JSON.parse(raw);
    return {
      bgColor: clampHex(parsed.bgColor, DEFAULT_THEME.bgColor),
      titlebarColor: clampHex(
        parsed.titlebarColor,
        DEFAULT_THEME.titlebarColor,
      ),
    };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function saveTheme(colors: ThemeColors) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
}

export function clearStoredTheme() {
  localStorage.removeItem(THEME_STORAGE_KEY);
}

// Applique les couleurs sur <html> en posant --win-bg, --win-accent et
// --win-accent2 (le coté droit du dégradé, calculé automatiquement comme
// une version éclaircie de --win-accent pour garder l'effet de dégradé).
export function applyTheme(colors: ThemeColors = getStoredTheme()) {
  const root = document.documentElement;
  root.style.setProperty("--win-bg", colors.bgColor);
  root.style.setProperty("--win-accent", colors.titlebarColor);
  root.style.setProperty("--win-accent2", lighten(colors.titlebarColor, 35));
}

// Éclaircit une couleur hex de `percent`% vers le blanc.
function lighten(hex: string, percent: number): string {
  const h = clampHex(hex, DEFAULT_THEME.titlebarColor).slice(1);
  const num = parseInt(h, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * (percent / 100));

  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
