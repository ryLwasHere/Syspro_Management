/**
 * date-utils.js
 * Date parsing/formatting helpers and the due-date label renderer.
 */
"use strict";

/* ---------- DATE HELPERS ---------- */
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const TODAY=iso(new Date());
const dOff=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const parseISO=s=>{const[a,b,c]=s.split("-").map(Number);return new Date(a,b-1,c)};
const Mshort=d=>d.toLocaleDateString("en-US",{month:"short"});
const fmtD=ds=>{const d=parseISO(ds);return `${Mshort(d)} ${d.getDate()}`};
const fmtDFull=ds=>{const d=parseISO(ds);return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})};
const fmtMonth=d=>d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
const relTime=ts=>{const m=Math.round((Date.now()-ts)/6e4);if(m<1)return"now";if(m<60)return m+"m ago";const h=Math.round(m/60);if(h<24)return h+"h ago";const dd=Math.round(h/24);return dd===1?"yesterday":dd+"d ago"};
function dueLabel(t){
  if(!t.due)return"—";
  const diff=Math.round((parseISO(t.due)-parseISO(TODAY))/864e5);
  let txt=diff===0?"Today":diff===1?"Tomorrow":diff===-1?"Yesterday":fmtD(t.due);
  const late=diff<0&&t.status!=="done";
  return `<span class="tk-time ${late?"late":""}">${late?ic("alert",10,2)+" ":""}${txt}${t.time?" · "+t.time:""}</span>`;
}

