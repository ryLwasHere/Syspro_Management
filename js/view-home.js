/**
 * view-home.js
 * Home page view: greeting, shortcuts grid, today's tasks, mini calendar.
 */
"use strict";

/* ================================================================
   HOME
================================================================ */
function viewHome(){
  const due=t=>t.due?parseISO(t.due).getTime()+((t.time?parseInt(t.time):23)*36e5):Infinity;
  const todays=active().filter(t=>t.due===TODAY&&t.status!=="done").sort((a,b)=>due(a)-due(b));
  const overdue=active().filter(t=>t.due&&t.due<TODAY&&t.status!=="done");
  const inprog=active().filter(t=>t.status==="progress");
  const recFiles=[...files].sort((a,b)=>b.mod-a.mod).slice(0,4);
  const doneRecent=tasks.filter(t=>t.status==="done"&&t.doneAt).sort((a,b)=>b.doneAt-a.doneAt).slice(0,3);
  
  // Show only the first pending task (earliest time), or completed ones if all done
  const firstPending = todays.length > 0 ? [todays[0]] : [];
  const completedToday = active().filter(t=>t.due===TODAY&&t.status==="done").sort((a,b)=>due(a)-due(b));
  const displayTasks = firstPending.length > 0 ? firstPending : completedToday.slice(0, 1);
  
  const scRows=shortcuts.slice(0,7).map(s=>`
    <div class="sc-row" onclick="window.open('${esc(s.url)}','_blank')">
      <div class="apptile" style="background:${s.bg};color:${s.fg}">${esc(s.g)}</div>
      <span class="nm">${esc(s.name)}</span><span class="sc-ext">${ic("ext",13,1.9)}</span></div>`).join("");
  return `
  <div class="page-head" style="align-items:center;margin-bottom:0">
    <div style="display:flex;align-items:center;gap:16px;flex:1">
      <div>
        <div class="hello">Hello, Alex <span style="display:inline-block;transform:translateY(-1px)">👋</span></div>
      </div>
      <div class="stat-strip">
        <div class="stat"><span class="sq" style="background:var(--blue)"></span><b>${todays.length}</b><span>due<br>today</span></div>
        <div class="stat"><span class="sq" style="background:var(--red)"></span><b>${overdue.length}</b><span>overdue</span></div>
        <div class="stat"><span class="sq" style="background:var(--amber)"></span><b>${inprog.length}</b><span>in<br>progress</span></div>
      </div>
      <div class="page-actions" style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span class="mono" style="font-size:11px;color:var(--ink-3)">${new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</span>
        <button class="btn primary" data-action="newTask">${ic("plus",13,2.4)} New task</button>
      </div>
    </div>
  </div>
  <div class="home-grid">
    <div class="panel shortcuts-panel">
      <div class="panel-h"><span class="panel-t">${ic("grid",14)} Shortcuts</span>
        <button class="btn xs ghost panel-a" data-action="nav" data-page="shortcuts">Manage</button></div>
      <div style="padding:8px 0 4px;flex:1;overflow-y:auto">${scRows}
        <button class="sc-add" data-action="addShortcut">${shortcuts.length>=7?ic("pen",12,2.4):ic("plus",12,2.4)} ${shortcuts.length>=7?"Edit shortcuts":"Add shortcut"}</button>
      </div>
    </div>
    <div class="panel calendar-panel">
      <div class="panel-h cal-toolrow" style="padding:10px 14px;flex:0 0 auto">
        <span class="panel-t">${ic("cal",14)} Calendar</span>
        <span class="mono" style="font-size:11.5px;font-weight:600" id="hcalTitle"></span>
        <div style="margin-left:auto;display:flex;gap:6px;align-items:center">
          <button class="icon-btn" style="width:26px;height:26px" data-action="calNav" data-scope="home" data-dir="-1" data-tip="Previous">${ic("chevL",13,2.2)}</button>
          <button class="btn xs" data-action="calToday" data-scope="home">Today</button>
          <button class="icon-btn" style="width:26px;height:26px" data-action="calNav" data-scope="home" data-dir="1" data-tip="Next">${ic("chevR",13,2.2)}</button>
        </div>
      </div>
      <div style="padding:8px 12px 4px;display:flex;justify-content:space-between;align-items:center;flex:0 0 auto">
        <div class="seg" id="hcalSeg">
          ${["month","week","day"].map(v=>`<button class="${state.homeCalView===v?"on":""}" data-action="calView" data-scope="home" data-view="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join("")}
        </div>
        <button class="btn xs ghost" data-action="nav" data-page="calendar">Open calendar ${ic("ext",11,2)}</button>
      </div>
      <div id="hcalBody" style="padding:6px 12px 14px"></div>
    </div>
    <div class="home-right">
      <div class="panel">
        <div class="panel-h"><span class="panel-t">${ic("tasks",14)} Today's Tasks</span><span class="chip plain mono panel-a">${todays.length}</span></div>
        ${displayTasks.length?displayTasks.map(t=>`
          <div class="tk-item" data-action="openTask" data-id="${t.id}">
            <button class="ckbox ${t.status==="done"?"done":""}" data-action="toggleDone" data-id="${t.id}" data-tip="${t.status==="done"?"Reopen":"Mark done"}" aria-label="Complete">${ic("check",10,3)}</button>
            <div style="min-width:0;flex:1">
              <div class="tk-title">${esc(t.title)}</div>
              <div class="tk-meta">
                <span class="chip" style="color:${PRIO[t.prio].c};background:${PRIO[t.prio].bg};padding:1.5px 6px;font-size:10px"><span class="dot" style="background:${PRIO[t.prio].c}"></span>${PRIO[t.prio].l}</span>
                ${dueLabel(t)} ${statusChip(t.status)}
              </div>
            </div>
          </div>`).join(""):`<div class="empty">${ic("check",20)}<b>Nothing due today</b><p>Enjoy the clear runway — or pull something forward.</p></div>`}
      </div>
      <div class="panel" style="flex:1;min-height:0;display:flex;flex-direction:column">
        <div class="panel-h"><span class="panel-t">${ic("folder",14)} Files / Library</span>
          <button class="btn xs ghost panel-a" data-action="nav" data-page="files">All files</button></div>
        <div class="file-dropzone" data-action="upload" style="border:2px dashed var(--line-3);border-radius:8px;margin:10px 14px;padding:20px;text-align:center;cursor:pointer;transition:all .15s;background:var(--panel-2)" ondragover="event.preventDefault();this.style.background='var(--acc-soft)';this.style.borderColor='var(--acc)'" ondragleave="this.style.background='var(--panel-2)';this.style.borderColor='var(--line-3)'" ondrop="event.preventDefault();this.style.background='var(--panel-2)';this.style.borderColor='var(--line-3)';const f=event.dataTransfer.files;if(f.length){toast(f.length+' file'+(f.length>1?'s':'')+' uploaded','success');setTimeout(()=>{$('#fileInput').click()},100)}">
          <div style="color:var(--ink-3);margin-bottom:6px">${ic("up",24,2)}</div>
          <div style="font-weight:600;font-size:12px;color:var(--ink-2)">Drop files here</div>
          <div style="font-size:11px;color:var(--ink-4);margin-top:4px">or click to upload</div>
        </div>
        ${recFiles.map(f=>{const ext=f.name.split(".").pop();return `
          <div class="f-row" data-action="previewFile" data-id="${f.id}">
            ${fileTile(ext,"")}
            <span class="fn">${esc(f.name)}</span><span class="fm">${relTime(f.mod)}</span>
          </div>`}).join("")}
      </div>
      <div class="panel">
        <div class="panel-h"><span class="panel-t">${ic("archive",14)} Archive / Done</span>
          <button class="btn xs ghost panel-a" data-action="nav" data-page="archive">Archive</button></div>
        ${doneRecent.map(t=>`
          <div class="done-item" data-action="openTask" data-id="${t.id}" style="cursor:pointer">
            <span class="ckbox done" style="cursor:default">${ic("check",9,3.2)}</span>
            <span class="dt">${esc(t.title)}</span>
            <span class="fm mono" style="font-size:10px;color:var(--ink-4)">${t.doneAt?relTime(t.doneAt):""}</span>
          </div>`).join("")}
      </div>
    </div>
  </div>`;
}
