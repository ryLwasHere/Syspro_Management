/**
 * main.js
 * App boot sequence: load data from API, then initial render and boot-skeleton fade-out.
 */
"use strict";

/* ---------- THEME ---------- */
function updateThemeIcons(){
  const isDark=document.body.classList.contains("dark");
  const sunIcon=document.querySelector(".sun-icon");
  const moonIcon=document.querySelector(".moon-icon");
  if(sunIcon&&moonIcon){
    sunIcon.style.display=isDark?"none":"";
    moonIcon.style.display=isDark?"":"none";
  }
}

function initTheme(){
  const saved=localStorage.getItem("syspro-theme");
  if(saved==="dark"){document.body.classList.add("dark");}
  updateThemeIcons();
}

/* ---------- BOOT ---------- */
(async function boot(){
  initTheme();
  await loadInitialData();
  renderBell();
  render();
  if(state.page==="home")fillCalendar("home");
  setTimeout(()=>{$("#boot").classList.add("gone");$("#app").classList.add("ready");setTimeout(()=>$("#boot").remove(),350)},550);
})();
