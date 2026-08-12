/**
 * theme.js
 * Persisted light/dark theme controls with high-contrast dark-mode defaults.
 */
"use strict";

const THEME_KEY = "syspro-theme";

function currentTheme(){
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function setTheme(theme, opts={}){
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  const toggle = document.querySelector("#themeToggle");
  if(toggle){
    const isDark = next === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    toggle.querySelector(".theme-text").textContent = isDark ? "Dark" : "Light";
  }
  if(!opts.skipSave){
    localStorage.setItem(THEME_KEY, next);
  }
}

function toggleTheme(){
  const next = currentTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  toast(`${next === "dark" ? "Dark" : "Light"} mode enabled`, "info");
}

document.addEventListener("DOMContentLoaded", () => setTheme(currentTheme(), {skipSave:true}));
