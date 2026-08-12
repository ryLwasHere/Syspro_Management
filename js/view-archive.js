/**
 * view-archive.js
 * Archive page: completed/archived task table with filters.
 */
"use strict";

/* ================================================================
   ARCHIVE
================================================================ */
function viewArchive(){
  const a=state.arc;
  let list=archived().filter(t=>
    (!a.q||t.title.toLowerCase().includes(a.q.toLowerCase())||t.id.toLowerCase().includes(a.q.toLowerCase()))&&
    (a.proj==="all"||t.project===a.proj)&&(a.who==="all"||(t.doneBy||t.assignee)===a.who)&&
    (a.range==="all"||(t.doneAt&&Date.now()-t.doneAt<({"7":7,"30":30}[a.range])*864e5)));
  const dir=state.arcSort.dir,k=state.arcSort.k;
  list.sort((x,y)=>((x[k]||0)-(y[k]||0))*dir*-1||0);
  list=list.sort((x,y)=>(y.doneAt||0)-(x.doneAt||0));
  const opt=(sel,val,l)=>PROJECTS.map(p=>`<option ${sel===p?"selected":""}>${p}</option>`).join("");
  return `
  <div class="page-head">
    <div><div class="page-title">Archive</div><div class="page-sub">${archived().length} completed tasks stored · restore anytime.</div></div>
  </div>
  <div class="toolbar">
    <div style="position:relative;width:230px"><input class="inp" id="arcSearch" placeholder="Search archived tasks…" value="${esc(a.q)}" style="padding-left:32px">
      <span style="position:absolute;left:10px;top:8px;color:var(--ink-4)">${ic("search",14)}</span></div>
    <select class="inp" id="arcRange" style="width:150px">${[["all","Any date"],["7","Last 7 days"],["30","Last 30 days"]].map(([v,l])=>`<option value="${v}" ${a.range===v?"selected":""}>${l}</option>`).join("")}</select>
    <select class="inp" id="arcProj" style="width:170px"><option value="all" ${a.proj==="all"?"selected":""}>All projects</option>${PROJECTS.map(p=>`<option ${a.proj===p?"selected":""}>${p}</option>`).join("")}</select>
    <select class="inp" id="arcWho" style="width:160px"><option value="all" ${a.who==="all"?"selected":""}>All members</option>${USERS.map(u=>`<option ${a.who===u?"selected":""}>${u}</option>`).join("")}</select>
    <span class="spacer"></span><span class="mono" style="font-size:10.5px;color:var(--ink-4)">${list.length} results</span>
  </div>
  ${list.length?`<table class="tbl"><thead><tr><th>Task</th><th>Project</th><th>Completed by</th><th>Completed date</th><th>Status</th><th style="width:110px">Actions</th></tr></thead>
    <tbody>${list.map(t=>`
      <tr data-action="openTask" data-id="${t.id}">
        <td><span class="tt">${esc(t.title)}</span><div class="tid" style="margin-top:2px">${t.id}</div></td>
        <td class="cell">${esc(t.project)}</td>
        <td><span style="display:inline-flex;align-items:center;gap:7px">${avatar(t.doneBy||t.assignee,"av-sm")}${esc(t.doneBy||t.assignee)}</span></td>
        <td class="cell mono" style="font-size:11px">${t.doneAt?new Date(t.doneAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})+" · "+new Date(t.doneAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"—"}</td>
        <td>${statusChip(t.status)}</td>
        <td><div class="arc-actions">
          <button class="icon-btn" data-action="restoreTask" data-id="${t.id}" data-tip="Restore">${ic("restore",13)}</button>
          <button class="icon-btn del" data-action="askDeleteArchived" data-id="${t.id}" data-tip="Delete forever">${ic("trash",13)}</button>
        </div></td></tr>`).join("")}</tbody></table>`:
  `<div class="panel"><div class="empty">${ic("archive",20)}<b>Archive is empty</b><p>Completed tasks you archive will appear here, safe and searchable.</p></div></div>`}`;
}
