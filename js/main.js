/**
 * main.js
 * App boot sequence: load data from API, then initial render and boot-skeleton fade-out.
 */
"use strict";
/* ---------- BOOT ---------- */
(async function boot(){
  await loadInitialData();
  renderBell();
  render();
  if(state.page==="home")fillCalendar("home");
  setTimeout(()=>{$("#boot").classList.add("gone");$("#app").classList.add("ready");setTimeout(()=>$("#boot").remove(),350)},550);
})();
