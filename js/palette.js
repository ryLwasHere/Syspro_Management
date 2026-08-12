/**
 * palette.js
 * Command palette (Cmd/Ctrl+K): search across pages, tasks, files, shortcuts.
 */
"use strict";

/* ================================================================
   PALETTE
================================================================ */
let palItems=[];
function openPalette(){
  closePopovers();
  const root=document.createElement("div");
  root.className="pal-ovl";root.id="palOvl";
  root.innerHTML=`<div class="palette" role="dialog">
    <div class="pal-inp">${ic("search",16)}<input id="palIn" placeholder="Search tasks, files, shortcuts, pages…" autocomplete="off"><kbd>esc</kbd></div>
    <div class="pal-list" id="palList"></div>
    <div class="pal-foot"><span><b class="kbd">↑↓</b> navigate</span><span><b class="kbd">↵</b> open</span><span><b class="kbd">⌘K</b> toggle</span></div></div>`;
  document.body.appendChild(root);
  root.addEventListener("mousedown",e=>{if(e.target===root)closePalette()});
  const inp=$("#palIn");inp.focus();
  inp.addEventListener("input",()=>fillPal(inp.value));
  inp.addEventListener("keydown",e=>{
    const items=$$("#palList .pal-item");let idx=items.findIndex(i=>i.classList.contains("sel"));
    if(e.key==="ArrowDown"){e.preventDefault();idx=(idx+1)%items.length}
    else if(e.key==="ArrowUp"){e.preventDefault();idx=(idx-1+items.length)%items.length}
    else if(e.key==="Enter"){e.preventDefault();items[idx>=0?idx:0]?.click();return}
    else return;
    items.forEach(i=>i.classList.remove("sel"));items[idx]?.classList.add("sel");items[idx]?.scrollIntoView({block:"nearest"});
  });
  fillPal("");
}
function fillPal(q){
  q=q.toLowerCase();palItems=[];
  const push=(grp,item)=>{(palItems[grp]=palItems[grp]||[]).push(item)};
  NAV.forEach(([p,l,i])=>{if(!q||l.includes(q))push("Pages",{ic:i,label:l,sub:"page",fn:()=>go(p)})});
  if(q.length>=1){
    active().filter(t=>(t.title+t.id).toLowerCase().includes(q)).slice(0,5).forEach(t=>push("Tasks",{ic:"tasks",label:t.title,sub:t.id+" · "+STATUS[t.status].l,fn:()=>{go("tasks");setTimeout(()=>renderDrawer(t.id),30)}}));
    files.filter(f=>f.name.toLowerCase().includes(q)).slice(0,4).forEach(f=>push("Files",{ic:"folder",label:f.name,sub:fmtSize(f.size),fn:()=>{go("files");setTimeout(()=>previewFile(f.id),30)}}));
    shortcuts.filter(s=>s.name.toLowerCase().includes(q)).slice(0,3).forEach(s=>push("Shortcuts",{ic:"ext",label:s.name,sub:s.url.replace("https://",""),fn:()=>window.open(s.url,"_blank")}));
  }else{
    push("Actions",{ic:"plus",label:"Create new task",sub:"N",fn:()=>openTaskModal()});
    push("Actions",{ic:"cal",label:"Jump to today's calendar",sub:"",fn:()=>{state.calAnchor=new Date();go("calendar")}});
    push("Actions",{ic:"up",label:"Upload a file",sub:"",fn:()=>{go("files");setTimeout(()=>$("#fileInput").click(),30)}});
  }
  const list=$("#palList");
  const html=Object.entries(palItems).map(([grp,items])=>`<div class="pal-grp">${grp}</div>`+
    items.map((it,i)=>`<div class="pal-item" data-g="${grp}" data-i="${i}"><span class="pi-ic">${ic(it.ic,13)}</span><span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.label)}</span><span class="pi-sub">${esc(it.sub||"")}</span></div>`).join("")).join("");
  list.innerHTML=html||`<div class="empty" style="padding:26px">${ic("search",18)}<b>No results for “${esc(q)}”</b></div>`;
  list.querySelector(".pal-item")?.classList.add("sel");
  list.querySelectorAll(".pal-item").forEach(el=>el.onclick=()=>{palItems[el.dataset.g][el.dataset.i].fn();closePalette()});
}
const closePalette=()=>$("#palOvl")?.remove();
