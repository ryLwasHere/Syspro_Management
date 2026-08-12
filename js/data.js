/**
 * data.js
 * Empty data arrays - will be populated from API on app load.
 */
"use strict";
/* ---------- EMPTY DATA (will load from API) ---------- */
let TID=1000;
let SID=0;
let tasks=[];
let files=[];
let folders=[];
let shortcuts=[];
let notifs=[];
const NMETA={assign:["user","#E9F0FC","#2467D6"],due:["clock","#FBF1DE","#A8720E"],overdue:["alert","#FCEBEB","#DC4B4B"],done:["check","#E4F4EA","#1F9D5B"],upload:["up","#EDEAFB","#6E51C9"],share:["link","#E3F2EF","#0B7C6F"],comment:["msg","#F1F2F5","#4A5264"]};
const active=()=>tasks.filter(t=>!t.archived);
const archived=()=>tasks.filter(t=>t.archived);
