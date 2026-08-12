/**
 * notifications.js
 * Notification bell badge + notification panel rendering.
 */
"use strict";
/* ---------- NOTIFICATIONS ---------- */
function unreadCount(){return notifs.filter(n=>n.unread).length}
function renderBell(){const c=unreadCount();const b=$("#bellBadge");b.textContent=c;b.style.display=c?"grid":"none";renderNav();}
function notifPanel(anchor){
  const items=notifs.map(n=>{const[i,bg,fg]=NMETA[n.type];
    return `<div class="notif-item ${n.unread?"unread":""}" data-nid="${n.id}">
      <div class="n-ic" style="background:${bg};color:${fg}">${ic(i,14,2)}</div>
      <div style="min-width:0"><div class="nt">${n.html}</div><div class="nw">${relTime(n.ts)}</div></div></div>`}).join("");
  const p=popover(anchor,`<div class="pop-h">Notifications
    <span class="chip plain mono" style="margin-left:2px">${unreadCount()} new</span>
    <button class="btn xs ghost" style="margin-left:auto" id="markAll">Mark all read</button></div>
    <div style="max-height:380px;overflow-y:auto">${items||`<div class="empty" style="padding:30px">${ic("bellS",20)}<b>All caught up</b></div>`}</div>`,360);
  p.querySelector("#markAll").onclick=e=>{e.stopPropagation();notifs.forEach(n=>n.unread=false);renderBell();closePopovers();toast("All notifications marked as read","success")};
  p.querySelectorAll(".notif-item").forEach(el=>el.onclick=()=>{const n=notifs.find(x=>x.id===el.dataset.nid);n.unread=false;renderBell();notifPanel(anchor)});
}

