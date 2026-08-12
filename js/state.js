/**
 * state.js
 * Central mutable UI state object (current page, filters, view modes, etc).
 */
"use strict";
/* ---------- STATE ---------- */
const state={
  page:"home", q:"", taskView:"board", taskSort:"due", taskFilters:{status:new Set(),prio:new Set(),who:new Set(),proj:new Set()},
  calView:"month", calAnchor:new Date(), homeCalView:"month", homeAnchor:new Date(),
  sel:null, filesView:"grid", fq:"", ftype:"all", fsort:"mod", folder:null,
  arc:{q:"",proj:"all",who:"all",range:"all"}, arcSort:{k:"doneAt",dir:-1}, drawerTask:null,
};
