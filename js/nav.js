/**
 * nav.js
 * Sidebar navigation, breadcrumbs, page routing (go/render) and shell lifecycle.
 */
"use strict";
/* ---------- NAV / SHELL ---------- */
const NAV=[["home","Home","home"],["tasks","Tasks","tasks"],["calendar","Calendar","cal"],["files","Files","folder"],["shortcuts","Shortcuts","grid"],["archive","Archive","archive"]];
const NAV2=[["notifications","Notifications","bellS"],["settings","Settings","sliders"]];
const TITLES={home:"Home",tasks:"Tasks",calendar:"Calendar",files:"Files & Library",shortcuts:"Shortcuts",archive:"Archive",settings:"Settings"};
function renderNav(){
  $("#nav-main").innerHTML=NAV.map(([p,l,i])=>{
    let cnt="";
    if(p==="tasks")cnt=`<span class="nav-count">${active().length}</span>`;
    if(p==="archive")cnt=`<span class="nav-count">${archived().length}</span>`;
    return `<button class="nav-item ${state.page===p?"active":""}" data-action="nav" data-page="${p}">${ic(i,16,1.8)}${l}${cnt}</button>`}).join("");
  $("#nav-sec").innerHTML=NAV2.map(([p,l,i])=>{
    const dot=p==="notifications"&&unreadCount()?`<span class="nav-dot"></span>`:"";
    return `<button class="nav-item ${state.page===p?"active":""}" data-action="${p==="notifications"?"toggleNotif":"nav"}" ${p==="notifications"?"":`data-page="${p}"}`}>${ic(i,16,1.8)}${l}${dot}</button>`}).join("");
}
function renderCrumbs(){
  let cur=TITLES[state.page]||"Home", extra="";
  if(state.drawerTask&&["tasks","calendar","home","archive"].includes(state.page)){const t=tasks.find(x=>x.id===state.drawerTask);if(t)extra=`<span class="crumb-sep">${ic("chevR",11,2.2)}</span><span class="crumb-cur" style="font-family:var(--mono);font-size:11.5px;font-weight:500;color:var(--ink-2)">${t.id}</span>`}
  $("#crumbs").innerHTML=`<span class="crumb-root">syspro</span><span class="crumb-sep">${ic("chevR",11,2.2)}</span><span class="crumb-cur">${cur}</span>${extra}`;
}
function go(page){state.page=page;state.sel=null;closeDrawer();closePopovers();render()}
function render(){
  renderNav();renderCrumbs();
  const c=$("#content");c.style.animation="none";void c.offsetWidth;c.style.animation="";
  const V={home:viewHome,tasks:viewTasks,calendar:viewCalendar,files:viewFiles,shortcuts:viewShortcuts,archive:viewArchive,settings:viewSettings};
  c.innerHTML=(V[state.page]||viewHome)();
  afterRender();
}
function afterRender(){
  const bind=(id,ev,fn)=>{const e=document.getElementById(id);if(e)e.addEventListener(ev,fn)};
  if(state.page==="tasks"){
    bind("taskSearch","input",e=>{state.q=e.target.value;rerenderTasks(e.target)});
    bind("taskSortSel","change",e=>{state.taskSort=e.target.value;render()});
    bindFilters();bindBoardDnD();
  }
  if(state.page==="calendar"){bindCalTools("page")}
  if(state.page==="home"){bindCalTools("home")}
  if(state.page==="files"){
    bind("fileSearch","input",e=>{state.fq=e.target.value;render()});
    bind("ftypeSel","change",e=>{state.ftype=e.target.value;render()});
    bind("fsortSel","change",e=>{state.fsort=e.target.value;render()});
  }
  if(state.page==="archive"){
    bind("arcSearch","input",e=>{state.arc.q=e.target.value;render()});
    ["arcProj","arcWho","arcRange"].forEach(id=>bind(id,"change",e=>{state.arc[{arcProj:"proj",arcWho:"who",arcRange:"range"}[id]]=e.target.value;render()}));
  }
}
