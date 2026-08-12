/**
 * view-shortcuts.js
 * Shortcuts page: app tile grid, add/edit modal, drag reordering.
 */
"use strict";

/* ================================================================
   SHORTCUTS
================================================================ */
function viewShortcuts(){
  return `
  <div class="page-head">
    <div><div class="page-title">Shortcuts</div><div class="page-sub">Your external tools, one click away. Drag cards to reorder.</div></div>
    <div class="page-actions"><button class="btn primary" data-action="addShortcut">${ic("plus",13,2.4)} Add shortcut</button></div>
  </div>
  <div class="sh-grid" id="shGrid">
    ${shortcuts.map(s=>`
      <div class="sh-card" draggable="true" data-sid="${s.id}">
        <div class="sh-tools">
          <button data-action="editShortcut" data-id="${s.id}" data-tip="Edit" aria-label="Edit">${ic("pen",12.5)}</button>
          <button class="rm" data-action="askDeleteShortcut" data-id="${s.id}" data-tip="Delete" aria-label="Delete">${ic("trash",12.5)}</button>
        </div>
        <div class="sh-top">
          <div class="apptile" style="background:${s.bg};color:${s.fg}">${esc(s.g)}</div>
          <div style="min-width:0"><div class="sh-name">${esc(s.name)}</div>
          <div class="sh-url">${esc(s.url.replace("https://",""))}</div></div>
        </div>
        <div class="sh-desc">${esc(s.desc||"No description")}</div>
        <div class="sh-foot">
          <a class="sh-open" href="${esc(s.url)}" target="_blank" rel="noopener">Open ${ic("ext",12,2)}</a>
          <span style="margin-left:auto;color:var(--ink-4);cursor:grab" data-tip="Drag to reorder">${ic("grip",14)}</span>
        </div>
      </div>`).join("")}
    <button class="sh-addcard" data-action="addShortcut">${ic("plus",18)} Add shortcut</button>
  </div>`;
}
function shortcutModal(edit){
  const s=edit||{name:"",url:"",desc:"",g:"",bg:"#E3F2EF",fg:"#096A60"};
  openModal({title:edit?"Edit shortcut":"Add shortcut",icon:"grid",
    body:`<div class="frm-grid">
      <div class="full"><label class="lbl">Name *</label><input class="inp" id="sName" value="${esc(s.name)}" placeholder="e.g. Figma"><div class="fld-err" id="sNameErr">Name is required.</div></div>
      <div class="full"><label class="lbl">URL *</label><input class="inp mono" id="sUrl" style="font-size:12px" value="${esc(s.url)}" placeholder="https://…"><div class="fld-err" id="sUrlErr">Enter a valid URL.</div></div>
      <div class="full"><label class="lbl">Description</label><input class="inp" id="sDesc" value="${esc(s.desc)}" placeholder="What is this tool for?"></div>
      <div><label class="lbl">Icon glyph</label><input class="inp mono" id="sGlyph" maxlength="3" value="${esc(s.g)}" placeholder="e.g. F"></div>
      <div><label class="lbl">Tile color</label><select class="inp" id="sColor">
        ${[["#E3F2EF","#096A60","Teal"],["#E9F0FC","#1F5ABF","Blue"],["#EDEAFB","#5A46B8","Violet"],["#E4F4EA","#1F7A46","Green"],["#FBF1DE","#A8720E","Amber"],["#FBEDE2","#B25A1D","Orange"],["#FCEBEB","#B33A3A","Red"],["#F1F2F5","#181D27","Neutral"]].map(([b,f,l])=>`<option value="${b}|${f}" ${s.bg===b?"selected":""}>${l}</option>`).join("")}</select></div>
    </div>`,
    foot:`<button class="btn" data-close>Cancel</button><button class="btn primary" id="sSave">${edit?"Save":"Add shortcut"}</button>`,
    onMount:o=>{
      o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
      o.querySelector("#sSave").onclick=()=>{
        const name=o.querySelector("#sName").value.trim(),url=o.querySelector("#sUrl").value.trim();
        let ok=true;
        if(!name){o.querySelector("#sName").classList.add("err");o.querySelector("#sNameErr").classList.add("show");ok=false}
        if(!/^https?:\/\/.+\..+/.test(url)){o.querySelector("#sUrl").classList.add("err");o.querySelector("#sUrlErr").classList.add("show");ok=false}
        if(!ok)return;
        const[b,f]=o.querySelector("#sColor").value.split("|");
        const data={name,url,desc:o.querySelector("#sDesc").value.trim(),g:o.querySelector("#sGlyph").value.trim()||name[0].toUpperCase(),bg:b,fg:f};
        if(edit){Object.assign(edit,data);toast("Shortcut updated","success")}
        else{shortcuts.push({id:"s"+(++SID),...data});toast("Shortcut added","success")}
        closeModal();render();
      };
    }});
}
function bindShortcutDnD(){
  let dragEl=null;
  $$(".sh-card").forEach(c=>{
    c.addEventListener("dragstart",e=>{dragEl=c;c.classList.add("dragging")});
    c.addEventListener("dragend",()=>{c.classList.remove("dragging");dragEl=null});
    c.addEventListener("dragover",e=>{e.preventDefault()});
    c.addEventListener("drop",e=>{
      e.preventDefault();if(!dragEl||dragEl===c)return;
      const from=shortcuts.findIndex(s=>s.id===dragEl.dataset.sid);
      const to=shortcuts.findIndex(s=>s.id===c.dataset.sid);
      const[m]=shortcuts.splice(from,1);shortcuts.splice(to,0,m);
      render();toast("Shortcuts reordered","info");
    });
  });
}
