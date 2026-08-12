# Syspro — Workspace

Refactor dari 1 file `index.html` (±1750 baris, semua CSS & JS inline) menjadi
struktur multi-file supaya lebih mudah di-maintain. Tidak ada build step —
tetap plain HTML/CSS/JS, tinggal dibuka `index.html` di browser (atau serve
lewat static server bila ingin, karena beberapa browser membatasi fitur untuk
file `file://`).

## Struktur folder

```
syspro/
├── index.html              # Shell HTML: <head>, layout statis, referensi CSS/JS
├── css/
│   └── styles.css          # Semua styling (design tokens, layout, komponen)
└── js/
    ├── utils.js             # Helper DOM ($ , $$) + escape HTML
    ├── icons.js              # Library ikon SVG inline
    ├── constants.js          # Lookup table statis (status, prioritas, user, dll)
    ├── date-utils.js         # Helper format & parsing tanggal
    ├── data.js                # Data demo/seed (tasks, files, folders, shortcuts, notif)
    ├── state.js               # Objek state UI (halaman aktif, filter, dll)
    ├── ui-components.js       # Toast, modal, popover generik
    ├── notifications.js       # Badge & panel notifikasi
    ├── nav.js                 # Sidebar nav, breadcrumb, routing halaman (go/render)
    ├── view-home.js           # Halaman Home
    ├── view-calendar.js       # Halaman Calendar + engine kalender (dipakai juga di Home)
    ├── view-tasks.js          # Halaman Tasks (board/list/table + drawer detail task)
    ├── view-files.js          # Halaman Files & Library
    ├── view-shortcuts.js      # Halaman Shortcuts
    ├── view-archive.js        # Halaman Archive
    ├── view-settings.js       # Halaman Settings
    ├── palette.js              # Command palette (⌘K)
    ├── events.js                # Semua event delegation global (click/change/keydown)
    └── main.js                  # Boot: render pertama kali + fade-out skeleton
```

## Urutan load penting

Script-script di atas dimuat via `<script src="...">` biasa (bukan ES module),
jadi semuanya berbagi *global scope* persis seperti versi 1-file sebelumnya.
Urutan di `index.html` **tidak boleh diacak**, karena file belakangan
bergantung pada konstanta/fungsi yang didefinisikan di file sebelumnya
(mis. `data.js` memakai `dOff()` dari `date-utils.js`, `constants.js` memakai
`ic()` dari `icons.js`, dst).

Urutan yang benar (sudah diatur di `index.html`):

```
utils → icons → constants → date-utils → data → state → ui-components →
notifications → nav → view-home → view-calendar → view-tasks → view-files →
view-shortcuts → view-archive → view-settings → palette → events → main
```

## Menambah fitur baru

- Halaman baru → buat `js/view-<nama>.js`, daftarkan di `NAV`/`TITLES` pada
  `nav.js`, lalu tambahkan `<script src="js/view-<nama>.js">` di
  `index.html` (sebelum `events.js`).
- Aksi/tombol baru → tambahkan `case` baru di switch besar dalam
  `js/events.js`.
- Styling baru → tambahkan section baru di `css/styles.css` (sudah dibagi per
  komponen dengan komentar `/* ==== NAMA ==== */`).

## Catatan

Ini adalah aplikasi demo front-end murni — semua data (`tasks`, `files`,
`shortcuts`, `notifs`) adalah data statis di `js/data.js` dan disimpan di
memori (hilang saat reload), tidak terhubung ke backend/database apa pun.
