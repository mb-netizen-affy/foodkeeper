// Partagé entre le serveur (layout) et le navigateur (lib/theme.ts).
// Pas de "use client" ici : le layout doit pouvoir lire ce texte tel quel.

export const THEME_KEY = "fk-theme";

/**
 * Script lancé AVANT l'affichage (dans <head>) pour éviter un flash clair
 * au chargement quand le thème sombre est choisi.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;