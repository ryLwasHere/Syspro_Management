/**
 * view-files.js
 * Files & Library page: grid/table views, folders, file preview.
 */
"use strict";

/* ================================================================
   FILES
================================================================ */
function fmtSize(b){return b>1e6?(b/1e6).toFixed(1)+" MB":Math.max(1,Math.round(b/1e3))+" KB"}
function fmtMod(ts){const d=new Date(ts);const diff=(Date.now()-ts)/864e5;return diff<1?relTime(ts):diff<7?d.toLocaleDateString("en-US",{weekday:"short"})+" "+relTime(ts):fmtD(iso(d))}
function visibleFiles(){
  let list=files.filter(f=>(!state.folder||f.folder===state.folder)&&
    (state.ftype==="all"||extGroup(f.name)===state.ftype)&&
    (!state.fq||f.name.toLowerCase().includes(state.fq.toLowerCase())));
  const s={mod:(a,b)=>b.mod-a.mod,name:(a,b)=>a.name.localeCompare(b.name),size:(a,b)=>b.size-a.size};
  return list.sort(s[state.fsort]);
}
function extGroup(n){const e=n.split(".").pop();return["png","svg","jpg","gif"].includes(e)?"image":["xlsx","csv"].includes(e)?"sheet":["zip"].includes(e)?"archive":["pdf","docx","pptx","md","json"].includes(e)?"doc":"other"}
function viewFiles(){
  const list=visibleFiles();
  const foldName=state.folder?folders.find(f=>f.id===state.folder)?.name:null;
  return `
  <div class="page-head">
    <div><div class="page-title">Files / Library</div><div class="page-sub">${files.length} files · ${folders.length} folders · 4.2 GB used</div></div>
    <div class="page-actions">
      <button class="btn" data-action="newFolder">${ic("folder",13)} New folder</button>
      <button class="btn primary" data-action="upload">${ic("up",13,2)} Upload</button>
    </div>
  </div>
  <div class="toolbar">
    <div style="position:relative;width:230px">
      <input class="inp" id="fileSearch" placeholder="Search files…" value="${esc(state.fq)}" style="padding-left:32px">
      <span style="position:absolute;left:10px;top:8px;color:var(--ink-4)">${ic("search",14)}</span></div>
    <select class="inp" id="ftypeSel" style="width:140px">${[["all","All types"],["doc","Documents"],["sheet","Sheets"],["image","Images"],["archive","Archives"]].map(([v,l])=>`<option value="${v}" ${state.ftype===v?"selected":""}>${l}</option>`).join("")}</select>
    <select class="inp" id="fsortSel" style="width:160px">${[["mod","Sort · Modified"],["name","Sort · Name"],["size","Sort · Size"]].map(([v,l])=>`<option value="${v}" ${state.fsort===v?"selected":""}>${l}</option>`).join("")}</select>
    ${foldName?`<button class="btn sm" data-action="filesHome">${ic("chevL",11,2.4)} All files / <b style="margin-left:3px">${esc(foldName)}</b></button>`:""}
    <span class="spacer"></span>
    <div class="seg">${["grid","list"].map(v=>`<button class="${state.filesView===v?"on":""}" data-action="filesView" data-view="${v}">${ic(v==="grid"?"grid":"list",12.5)} ${v[0].toUpperCase()+v.slice(1)}</button>`).join("")}</div>
  </div>
  ${!state.folder&&!state.fq&&state.ftype==="all"?`
    <div class="lbl" style="margin:2px 2px 8px">Folders</div>
    <div class="fold-row" style="margin-bottom:22px">${folders.map(f=>`
      <div class="fold-card" data-action="openFolder" data-id="${f.id}">
        <div style="width:36px;height:30px;border-radius:7px;background:#FBF1DE;border:1px solid #F2E2C2;display:grid;place-items:center;color:#A8720E;margin-bottom:10px">${ic("folder",16)}</div>
        <div style="font-weight:600;font-size:12.8px">${esc(f.name)}</div>
        <div class="mono" style="font-size:10px;color:var(--ink-3);margin-top:3px">${files.filter(x=>x.folder===f.id).length} files</div>
      </div>`).join("")}
      <div class="fold-card" data-action="newFolder" style="display:grid;place-items:center;border-style:dashed;color:var(--ink-3);font-weight:600;font-size:12px;gap:6px">${ic("plus",16)}<span>New folder</span></div>
    </div>
    <div class="lbl" style="margin:2px 2px 8px">Recent files</div>`:""}
  ${list.length?(state.filesView==="grid"?fileGridHTML(list):fileTableHTML(list)):
    `<div class="panel"><div class="empty">${ic("folder",20)}<b>No files here</b><p>Upload something or adjust your filters.</p><button class="btn sm primary" data-action="upload">${ic("up",12,2)} Upload</button></div></div>`}`;
}
function fileGridHTML(list){
  return `<div class="file-grid">${list.map(f=>{const ext=f.name.split(".").pop();const tk=f.task?tasks.find(t=>t.id===f.task):null;return `
    <div class="file-card" data-action="previewFile" data-id="${f.id}">
      ${f.isNew?`<span class="chip mono new-tag" style="background:var(--acc-soft);color:var(--acc-700)">NEW</span>`:""}
      <div class="file-acts">
        <button data-action="previewFile" data-id="${f.id}" data-tip="Preview" aria-label="Preview">${ic("eye",12.5)}</button>
        <button data-action="downloadFile" data-id="${f.id}" data-tip="Download" aria-label="Download">${ic("down",12.5)}</button>
        <button data-action="renameFile" data-id="${f.id}" data-tip="Rename" aria-label="Rename">${ic("pen",12)}</button>
        <button data-action="askDeleteFile" data-id="${f.id}" data-tip="Delete" aria-label="Delete">${ic("trash",12)}</button>
      </div>
      <div class="fx" style="background:${(FTYPE[ext]||["","#F1F2F5","#4A5264"])[1]};color:${(FTYPE[ext]||["","","#4A5264"])[2]}">${(FTYPE[ext]||["FILE"])[0]}</div>
      <div class="fname">${esc(f.name)}</div>
      <div class="fmeta">${fmtSize(f.size)} · ${fmtMod(f.mod)}</div>
      ${tk?`<div class="ftask"><span class="chip plain mono">${ic("link",9,2.2)} ${tk.id}</span></div>`:""}
    </div>`}).join("")}</div>`;
}
function fileTableHTML(list){
  return `<table class="tbl files-tbl"><thead><tr><th style="width:34px"></th><th>Name</th><th>Type</th><th>Size</th><th>Modified</th><th>Owner</th><th>Linked task</th><th style="width:120px">Actions</th></tr></thead>
  <tbody>${list.map(f=>{const ext=f.name.split(".").pop();const tk=f.task?tasks.find(t=>t.id===f.task):null;return `
    <tr data-action="previewFile" data-id="${f.id}">
      <td>${fileTile(ext,"width:26px;height:26px;font-size:7.5px;border-radius:6px;")}</td>
      <td><span class="tt">${esc(f.name)}</span>${f.isNew?' <span class="chip mono" style="background:var(--acc-soft);color:var(--acc-700)">NEW</span>':""}</td>
      <td class="cell mono" style="font-size:10.5px;text-transform:uppercase">${ext}</td>
      <td class="cell mono" style="font-size:11px">${fmtSize(f.size)}</td>
      <td class="cell mono" style="font-size:11px">${fmtMod(f.mod)}</td>
      <td><span style="display:inline-flex;align-items:center;gap:7px">${avatar(f.owner,"av-sm")}${esc(f.owner)}</span></td>
      <td>${tk?`<span class="chip plain mono">${tk.id}</span>`:'<span style="color:var(--ink-4)">—</span>'}</td>
      <td><div class="arc-actions">
        <button class="icon-btn" data-action="downloadFile" data-id="${f.id}" data-tip="Download">${ic("down",13)}</button>
        <button class="icon-btn" data-action="renameFile" data-id="${f.id}" data-tip="Rename">${ic("pen",12.5)}</button>
        <button class="icon-btn del" data-action="askDeleteFile" data-id="${f.id}" data-tip="Delete">${ic("trash",12.5)}</button>
      </div></td></tr>`}).join("")}</tbody></table>`;
}
function previewFile(id){
  const f=files.find(x=>x.id===id);if(!f)return;
  const ext=f.name.split(".").pop();const tk=f.task?tasks.find(t=>t.id===f.task):null;
  openModal({title:"File preview",wide:true,body:`
    <div style="border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-bottom:16px">
      <div style="background:var(--panel-3);border-bottom:1px solid var(--line);padding:9px 14px;display:flex;align-items:center;gap:9px">
        ${fileTile(ext,"")}${""}<span style="font-weight:600;font-size:13px">${esc(f.name)}</span>
        <span class="mono" style="font-size:10px;color:var(--ink-3);margin-left:auto">${fmtSize(f.size)}</span></div>
      <div class="dotgrid" style="padding:34px;display:flex;justify-content:center">
        <div style="width:70%;max-width:400px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:22px;box-shadow:var(--sh-2)">
          <div class="sk" style="height:13px;width:62%;margin-bottom:14px;animation:none;background:#E9EBF0"></div>
          ${[100,94,97,60,100,88,42].map(w=>`<div class="sk" style="height:8px;width:${w}%;margin-bottom:9px;animation:none;background:#F0F1F4"></div>`).join("")}
          <div class="sk" style="height:64px;margin-top:16px;animation:none;background:#F5F6F8"></div>
        </div></div></div>
    <div class="dr-grid" style="margin:0">
      <div><label class="lbl">Owner</label><div style="display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:500">${avatar(f.owner,"av-sm")}${esc(f.owner)}</div></div>
      <div><label class="lbl">Modified</label><div style="font-size:12.5px;font-weight:500">${new Date(f.mod).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div></div>
      <div><label class="lbl">Folder</label><div style="font-size:12.5px;font-weight:500">${esc(folders.find(d=>d.id===f.folder)?.name||"—")}</div></div>
      <div><label class="lbl">Linked task</label><div>${tk?`<button class="chip plain mono" data-action="openTask" data-id="${tk.id}">${ic("link",9,2.2)} ${tk.id} · ${esc(tk.title.slice(0,22))}${tk.title.length>22?"…":""}</button>`:'<span style="color:var(--ink-4);font-size:12px">None</span>'}</div></div>
    </div>`,
    foot:`<button class="btn" data-close>Close</button><button class="btn" data-action="renameFile" data-id="${f.id}">${ic("pen",12)} Rename</button><button class="btn primary" data-action="downloadFile" data-id="${f.id}">${ic("down",13)} Download</button>`,
    onMount:o=>o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal)});
}
