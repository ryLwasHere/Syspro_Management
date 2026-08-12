/**
 * events.js
 * Global event delegation: click actions, form changes, keyboard shortcuts, uploads.
 */
"use strict";

/* ================================================================
   GLOBAL ACTIONS
================================================================ */
document.addEventListener("mousedown",e=>{
  if(!e.target.closest(".pop")&&!e.target.closest("[data-action='toggleFilters']")&&!e.target.closest("[data-action='toggleNotif']")&&!e.target.closest("[data-action='userMenu']")){
    if(!e.target.closest(".pop"))closePopovers();
  }
});
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-action]");
  if(!el)return;
  const a=el.dataset.action,id=el.dataset.id;
  if(a!=="toggleNotif"&&a!=="toggleFilters"&&a!=="userMenu"&&!e.target.closest(".pop"))closePopovers();
  switch(a){
    case"nav":go(el.dataset.page);break;
    case"openPalette":openPalette();break;
    case"toggleNotif":{const p=document.querySelector(".pop");const has=p&&p.dataset.np;if(has){closePopovers()}else{const pp=notifPanel($("#bellBtn"));pp.dataset.np=1}break}
    case"userMenu":{const p=document.querySelector(".pop");if(p&&p.dataset.um){closePopovers();break}
      const pp=popover(el,`<div style="padding:6px">
        <div style="padding:9px 11px;border-bottom:1px solid var(--line);margin-bottom:5px"><div style="font-weight:700;font-size:13px">Alex Rivera</div><div class="mono" style="font-size:10.5px;color:var(--ink-3)">alex@atlascrew.io</div></div>
        ${[["user","Profile","profile"],["sliders","Settings","settings"],["ext","Invite teammate","invite"],["x","Sign out","signout"]].map(([i,l,k])=>`<button class="nav-item" data-umk="${k}" style="margin:0">${ic(i,14)} ${l}</button>`).join("")}</div>`,220);
      pp.dataset.um=1;
      pp.querySelectorAll("[data-umk]").forEach(b=>b.onclick=()=>{closePopovers();const k=b.dataset.umk;
        if(k==="settings")go("settings");
        else if(k==="profile")go("settings");
        else toast(k==="invite"?"Invite link copied to clipboard":"Signed out (demo)","info");});
      break}
    case"newTask":openTaskModal({status:el.dataset.status,date:el.dataset.date,time:el.dataset.time});break;
    case"openTask":e.stopPropagation();renderDrawer(id);break;
    case"closeDrawer":closeDrawer();break;
    case"saveDrawer":saveDrawer(id);break;
    case"editTask":openTaskModal({id});break;
    case"toggleDone":{e.stopPropagation();const t=tasks.find(x=>x.id===id);
      if(t.status==="done"){t.status="todo";t.doneAt=null;t.activity.unshift({who:"Alex Rivera",txt:"reopened this task",ts:Date.now()});toast(`${t.id} reopened`,"info")}
      else{t.status="done";t.doneAt=Date.now();t.doneBy="Alex Rivera";t.activity.unshift({who:"Alex Rivera",txt:"completed this task",ts:Date.now()});toast(`${t.id} completed`,"success")}
      render();if(state.drawerTask===id)renderDrawer(id);break}
    case"drawerComplete":{const t=tasks.find(x=>x.id===id);
      if(t.status==="done"){t.status="todo";t.doneAt=null;toast("Task reopened","info")}
      else{t.status="done";t.doneAt=Date.now();t.doneBy="Alex Rivera";t.activity.unshift({who:"Alex Rivera",txt:"completed this task",ts:Date.now()});toast(`${t.id} completed 🎉`,"success")}
      render();renderDrawer(id);break}
    case"drawerArchive":{const t=tasks.find(x=>x.id===id);t.archived=true;closeDrawer();render();
      toast(`${t.id} moved to archive`,"success",{label:"Undo",fn:()=>{t.archived=false;render()}});break}
    case"askDeleteTask":confirmDlg({title:"Delete task",msg:`Permanently delete <b>${esc(tasks.find(x=>x.id===id)?.title)}</b>? This can't be undone.`,onOk:()=>{const i=tasks.findIndex(x=>x.id===id);tasks.splice(i,1);closeDrawer();render();toast("Task deleted","danger")}});break;
    case"askDeleteArchived":confirmDlg({title:"Delete forever",msg:`Permanently delete <b>${esc(tasks.find(x=>x.id===id)?.title)}</b> from the archive?`,ok:"Delete forever",onOk:()=>{const i=tasks.findIndex(x=>x.id===id);tasks.splice(i,1);render();toast("Removed from archive","danger")}});break;
    case"restoreTask":{const t=tasks.find(x=>x.id===id);t.archived=false;render();toast(`${t.id} restored to Tasks`,"success");break}
    case"sendComment":{const v=$("#dCmt").value;if(v.trim())addComment(id,v);break}
    case"attachPick":{const t=tasks.find(x=>x.id===id);
      openModal({title:"Attach from library",icon:"clip",body:`<div style="max-height:320px;overflow-y:auto">
        ${files.map(f=>{const ext=f.name.split(".").pop();const on=t.attachments.includes(f.id);return `
          <label class="attach-row" style="cursor:pointer"><input type="checkbox" data-att="${f.id}" ${on?"checked":""} style="accent-color:var(--acc)">
          ${fileTile(ext,"")}<span style="font-weight:500;font-size:12.3px;flex:1">${esc(f.name)}</span><span class="mono" style="font-size:10px;color:var(--ink-3)">${fmtSize(f.size)}</span></label>`}).join("")}</div>`,
        foot:`<button class="btn" data-close>Cancel</button><button class="btn primary" id="attSave">Attach</button>`,
        onMount:o=>{o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
          o.querySelector("#attSave").onclick=()=>{t.attachments=[...o.querySelectorAll("[data-att]:checked")].map(c=>c.dataset.att);
            t.activity.unshift({who:"Alex Rivera",txt:"updated attachments",ts:Date.now()});closeModal();renderDrawer(id);toast("Attachments updated","success")}}});break}
    case"taskView":state.taskView=el.dataset.view;render();break;
    case"toggleFilters":filterPopover(el);break;
    case"clearTaskFilters":["status","prio","who","proj"].forEach(k=>state.taskFilters[k].clear());state.q="";render();break;
    case"calNav":{const s=el.dataset.scope;const an=s==="home"?state.homeAnchor:state.calAnchor;const v=s==="home"?state.homeCalView:state.calView;const d=+el.dataset.dir;
      if(v==="month")an.setMonth(an.getMonth()+d);else if(v==="week")an.setDate(an.getDate()+7*d);else an.setDate(an.getDate()+d);
      fillCalendar(s);break}
    case"calToday":{const s=el.dataset.scope;if(s==="home")state.homeAnchor=new Date();else state.calAnchor=new Date();fillCalendar(s);break}
    case"calView":{const s=el.dataset.scope;if(s==="home"){state.homeCalView=el.dataset.view;$$("#hcalSeg button").forEach(b=>b.classList.toggle("on",b.dataset.view===el.dataset.view))}
      else{state.calView=el.dataset.view;$$("#content .seg button[data-action='calView']").forEach(b=>b.classList.toggle("on",b.dataset.view===el.dataset.view))}
      fillCalendar(s);break}
    case"calCell":openTaskModal({date:el.dataset.date});break;
    case"goCalDay":state.calAnchor=parseISO(el.dataset.date);state.calView="day";go("calendar");break;
    case"filesView":state.filesView=el.dataset.view;render();break;
    case"openFolder":state.folder=el.dataset.id;render();break;
    case"filesHome":state.folder=null;render();break;
    case"upload":$("#fileInput").click();break;
    case"newFolder":openModal({title:"New folder",icon:"folder",body:`<label class="lbl">Folder name</label><input class="inp" id="nfName" placeholder="e.g. Contracts"><div class="fld-err" id="nfErr">Name is required.</div>`,
      foot:`<button class="btn" data-close>Cancel</button><button class="btn primary" id="nfOk">Create</button>`,
      onMount:o=>{o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);o.querySelector("#nfName").focus();
        o.querySelector("#nfOk").onclick=()=>{const n=o.querySelector("#nfName").value.trim();if(!n){o.querySelector("#nfErr").classList.add("show");return}
          folders.push({id:"d"+Date.now(),name:n});closeModal();render();toast("Folder created","success")}}});break;
    case"previewFile":previewFile(id);break;
    case"downloadFile":{e.stopPropagation();const f=files.find(x=>x.id===id);toast(`Downloading ${esc(f.name)}…`,"info");break}
    case"renameFile":{e&&e.stopPropagation();const f=files.find(x=>x.id===id);
      openModal({title:"Rename file",icon:"pen",body:`<label class="lbl">New name</label><input class="inp" id="rnIn" value="${esc(f.name)}"><div class="fld-err" id="rnErr">Name can't be empty.</div>`,
        foot:`<button class="btn" data-close>Cancel</button><button class="btn primary" id="rnOk">Rename</button>`,
        onMount:o=>{o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
          const inp=o.querySelector("#rnIn");inp.focus();inp.setSelectionRange(0,inp.value.lastIndexOf("."));
          o.querySelector("#rnOk").onclick=()=>{const n=inp.value.trim();if(!n){o.querySelector("#rnErr").classList.add("show");return}
            f.name=n;closeModal();render();toast("File renamed","success")}}});break}
    case"askDeleteFile":{e.stopPropagation();const f=files.find(x=>x.id===id);
      confirmDlg({title:"Delete file",msg:`Delete <b>${esc(f.name)}</b> from the library? Linked tasks will keep working but lose the attachment.`,onOk:()=>{
        const i=files.findIndex(x=>x.id===id);files.splice(i,1);closeModal();render();toast("File deleted","danger")}});break}
    case"addShortcut":if(shortcuts.length>=7){const s=shortcuts[6];shortcutModal(s);toast("Maximum shortcuts reached. Editing last shortcut.","info")}else{shortcutModal()};break;
    case"editShortcut":shortcutModal(shortcuts.find(s=>s.id===id));break;
    case"askDeleteShortcut":confirmDlg({title:"Remove shortcut",msg:`Remove <b>${esc(shortcuts.find(s=>s.id===id)?.name)}</b> from your shortcuts?`,ok:"Remove",onOk:()=>{
      const i=shortcuts.findIndex(s=>s.id===id);shortcuts.splice(i,1);render();toast("Shortcut removed","info")}});break;
    case"markAllRead":notifs.forEach(n=>n.unread=false);renderBell();toast("All notifications marked as read","success");break;
    case"fakeSave":toast("Profile saved","success");break;
    case"density":document.body.classList.toggle("comfy",el.dataset.d==="comfy");render();toast("Density updated","info");break;
    case"toggleTheme":{document.body.classList.toggle("dark");const isDark=document.body.classList.contains("dark");localStorage.setItem("syspro-theme",isDark?"dark":"light");updateThemeIcons();toast(isDark?"Dark mode enabled":"Light mode enabled","info");break}
    case"resetData":confirmDlg({title:"Reset workspace",msg:"This reloads the app and restores all demo data.",ok:"Reset",onOk:()=>location.reload()});break;
  }
});
document.addEventListener("change",e=>{
  if(e.target.dataset.chan){toast(`Channel updated · ${e.target.dataset.chan.split("/")[1]} ${e.target.checked?"on":"off"}`,"success")}
});
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#palOvl")?closePalette():openPalette()}
  else if(e.key==="Escape"){
    if($("#palOvl"))closePalette();
    else if($("#modal-root").innerHTML)closeModal();
    else if(document.querySelector(".pop"))closePopovers();
    else if($("#drawer").classList.contains("open"))closeDrawer();
  }
  else if(!e.metaKey&&!e.ctrlKey&&!e.altKey&&e.key.toLowerCase()==="n"&&!/input|textarea|select/i.test(document.activeElement.tagName)&&!$("#palOvl")&&!$("#modal-root").innerHTML){
    e.preventDefault();openTaskModal();
  }
});
$("#fileInput").addEventListener("change",e=>{
  const fs=[...e.target.files];if(!fs.length)return;
  toast(`Uploading ${fs.length} file${fs.length>1?"s":""}…`,"info");
  setTimeout(()=>{
    fs.forEach(f=>files.unshift({id:"f"+Date.now()+Math.random().toString(16).slice(2,5),name:f.name,folder:state.folder||"d2",size:f.size||Math.round(Math.random()*3e6+4e4),mod:Date.now(),owner:"Alex Rivera",task:null,isNew:true}));
    notifs.unshift({id:"n"+Date.now(),type:"upload",html:`<b>You</b> uploaded <b>${esc(fs[0].name)}</b>${fs.length>1?` and ${fs.length-1} more`:""}`,ts:Date.now(),unread:true});
    renderBell();if(state.page==="files")render();
    toast(`${fs.length} file${fs.length>1?"s":""} uploaded`,"success");
  },900);
  e.target.value="";
});

