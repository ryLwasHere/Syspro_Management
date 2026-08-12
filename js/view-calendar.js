/**
 * view-calendar.js
 * Calendar page + shared calendar rendering (month/week/day/agenda grids).
 */
"use strict";

/* ================================================================
   CALENDAR ENGINE
================================================================ */
function tasksOn(ds){return tasks.filter(t=>!t.archived&&t.due===ds)}
const prioW={critical:4,high:3,medium:2,low:1};
function chipHTML(t,withTime){
  const m=PRIO[t.prio],s=STATUS[t.status];
  return `<button class="cal-chip ${t.status==="done"?"done":""}" style="background:${m.bg};border-color:${m.bg};color:var(--ink)" data-action="openTask" data-id="${t.id}">
    <span class="dot" style="background:${m.c}"></span><span class="ct">${esc(t.title)}</span>${withTime&&t.time?`<span class="tm">${t.time}</span>`:""}</button>`;
}
function monthHTML(anchor,mini,scope){
  const y=anchor.getFullYear(),m=anchor.getMonth();
  const first=new Date(y,m,1);
  const start=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<42;i++){const d=new Date(y,m,1-start+i);cells.push(d)}
  const body=cells.map(d=>{
    const ds=iso(d),inM=d.getMonth()===m,wk=d.getDay()===0||d.getDay()===6;
    const ts=tasksOn(ds).sort((a,b)=>prioW[b.prio]-prioW[a.prio]);
    let inner;
    if(mini){
      inner=ts.length?`<div class="dots">${ts.slice(0,4).map(t=>`<i style="background:${PRIO[t.prio].c};${t.status==="done"?"opacity:.4":""}"></i>`).join("")}${ts.length>4?`<i style="background:var(--ink-4)"></i>`:""}</div>`:"";
    }else{
      const shown=ts.slice(0,3);
      inner=shown.map(t=>chipHTML(t,true)).join("")+(ts.length>3?`<button class="cal-more" data-action="goCalDay" data-date="${ds}">+${ts.length-3} more</button>`:"");
    }
    return `<div class="cal-cell ${inM?"":"out"} ${ds===TODAY?"today":""} ${wk?"wkend":""}" data-action="calCell" data-date="${ds}">
      <div class="dnum">${d.getDate()}</div>${inner}
      <button class="cal-add" data-action="newTask" data-date="${ds}" data-tip="Add task" aria-label="Add task">${ic("plus",10,2.6)}</button></div>`;
  }).join("");
  return `<div class="cal-dow">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<span>${d}</span>`).join("")}</div>
    <div class="cal-month ${mini?"mini":""}">${body}</div>`;
}
function weekDates(anchor){const mon=new Date(anchor);mon.setDate(mon.getDate()-((mon.getDay()+6)%7));return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d})}
const H0=7,H1=21,HH=44;
function timeGridHTML(dates,view){
  const isDay=view==="day";
  const heads=`<div></div>`+dates.map(d=>`<div class="wk-head ${iso(d)===TODAY?"today":""}"><div class="wd">${d.toLocaleDateString("en-US",{weekday:"short"})}</div><div class="wn">${d.getDate()}</div></div>`).join("");
  const hours=Array.from({length:H1-H0+1},(_,i)=>`<div class="wk-h" style="top:${i*HH}px">${pad(H0+i)}:00</div>`).join("");
  const now=new Date(),nowH=now.getHours()+now.getMinutes()/60;
  const cols=dates.map(d=>{
    const ds=iso(d);
    const ts=tasksOn(ds);
    const timed=ts.filter(t=>t.time).sort((a,b)=>a.time.localeCompare(b.time));
    const blocks=timed.map(t=>{
      const[h,mm]=t.time.split(":").map(Number);
      const top=Math.max(0,(h-H0+mm/60)*HH),hgt=Math.max(26,HH*0.9);
      const m=PRIO[t.prio];
      return `<button class="evt ${t.status==="done"?"done":""}" style="top:${top}px;height:${hgt}px;background:${m.bg};border-color:${m.bg};border-left-color:${m.c};color:var(--ink)" data-action="openTask" data-id="${t.id}">
        <span class="et">${esc(t.title)}</span><span class="em">${t.time} · ${STATUS[t.status].l}</span></button>`;
    }).join("");
    const nowline=ds===TODAY&&nowH>=H0&&nowH<=H1?`<div class="nowline" style="top:${(nowH-H0)*HH}px"></div>`:"";
    return `<div class="wk-col" data-date="${ds}" style="height:${(H1-H0)*HH}px">${blocks}${nowline}</div>`;
  }).join("");
  const unsched=dates.flatMap(d=>tasksOn(iso(d)).filter(t=>!t.time).map(t=>chipHTML(t,false).replace("cal-chip",`cal-chip`)));
  return `<div class="cal-week ${isDay?"day":""}">${heads}</div>
    ${dates.some(d=>tasksOn(iso(d)).some(t=>!t.time))?`<div class="notime-strip"><span class="mono" style="font-size:9.5px;color:var(--ink-4);letter-spacing:.08em;align-self:center;margin-right:4px">NO TIME</span>${dates.map(d=>tasksOn(iso(d)).filter(t=>!t.time).map(t=>chipHTML(t,false)).join("")).join("")}</div>`:""}
    <div style="overflow-y:auto;max-height:calc(100vh - 320px)"><div class="wk-body ${isDay?"day":""}"><div class="wk-gutter" style="height:${(H1-H0)*HH}px">${hours}</div>${cols}</div></div>`;
}
function agendaHTML(dates){
  const seg=dates.map(d=>{
    const ds=iso(d),ts=tasksOn(ds).sort((a,b)=>prioW[b.prio]-prioW[a.prio]);
    return `<div class="agenda-day">${d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}${ds===TODAY?' <span style="color:var(--acc-700)">· today</span>':""}</div>`+
      (ts.length?ts.map(t=>`
        <div class="tk-item" data-action="openTask" data-id="${t.id}">
          <button class="ckbox ${t.status==="done"?"done":""}" data-action="toggleDone" data-id="${t.id}">${ic("check",10,3)}</button>
          <div style="min-width:0;flex:1"><div class="tk-title">${esc(t.title)}</div>
          <div class="tk-meta"><span class="tid">${t.id}</span>${t.time?`<span class="tk-time">${t.time}</span>`:""}${prioChip(t.prio)}</div></div>
          ${avatar(t.assignee,"av-sm")}
        </div>`).join(""):`<div style="padding:12px 14px;font-size:12px;color:var(--ink-4)">No tasks</div>`);
  }).join("");
  return seg;
}
function fillCalendar(scope){
  const anchor=scope==="home"?state.homeAnchor:state.calAnchor;
  const view=scope==="home"?state.homeCalView:state.calView;
  const titleEl=document.getElementById(scope==="home"?"hcalTitle":"calTitle");
  const body=document.getElementById(scope==="home"?"hcalBody":"calBody");
  if(!body)return;
  if(view==="month"){titleEl.textContent=fmtMonth(anchor);body.innerHTML=`<div class="panel" style="border-radius:10px;overflow:hidden;border-color:var(--line)">${monthHTML(anchor,scope==="home",scope)}</div>`}
  else if(view==="week"){const wk=weekDates(anchor);titleEl.textContent=`${fmtD(iso(wk[0]))} – ${fmtD(iso(wk[6]))}, ${wk[6].getFullYear()}`;body.innerHTML=`<div class="panel" style="border-radius:10px;overflow:hidden">${timeGridHTML(wk,"week")}</div>`}
  else{titleEl.textContent=anchor.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
    body.innerHTML=scope==="home"?`<div class="panel" style="border-radius:10px;overflow:hidden">${agendaHTML([anchor])}</div>`:`<div class="panel" style="border-radius:10px;overflow:hidden">${timeGridHTML([anchor],"day")}</div>`}
  body.querySelectorAll(".wk-col").forEach(col=>{
    col.addEventListener("click",e=>{
      if(e.target.closest(".evt"))return;
      const r=col.getBoundingClientRect(),hr=H0+Math.floor((e.clientY-r.top)/HH*2)/2;
      openTaskModal({date:col.dataset.date,time:`${pad(Math.floor(hr))}:${hr%1?"30":"00"}`});
    });
  });
}
function bindCalTools(scope){
  fillCalendar(scope);
}

/* ================================================================
   CALENDAR PAGE
================================================================ */
function viewCalendar(){
  return `
  <div class="page-head">
    <div><div class="page-title">Calendar</div><div class="page-sub">Tasks scheduled by due date — click any slot to add one.</div></div>
    <div class="page-actions">
      <button class="btn" data-action="calToday" data-scope="page">Today</button>
      <div style="display:flex;border:1px solid var(--line-2);border-radius:var(--r);overflow:hidden">
        <button class="icon-btn" style="border-radius:0;border:none" data-action="calNav" data-scope="page" data-dir="-1" aria-label="Previous">${ic("chevL",14,2.2)}</button>
        <span style="width:1px;background:var(--line-2)"></span>
        <button class="icon-btn" style="border-radius:0;border:none" data-action="calNav" data-scope="page" data-dir="1" aria-label="Next">${ic("chevR",14,2.2)}</button>
      </div>
      <div class="seg">${["month","week","day"].map(v=>`<button class="${state.calView===v?"on":""}" data-action="calView" data-scope="page" data-view="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join("")}</div>
      <button class="btn primary" data-action="newTask">${ic("plus",13,2.4)} Task</button>
    </div>
  </div>
  <div class="panel" style="overflow:hidden">
    <div class="panel-h" style="justify-content:space-between">
      <span class="panel-t" id="calTitle" style="font-size:14px"></span>
      <span class="mono" style="font-size:10.5px;color:var(--ink-4)">● priority · strikethrough = done</span>
    </div>
    <div id="calBody"></div>
  </div>`;
}
