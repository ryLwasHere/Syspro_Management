/**
 * view-settings.js
 * Settings page: profile, notification channels, density, permission matrix.
 */
"use strict";

/* ================================================================
   SETTINGS
================================================================ */
function viewSettings(){
  const events=[["Task due reminders","Nudge before deadlines hit",true,true],["Task assigned to you","When someone assigns you work",true,true],["Task completed","When a task you follow is done",true,false],["Comment added","Replies on your tasks",true,true],["File shared with you","Library shares & mentions",true,false],["File uploaded","New uploads in followed folders",false,false]];
  return `
  <div class="page-head"><div><div class="page-title">Settings</div><div class="page-sub">Profile, notification channels and workspace preferences.</div></div></div>
  <div class="set-col">
    <div class="panel">
      <div class="panel-h"><span class="panel-t">${ic("user",14)} Profile</span></div>
      <div style="padding:16px;display:flex;gap:16px;align-items:center">
        <div class="avatar" style="width:52px;height:52px;font-size:18px;background:#E3F2EF;color:#096A60">AR</div>
        <div class="frm-grid" style="flex:1">
          <div><label class="lbl">Full name</label><input class="inp" value="Alex Rivera"></div>
          <div><label class="lbl">Email</label><input class="inp mono" style="font-size:12px" value="alex@atlascrew.io"></div>
          <div><label class="lbl">Role</label><input class="inp" value="Product Ops"></div>
          <div><label class="lbl">Workspace</label><input class="inp" value="atlas-crew / prod" disabled style="background:var(--panel-3)"></div>
        </div>
      </div>
      <div style="padding:0 16px 16px;display:flex;justify-content:flex-end"><button class="btn primary sm" data-action="fakeSave">Save profile</button></div>
    </div>
    <div class="panel">
      <div class="panel-h"><span class="panel-t">${ic("bellS",14)} Notification channels</span>
        <span class="chip plain mono panel-a">in-app · email · push (soon)</span></div>
      <table class="matrix"><thead><tr><th>Event</th><th style="width:110px">In-app</th><th style="width:110px">Email</th></tr></thead>
      <tbody>${events.map(([n,d,a,b])=>`<tr><td>${n}<div style="font-size:11px;color:var(--ink-3);font-weight:400;margin-top:2px">${d}</div></td>
        <td><label class="switch"><input type="checkbox" ${a?"checked":""} data-chan="${n}/in-app"><i></i></label></td>
        <td><label class="switch"><input type="checkbox" ${b?"checked":""} data-chan="${n}/email"><i></i></label></td></tr>`).join("")}</tbody></table>
    </div>
    <div class="panel">
      <div class="panel-h"><span class="panel-t">${ic("sliders",14)} Preferences</span></div>
      <div class="set-row"><div class="si"><div class="sn">Interface density</div><div class="sd">Compact fits more on screen; comfortable adds breathing room.</div></div>
        <div class="seg"><button class="${document.body.classList.contains("comfy")?"":"on"}" data-action="density" data-d="compact">Compact</button>
        <button class="${document.body.classList.contains("comfy")?"on":""}" data-action="density" data-d="comfy">Comfortable</button></div></div>
      <div class="set-row"><div class="si"><div class="sn">Week starts on</div><div class="sd">Applies to calendar views everywhere.</div></div>
        <select class="inp" style="width:130px"><option>Monday</option><option>Sunday</option></select></div>
      <div class="set-row"><div class="si"><div class="sn">Reminder lead time</div><div class="sd">Default for task due reminders.</div></div>
        <select class="inp" style="width:130px"><option>15 min</option><option selected>30 min</option><option>1 hour</option><option>1 day</option></select></div>
    </div>
    <div class="panel" style="border-color:#F1C6C6">
      <div class="panel-h"><span class="panel-t" style="color:var(--red)">${ic("alert",14)} Danger zone</span></div>
      <div class="set-row"><div class="si"><div class="sn">Reset workspace demo data</div><div class="sd">Restores all seeded tasks, files and shortcuts.</div></div>
        <button class="btn danger sm" data-action="resetData">Reset data</button></div>
    </div>
  </div>`;
}
