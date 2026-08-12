/**
 * constants.js
 * Static lookup tables: status/priority meta, users, projects, file-type styling.
 */
"use strict";

/* ---------- META ---------- */
const STATUS={
  todo:{l:"To do",c:"#8A92A6",bg:"#F1F2F5",bd:"#E1E4EA"},
  progress:{l:"In progress",c:"#2467D6",bg:"#E9F0FC",bd:"#CFE0F8"},
  blocked:{l:"Blocked",c:"#DC4B4B",bg:"#FCEBEB",bd:"#F3CDCD"},
  done:{l:"Done",c:"#1F9D5B",bg:"#E4F4EA",bd:"#C6E8D4"}
};
const PRIO={
  critical:{l:"Critical",w:4,c:"#DC4B4B",bg:"#FCEBEB"},
  high:{l:"High",w:3,c:"#D96A24",bg:"#FBEDE2"},
  medium:{l:"Medium",w:2,c:"#2467D6",bg:"#E9F0FC"},
  low:{l:"Low",w:1,c:"#8A92A6",bg:"#F1F2F5"}
};
const USERS=["Alex Rivera","Maya Chen","Jonas Weber","Priya Nair","Tomás Silva"];
const UCOL={"Alex Rivera":["#E3F2EF","#096A60"],"Maya Chen":["#EDEAFB","#5A46B8"],"Jonas Weber":["#E9F0FC","#1F5ABF"],"Priya Nair":["#FBEDE2","#B25A1D"],"Tomás Silva":["#FCEBEB","#B33A3A"]};
const ini=n=>n.split(" ").map(x=>x[0]).slice(0,2).join("");
const avatar=(n,cls="")=>{const[b,f]=UCOL[n]||["#EEF0F3","#4A5264"];return `<div class="avatar ${cls}" style="background:${b};color:${f}" data-tip="${esc(n)}">${ini(n)}</div>`};
const PROJECTS=["Orion Redesign","Data Pipeline v2","Mobile App","Website Relaunch","Q3 Research","Ops"];
const PSTAT={todo:"TODO",progress:"IN PROGRESS",blocked:"BLOCKED",done:"DONE"};
const statusChip=s=>{const m=STATUS[s];return `<span class="chip" style="color:${m.c};background:${m.bg};border-color:${m.bd}"><span class="dot" style="background:${m.c}"></span>${m.l}</span>`};
const prioChip=p=>{const m=PRIO[p];return `<span class="chip" style="color:${m.c};background:${m.bg}">${ic("flag",10,2.2)}${m.l}</span>`};
const FTYPE={pdf:["PDF","#FCEBEB","#C03B3B"],xlsx:["XLS","#E4F4EA","#1F7A46"],csv:["CSV","#E4F4EA","#1F7A46"],pptx:["PPT","#FBEDE2","#C25E1E"],docx:["DOC","#E9F0FC","#2461C9"],md:["MD","#F1F2F5","#4A5264"],png:["PNG","#EDEAFB","#6E51C9"],svg:["SVG","#EDEAFB","#6E51C9"],zip:["ZIP","#FBF1DE","#A8720E"],json:["JSON","#E3F2EF","#0B7C6F"]};
const fileTile=(ext,sz)=>{const t=FTYPE[ext]||["FILE","#F1F2F5","#4A5264"];return `<div class="fext" style="${sz}background:${t[1]};color:${t[2]}">${t[0]}</div>`};
