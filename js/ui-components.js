/**
 * ui-components.js
 * Generic UI primitives: toast notifications, modal dialog, popovers.
 */
"use strict";

/* ---------- TOAST ---------- */
function toast(msg,type="info",action){
  const el=document.createElement("div");
  el.className="toast "+type;
  const tic=type==="success"?"check":type==="danger"?"alert":"bellS";
  el.innerHTML=`<span class="tic">${ic(tic,15,2.2)}</span><span>${msg}</span>${action?`<button class="tact">${esc(action.label)}</button>`:""}`;
  if(action)el.querySelector(".tact").onclick=()=>{action.fn();kill();};
  $("#toasts").appendChild(el);
  const kill=()=>{el.classList.add("out");setTimeout(()=>el.remove(),260)};
  setTimeout(kill,action?5200:3400);
}

/* ---------- MODAL ---------- */
function openModal({title,body,foot,wide,onMount,icon}){
  closePopovers();
  const root=$("#modal-root");
  root.innerHTML=`<div class="ovl" id="ovl"><div class="modal ${wide?"wide":""}" role="dialog" aria-modal="true">
    <div class="mo-h"><span class="t">${icon?ic(icon,16)+"&nbsp; ":""}${title}</span>
      <button class="icon-btn" style="margin-left:auto" data-close aria-label="Close">${ic("x",15,2)}</button></div>
    <div class="mo-b">${body}</div>${foot?`<div class="mo-f">${foot}</div>`:""}</div></div>`;
  const ovl=$("#ovl");
  ovl.addEventListener("mousedown",e=>{if(e.target===ovl)closeModal()});
  ovl.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);
  onMount&&onMount(ovl);
  return ovl;
}
const closeModal=()=>{$("#modal-root").innerHTML=""};
function confirmDlg({title,msg,ok="Delete",onOk}){
  openModal({title:"Confirm",icon:"alert",body:`<p style="font-size:13px;color:var(--ink-2);line-height:1.6">${msg}</p>`,
    foot:`<button class="btn" data-close>Cancel</button><button class="btn danger" id="cOk">${ok}</button>`,
    onMount:o=>{o.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeModal);o.querySelector("#cOk").onclick=()=>{closeModal();onOk()}}});
}

/* ---------- POPOVERS ---------- */
function closePopovers(){$$(".pop").forEach(p=>p.remove())}
function popover(anchor,html,w=300,align="right"){
  closePopovers();
  const r=anchor.getBoundingClientRect();
  const p=document.createElement("div");
  p.className="pop";p.style.width=w+"px";
  p.style.top=(r.bottom+8)+"px";
  p.style[align==="right"?"right":"left"]=(align==="right"?innerWidth-r.right:r.left)+"px";
  p.innerHTML=html;document.body.appendChild(p);
  return p;
}

