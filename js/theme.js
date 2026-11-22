/*
  theme.js - Stage 9: light / dark mode

  How it works:
    - style.css has a second set of colour variables for [data-theme="dark"]
    - this file puts data-theme="dark" (or "light") on the <html> element
    - every colour in the CSS uses var(--name), so the whole page switches at once
    - the choice is saved in localStorage

  NOTE: unlike the other scripts, this one is loaded WITHOUT "defer".
  It runs straight away, before the page is drawn, so a dark-mode user
  never sees a white flash while the page loads.

  Every place that differs from the course style is marked with "MODERN:".
*/

const THEME_KEY = "studyhub-theme";

// work out which theme to start with
function startingTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  // MODERN: matchMedia asks the operating system whether the user prefers dark mode
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// switch the page to a theme
function applyTheme(theme) {
  // MODERN: document.documentElement is the <html> element.
  // dataset.theme = "dark" adds the attribute data-theme="dark" to it.
  document.documentElement.dataset.theme = theme;
}

// apply the theme immediately (the <html> element already exists at this point)
applyTheme(startingTheme());


// the moon / sun button in the header
function toggleTheme() {
  const newTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  updateThemeButton();

  // the canvas does not use CSS, so redraw the chart in the new colours
  // (typeof check: only if chart.js is loaded)
  if (typeof drawChart === "function") {
    drawChart();
  }
}

// show a moon in light mode and a sun in dark mode
function updateThemeButton() {
  const button = document.getElementById("themeToggle");
  const isDark = document.documentElement.dataset.theme === "dark";
  button.textContent = isDark ? "☀️" : "🌙";   // ☀️ or 🌙
  // MODERN: aria-label is what screen readers say for a button that only shows an icon
  button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  button.title = button.getAttribute("aria-label");
}

// MODERN: DOMContentLoaded fires when the HTML has been read, like <body onLoad>
// but a little earlier. We need it here because this script is NOT deferred,
// so the button does not exist yet when this file first runs.
document.addEventListener("DOMContentLoaded", function () {
  updateThemeButton();
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
});
