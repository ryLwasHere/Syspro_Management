/**
 * icons.js
 * Inline SVG icon library (IC) and the ic() render helper.
 */
"use strict";

/* ---------- ICONS ---------- */
const IC={
home:'<path d="M3.6 10.4 12 3.6l8.4 6.8"/><path d="M5.6 9v10.6a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9"/><path d="M9.9 20.4v-5.6h4.2v5.6"/>',
tasks:'<rect x="3.5" y="3.5" width="17" height="17" rx="3.6"/><path d="m8.4 12.3 2.4 2.4 4.8-5.2"/>',
cal:'<rect x="3.5" y="4.8" width="17" height="15.7" rx="2.6"/><path d="M3.5 9.6h17M8.2 2.8v3.6M15.8 2.8v3.6"/>',
folder:'<path d="M3.5 7A2.5 2.5 0 0 1 6 4.5h3.2a1.5 1.5 0 0 1 1.2.6l1.4 1.7H18A2.5 2.5 0 0 1 20.5 9.3V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
archive:'<rect x="3.5" y="4" width="17" height="4.6" rx="1.2"/><path d="M5.3 8.6v9.8a2.1 2.1 0 0 0 2.1 2.1h9.2a2.1 2.1 0 0 0 2.1-2.1V8.6"/><path d="M10 12.7h4"/>',
search:'<circle cx="11" cy="11" r="6.3"/><path d="m15.6 15.6 4.9 4.9"/>',
plus:'<path d="M12 5.5v13M5.5 12h13"/>',
chevL:'<path d="m14.5 6-6 6 6 6"/>', chevR:'<path d="m9.5 6 6 6-6 6"/>', chevD:'<path d="m6 9.5 6 6 6-6"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
check:'<path d="m5 12.5 4.6 4.5L19 7"/>',
dots:'<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
ext:'<path d="M9.5 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5"/><path d="M13.5 4H20v6.5"/><path d="M20 4 11.8 12.2"/>',
clock:'<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3 1.9"/>',
flag:'<path d="M5.5 21V4"/><path d="M5.5 4.5h11.3l-2.4 3.9 2.4 3.9H5.5"/>',
clip:'<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7l-7.6 7.6a1.7 1.7 0 0 1-2.4-2.4l7-7"/>',
tag:'<path d="M3.8 10.2V5.8a2 2 0 0 1 2-2h4.4a2 2 0 0 1 1.4.6l8 8a2 2 0 0 1 0 2.8l-4.2 4.2a2 2 0 0 1-2.8 0l-8-8a2 2 0 0 1-.6-1.4Z"/><circle cx="8.2" cy="8.2" r="1.3"/>',
pen:'<path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z"/><path d="m14.5 7 3 3"/>',
trash:'<path d="M4.5 6.5h15"/><path d="M8 6.5V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v1.5"/><path d="M6.3 6.5 7 19a1.8 1.8 0 0 0 1.8 1.7h6.4A1.8 1.8 0 0 0 17 19l.7-12.5"/><path d="M10 10.5v6M14 10.5v6"/>',
restore:'<path d="M3.8 4.8v4.8h4.8"/><path d="M4.4 14.5a8 8 0 1 0 .9-7L3.8 9.6"/>',
up:'<path d="M12 15V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/><path d="M4.5 19.5h15"/>',
down:'<path d="M12 4.5v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4.5 19.5h15"/>',
filter:'<path d="M4 5.5h16l-6.3 7.2v5.1L10.3 20v-7.3Z"/>',
list:'<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><circle cx="4.7" cy="6.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.7" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.7" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>',
board:'<rect x="3.5" y="4" width="5" height="16" rx="1.4"/><rect x="10" y="4" width="5" height="11" rx="1.4"/><rect x="16.5" y="4" width="4" height="8" rx="1.4"/>',
table:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.8h17M9.5 9.8v9.7M15 9.8v9.7"/>',
msg:'<path d="M12 3.8a8.2 8.2 0 0 0-8.2 8.2c0 1.6.5 3.1 1.3 4.4L4 20.2l3.9-1.1a8.2 8.2 0 1 0 4.1-15.3Z"/>',
inbox:'<path d="M3.5 13.5 6 5.8A1.8 1.8 0 0 1 7.7 4.5h8.6A1.8 1.8 0 0 1 18 5.8l2.5 7.7"/><path d="M3.5 13.5h5l1.2 2.2h4.6l1.2-2.2h5V17a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5Z"/>',
alert:'<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.2"/><circle cx="12" cy="16.8" r=".5" fill="currentColor"/>',
mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>',
user:'<circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20c1.1-3.3 3.9-5 7.2-5s6.1 1.7 7.2 5"/>',
eye:'<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.8"/>',
link:'<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.8 4.7a3.9 3.9 0 0 1 5.5 5.5L16.5 12"/><path d="M13 17.5l-1.8 1.8a3.9 3.9 0 0 1-5.5-5.5L7.5 12"/>',
bellS:'<path d="M17.9 9.2a5.9 5.9 0 1 0-11.8 0c0 4.6-1.9 5.9-1.9 5.9h15.6s-1.9-1.3-1.9-5.9"/><path d="M10.3 18.9a2 2 0 0 0 3.4 0"/>',
send:'<path d="M20.5 3.5 10 14"/><path d="M20.5 3.5 14 20.5l-4-6.5-6.5-4Z"/>',
grip:'<circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>'
};
const ic=(n,s=16,w=1.8)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
