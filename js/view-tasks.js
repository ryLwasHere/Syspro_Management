/**
 * view-tasks.js
 * Tasks page: filtering/sorting, board/list/table views, task drawer & modal.
 */
"use strict";

/* ================================================================
   TASKS PAGE
================================================================ */
function filteredTasks(){
  const f=state.taskFilters,q=state.q.toLowerCase();
  let list=active().filter(t=>
    (!f.status.size||f.status.has(t.status))&&(!f.prio.size||f.prio.has(t.prio))&&
    (!f.who.size||f.who.has(t.assignee))&&(!f.proj.size||f.proj.has(t.project))&&
    (!q||(t.title+t.id+t.tags.join(" ")+t.project).toLowerCase().includes(q)));
  const by={due:(a,b)=>(a.due||"9999").localeCompare(b.due||"9999")||prioW[b.prio]-prioW[a.prio],
    prio:(a,b)=>prioW[b.prio]-prioW[a.prio],title:(a,b)=>a.title.localeCompare(b.title),created:(a,b)=>b.createdAt-a.createdAt};
  return list.sort(by[state.taskSort]||by.due);
}
function activeFilterCount(){const f=state.taskFilters;return f.status.size+f.prio.size+f.who.size+f.proj.size}
function viewTasks(){
  return `
  <div class="page-head">
    <div><div class="page-title">Tasks</div><div class="page-sub">${active().length} active · ${active().filter(t=>t.due&&t.due<TODAY&&t.status!=="done").length} overdue</div></div>
    <div class="page-actions">
      <div class="seg">${["list","board","table"].map(v=>`<button class="${state.taskView===v?"on":""}" data-action="taskView" data-view="${v}">${ic(v==="list"?"list":v==="board"?"board":"table",13)} ${v[0].toUpperCase()+v.slice(1)}</button>`).join("")}</div>
      <button class="btn primary" data-action="newTask">${ic("plus",13,2.4)} Create Task</button>
    </div>
  </div>
  <div class="toolbar">
    <div style="position:relative;width:230px">
      <input class="inp" id="taskSearch" placeholder="Search tasks…" value="${esc(state.q)}" style="padding-left:32px">
      <span style="position:absolute;left:10px;top:8px;color:var(--ink-4)">${ic("search",14)}</span>
    </div>
    <button class="btn" data-action="toggleFilters">${ic("filter",13)} Filter ${activeFilterCount()?`<span class="filter-count">${activeFilterCount()}</span>`:""}</button>
    <select class="inp" id="taskSortSel" style="width:158px">
      ${[["due","Sort · Due date"],["prio","Sort · Priority"],["title","Sort · Title"],["created","Sort · Created"]].map(([v,l])=>`<option value="${v}" ${state.taskSort===v?"selected":""}>${l}</option>`).join("")}
    </select>
    ${activeFilterCount()||state.q?`<button class="btn ghost sm" data-action="clearTaskFilters">${ic("x",11,2.4)} Clear</button>`:""}
    <span class="spacer"></span>
    <span class="mono" style="font-size:10.5px;color:var(--ink-4)">${filteredTasks().length} shown · drag cards to change status</span>
  </div>
  <div id="taskArea">${taskAreaHTML()}</div>`;
}
function taskAreaHTML(){
  const list=filteredTasks();
  if(!list.length)return `<div class="panel"><div class="empty">${ic("inbox",20)}<b>No tasks match</b><p>Try adjusting search or filters — or create a new task.</p><button class="btn sm" data-action="clearTaskFilters">Clear filters</button></div></div>`;
  if(state.taskView==="board")return boardHTML(list);
  if(state.taskView==="list")return listHTML(list);
  return tableHTML(list);
}
function rerenderTasks(inputEl){
  const caret=inputEl?inputEl.selectionStart:null;
  $("#taskArea").innerHTML=taskAreaHTML();bindBoardDnD();
  if(inputEl){inputEl.focus();inputEl.setSelectionRange(caret,caret)}
}
function cardMeta(t){
  return `<div class="tk-meta" style="margin-top:0">
    <span class="tid">${t.id}</span>
    ${t.due?dueLabel(t):`<span class="tk-time">no date</span>`}
    ${t.tags.slice(0,2).map(x=>`<span class="tag">#${esc(x)}</span>`).join("")}
    <span style="margin-left:auto">${avatar(t.assignee,"av-sm")}</span></div>`;
}
function boardHTML(list){
  return `<div class="board dotgrid">${Object.keys(STATUS).map(s=>{
    const m=STATUS[s],col=list.filter(t=>t.status===s);
    return `<div class="bcol" data-status="${s}">
      <div class="bcol-h"><span class="dot" style="background:${m.c}"></span><span class="nm">${m.l}</span><span class="ct">${col.length}</span>
        <button class="add" data-action="newTask" data-status="${s}" data-tip="Add to ${m.l}" aria-label="Add task">${ic("plus",13,2.2)}</button></div>
      <div class="bcol-body">${col.map(t=>`
        <div class="bcard ${t.status==="done"?"done":""}" draggable="true" data-tid="${t.id}" data-action="openTask" data-id="${t.id}" style="border-left:3px solid ${PRIO[t.prio].c}">
          <div class="bt">${esc(t.title)}</div>${cardMeta(t)}</div>`).join("")||`<div style="padding:14px;text-align:center;font-size:11px;color:var(--ink-4);border:1px dashed var(--line-2);border-radius:8px">Drop tasks here</div>`}
      </div></div>`}).join("")}</div>`;
}
function bindBoardDnD(){
  $$(".bcard[draggable]").forEach(c=>{
    c.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",c.dataset.tid);c.classList.add("dragging")});
    c.addEventListener("dragend",()=>c.classList.remove("dragging"));
  });
  $$(".bcol").forEach(col=>{
    col.addEventListener("dragover",e=>{e.preventDefault();col.classList.add("dragover")});
    col.addEventListener("dragleave",()=>col.classList.remove("dragover"));
    col.addEventListener("drop",e=>{
      e.preventDefault();col.classList.remove("dragover");
      const t=tasks.find(x=>x.id===e.dataTransfer.getData("text/plain"));
      if(t&&t.status!==col.dataset.status){
        const old=STATUS[t.status].l;t.status=col.dataset.status;
        t.activity.unshift({who:"Alex Rivera",txt:`moved this from ${old} to <b>${STATUS[t.status].l}</b>`,ts:Date.now()});
        if(t.status==="done"&&!t.doneAt){t.doneAt=Date.now();t.doneBy="Alex Rivera"}
        toast(`${t.id} → ${STATUS[t.status].l}`,"success");
        $("#taskArea").innerHTML=taskAreaHTML();bindBoardDnD();renderBell();
      }
    });
  });
}
function listHTML(list){
  return Object.keys(STATUS).map(s=>{
    const col=list.filter(t=>t.status===s);if(!col.length)return"";
    const m=STATUS[s];
    return `<div class="list-group-h"><span class="dot" style="background:${m.c}"></span>${m.l} <span style="opacity:.7">· ${col.length}</span></div>`+
    col.map(t=>`
      <div class="trow ${t.status==="done"?"isdone":""}" data-action="openTask" data-id="${t.id}">
        <button class="ckbox ${t.status==="done"?"done":""}" data-action="toggleDone" data-id="${t.id}">${ic("check",10,3)}</button>
        <div style="min-width:0"><div class="tt">${esc(t.title)}</div><div class="tags"><span class="tid">${t.id}</span>${t.tags.map(x=>`<span class="tag">#${esc(x)}</span>`).join("")}</div></div>
        <div>${statusChip(t.status)}</div>
        <div>${prioChip(t.prio)}</div>
        <div class="cell">${t.due?dueLabel(t):"—"}</div>
        <div class="cell" style="display:flex;align-items:center;gap:7px">${avatar(t.assignee,"av-sm")} ${esc(t.assignee.split(" ")[0])}</div>
        <div class="cell">${esc(t.project)}</div>
      </div>`).join("");
  }).join("");
}
function tableHTML(list){
  return `<table class="tbl"><thead><tr>
    <th style="width:90px">ID</th><th>Task</th><th>Status</th><th>Priority</th><th>Due</th><th>Assignee</th><th>Project</th><th>Tags</th></tr></thead>
    <tbody>${list.map(t=>`
      <tr class="${t.status==="done"?"isdone":""}" data-action="openTask" data-id="${t.id}">
        <td><span class="tid">${t.id}</span></td>
        <td><span class="tt">${esc(t.title)}</span></td>
        <td>${statusChip(t.status)}</td><td>${prioChip(t.prio)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:${t.due&&t.due<TODAY&&t.status!=="done"?"var(--red)":"var(--ink-2)"}">${t.due?fmtD(t.due)+(t.time?" "+t.time:""):"—"}${t.due&&t.due<TODAY&&t.status!=="done"?" ⚠":""}</td>
        <td><span style="display:inline-flex;align-items:center;gap:7px">${avatar(t.assignee,"av-sm")}${esc(t.assignee)}</span></td>
        <td class="cell">${esc(t.project)}</td>
        <td>${t.tags.map(x=>`<span class="tag">#${esc(x)}</span>`).join(" ")||'<span style="color:var(--ink-4)">—</span>'}</td>
      </tr>`).join("")}</tbody></table>`;
}
function bindFilters(){/* popover bound on demand */}
function filterPopover(anchor){
  const f=state.taskFilters;
  const grp=(label,key,vals)=>`<div style="padding:8px 14px"><div class="lbl">${label}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${vals.map(v=>`
      <label class="chip plain" style="cursor:pointer;${f[key].has(v)?"background:var(--acc-soft);border-color:#BFE0D9;color:var(--acc-700)":""}">
      <input type="checkbox" hidden data-fk="${key}" value="${esc(v)}" ${f[key].has(v)?"checked":""}>${esc(key==="status"?STATUS[v].l:key==="prio"?PRIO[v].l:v)}</label>`).join("")}</div></div>`;
  const p=popover(anchor,`<div class="pop-h">Filters ${activeFilterCount()?`<span class="chip plain mono">${activeFilterCount()}</span>`:""}
      <button class="btn xs ghost" style="margin-left:auto" id="fClear">Reset</button></div>
    ${grp("Status","status",Object.keys(STATUS))}${grp("Priority","prio",Object.keys(PRIO))}
    ${grp("Assignee","who",USERS)}${grp("Project","proj",PROJECTS)}
    <div style="border-top:1px solid var(--line);padding:9px 14px;font-size:11px;color:var(--ink-3)">Filters apply instantly</div>`,340);
  p.querySelectorAll("input[data-fk]").forEach(cb=>cb.onchange=()=>{
    const set=state.taskFilters[cb.dataset.fk];
    cb.checked?set.add(cb.value):set.delete(cb.value);
    rerenderTasks($("#taskSearch"));render();
    setTimeout(()=>{/* keep popover */},0);
  });
  p.querySelector("#fClear").onclick=()=>{["status","prio","who","proj"].forEach(k=>state.taskFilters[k].clear());closePopovers();render()};
}

/* ================================================================
   TASK MODAL (CREATE / EDIT)
================================================================ */
function openTaskModal(pre={}){
  const editing=!!pre.id;
  const t=editing?tasks.find(x=>x.id===pre.id):{title:"",desc:"",status:pre.status||"todo",prio:"medium",due:pre.date||"",time:pre.time||"",assignee:"Alex Rivera",project:PROJECTS[0],tags:[]};
  openModal({title:editing?"Edit task":"Create task",icon:editing?"pen":"plus",wide:true,
    body:`<div class="frm-grid">
      <div class="full"><label class="lbl">Title *</label><input class="inp" id="mTitle" value="${esc(t.title)}" placeholder="e.g. Ship release notes for v2.4">
        <div class="fld-err" id="mTitleErr">Title is required.</div></div>
      <div class="full"><label class="lbl">Description</label><textarea class="inp" id="mDesc" placeholder="Add context, links, acceptance criteria…">${esc(t.desc)}</textarea></div>
      <div><label class="lbl">Status</label><select class="inp" id="mStatus">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${t.status===k?"selected":""}>${v.l}</option>`).join("")}</select></div>
      <div><label class="lbl">Priority</label><select class="inp" id="mPrio">${Object.entries(PRIO).map(([k,v])=>`<option value="${k}" ${t.prio===k?"selected":""}>${v.l}</option>`).join("")}</select></div>
      <div><label class="lbl">Due date</label><input type="date" class="inp" id="mDue" value="${t.due||""}"></div>
      <div><label class="lbl">Time</label><input type="time" class="inp" id="mTime" value="${t.time||""}"></div>
      <div><label class="lbl">Assignee</label><select class="inp" id="mWho">${USERS.map(u=>`<option ${t.assignee===u?"selected":""}>${u}</option>`).join("")}</select></div>
      <div><label class="lbl">Project</label><select class="inp" id="mProj">${PROJECTS.map(p=>`<option ${t.project===p?"selected":""}>${p}</option>`).join("")}</select></div>
      <div class="full"><label class="lbl">Tags <span style="text-transform:none;letter-spacing:0">(comma separated)</span></label><input class="inp" id="mTags" value="${esc(t.tags.join(", "))}" placeholder="design, q3, spike"></div>
    </div>`,
    foot:`<button class="btn" data-close>Cancel</button><button class="btn primary" id="mSave">${editing?"Save changes":"Create task"}</button>`,
    onMount:o=>{
      o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
      o.querySelector("#mTitle").focus();
      o.querySelector("#mSave").onclick=()=>{
        const title=o.querySelector("#mTitle").value.trim();
        if(!title){o.querySelector("#mTitle").classList.add("err");o.querySelector("#mTitleErr").classList.add("show");return}
        const data={title,desc:o.querySelector("#mDesc").value,status:o.querySelector("#mStatus").value,prio:o.querySelector("#mPrio").value,
          due:o.querySelector("#mDue").value,time:o.querySelector("#mTime").value,assignee:o.querySelector("#mWho").value,
          project:o.querySelector("#mProj").value,tags:o.querySelector("#mTags").value.split(",").map(x=>x.trim()).filter(Boolean)};
        if(editing){Object.assign(t,data);t.activity.unshift({who:"Alex Rivera",txt:"updated the task details",ts:Date.now()});toast(`${t.id} updated`,"success")}
        else{const nt={...data,id:"TSK-"+(++TID),attachments:[],comments:[],done:data.status==="done",doneAt:data.status==="done"?Date.now():null,doneBy:"Alex Rivera",archived:false,createdAt:Date.now(),
          activity:[{who:"Alex Rivera",txt:"created this task",ts:Date.now()}]};
          tasks.unshift(nt);toast(`${nt.id} created`,"success")}
        closeModal();render();
        if(state.drawerTask)renderDrawer(state.drawerTask);
      };
    }});
}

/* ================================================================
   TASK DRAWER
================================================================ */
function renderDrawer(id){
  const t=tasks.find(x=>x.id===id);if(!t){closeDrawer();return}
  state.drawerTask=id;renderCrumbs();
  const d=$("#drawer");
  const atts=t.attachments.map(fid=>files.find(f=>f.id===fid)).filter(Boolean);
  const acts=[...t.activity].sort((a,b)=>b.ts-a.ts).slice(0,6);
  d.innerHTML=`
  <div class="dr-h">
    <span class="chip mono plain">${t.id}</span>${statusChip(t.status)}
    ${t.due&&t.due<TODAY&&t.status!=="done"?`<span class="chip" style="color:var(--red);background:var(--red-soft)">${ic("alert",10,2.2)} Overdue</span>`:""}
    <button class="icon-btn" style="margin-left:auto" data-action="closeDrawer" data-tip="Close · Esc" aria-label="Close">${ic("x",15,2)}</button>
  </div>
  <div class="dr-body">
    <input class="dr-title" id="dTitle" value="${esc(t.title)}" aria-label="Task title">
    <div class="dr-grid">
      <div><label class="lbl">Status</label><select class="inp" id="dStatus">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${t.status===k?"selected":""}>${v.l}</option>`).join("")}</select></div>
      <div><label class="lbl">Priority</label><select class="inp" id="dPrio">${Object.entries(PRIO).map(([k,v])=>`<option value="${k}" ${t.prio===k?"selected":""}>${v.l}</option>`).join("")}</select></div>
      <div><label class="lbl">Due date</label><input type="date" class="inp" id="dDue" value="${t.due||""}"></div>
      <div><label class="lbl">Time</label><input type="time" class="inp" id="dTime" value="${t.time||""}"></div>
      <div><label class="lbl">Assignee</label><select class="inp" id="dWho">${USERS.map(u=>`<option ${t.assignee===u?"selected":""}>${u}</option>`).join("")}</select></div>
      <div><label class="lbl">Project</label><select class="inp" id="dProj">${PROJECTS.map(p=>`<option ${t.project===p?"selected":""}>${p}</option>`).join("")}</select></div>
      <div class="full"><label class="lbl">Tags</label>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">${t.tags.map(x=>`<span class="tag">#${esc(x)}</span>`).join("")||'<span style="font-size:11.5px;color:var(--ink-4)">No tags</span>'}</div>
        <input class="inp" id="dTags" value="${esc(t.tags.join(", "))}" placeholder="add, tags, here"></div>
      <div class="full"><label class="lbl">Description</label><textarea class="inp" id="dDesc" placeholder="Add a description…">${esc(t.desc)}</textarea></div>
    </div>

    <div class="dr-sec">
      <div class="dr-sec-t">${ic("clip",13)} Attachments <span class="cnt">${atts.length}</span>
        <button class="btn xs ghost" style="margin-left:auto" data-action="attachPick" data-id="${t.id}">${ic("plus",11,2.4)} Attach</button></div>
      ${atts.map(f=>{const ext=f.name.split(".").pop();return `
        <div class="attach-row" data-action="previewFile" data-id="${f.id}">${fileTile(ext,"")}${""}
          <span style="font-weight:500;font-size:12.3px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.name)}</span>
          <span class="mono" style="font-size:10px;color:var(--ink-3)">${fmtSize(f.size)}</span></div>`}).join("")||`<div style="font-size:11.5px;color:var(--ink-4)">Nothing attached yet.</div>`}
    </div>

    <div class="dr-sec">
      <div class="dr-sec-t">${ic("clock",13)} Activity</div>
      ${acts.map((a,i)=>`<div class="act-row ${i===0?"hl":""}"><span class="act-dot"></span>
        <div><div class="act-txt"><b>${esc(a.who)}</b> ${a.txt}</div><div class="act-t">${relTime(a.ts)}</div></div></div>`).join("")}
    </div>

    <div class="dr-sec">
      <div class="dr-sec-t">${ic("msg",13)} Comments <span class="cnt">${t.comments.length}</span></div>
      ${t.comments.map(c=>`<div class="cmt">${avatar(c.who,"av-sm")}
        <div class="cmt-b"><div class="ch"><span class="cn">${esc(c.who)}</span><span class="ct2">${relTime(c.ts)}</span></div><p>${esc(c.txt)}</p></div></div>`).join("")||`<div style="font-size:11.5px;color:var(--ink-4);margin-bottom:10px">No comments yet.</div>`}
      <div style="display:flex;gap:8px">${avatar("Alex Rivera","av-sm")}
        <input class="inp" id="dCmt" placeholder="Write a comment… (Enter to send)">
        <button class="icon-btn" style="border:1px solid var(--line-2)" data-action="sendComment" data-id="${t.id}" aria-label="Send">${ic("send",14)}</button></div>
    </div>
  </div>
  <div class="dr-f">
    <button class="icon-btn ${t.status==="done"?"on":""}" data-action="drawerComplete" data-id="${t.id}" data-tip="${t.status==="done"?"Reopen":"Complete"}" style="border:1px solid var(--line-2);background:#fff">${ic("check",15,2.2)}</button>
    <button class="icon-btn" data-action="drawerArchive" data-id="${t.id}" data-tip="Archive" style="border:1px solid var(--line-2);background:#fff">${ic("archive",14,1.9)}</button>
    <button class="icon-btn" data-action="askDeleteTask" data-id="${t.id}" data-tip="Delete" style="border:1px solid var(--line-2);background:#fff" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color=''">${ic("trash",14,1.8)}</button>
    <button class="icon-btn" data-action="editTask" data-id="${t.id}" data-tip="Edit in dialog" style="border:1px solid var(--line-2);background:#fff">${ic("pen",13,1.9)}</button>
    <span style="flex:1"></span>
    <button class="btn primary" data-action="saveDrawer" data-id="${t.id}">Save changes</button>
  </div>`;
  d.classList.add("open");
  const cmt=$("#dCmt");
  cmt.addEventListener("keydown",e=>{if(e.key==="Enter"&&cmt.value.trim()){addComment(t.id,cmt.value)}});
}
function addComment(id,text){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  t.comments.push({who:"Alex Rivera",ts:Date.now(),txt:text.trim()});
  t.activity.unshift({who:"Alex Rivera",txt:"commented on this task",ts:Date.now()});
  renderDrawer(id);toast("Comment added","success");
}
function saveDrawer(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  const title=$("#dTitle").value.trim();
  if(!title){$("#dTitle").classList.add("err");toast("Title can't be empty","danger");return}
  Object.assign(t,{title,status:$("#dStatus").value,prio:$("#dPrio").value,due:$("#dDue").value,time:$("#dTime").value,
    assignee:$("#dWho").value,project:$("#dProj").value,desc:$("#dDesc").value,
    tags:$("#dTags").value.split(",").map(x=>x.trim()).filter(Boolean)});
  t.activity.unshift({who:"Alex Rivera",txt:"updated the task details",ts:Date.now()});
  toast(`${t.id} saved`,"success");render();renderDrawer(id);
}
function closeDrawer(){$("#drawer").classList.remove("open");state.drawerTask=null;renderCrumbs()}
