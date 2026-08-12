/**
 * data-loader.js
 * Load initial data from API on app boot.
 */
"use strict";

async function loadInitialData() {
  try {
    const [tasksRes, filesRes, foldersRes, shortcutsRes, notifsRes] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/files').then(r => r.json()),
      fetch('/api/folders').then(r => r.json()),
      fetch('/api/shortcuts').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json())
    ]);
    
    tasks = tasksRes || [];
    files = filesRes || [];
    folders = foldersRes || [];
    shortcuts = shortcutsRes || [];
    notifs = notifsRes || [];
    
    // Update TID and SID based on existing data
    if (tasks.length > 0) {
      const maxId = Math.max(...tasks.map(t => parseInt(t.id.replace('TSK-', ''))));
      TID = maxId + 1;
    }
    if (shortcuts.length > 0) {
      const maxSid = Math.max(...shortcuts.map(s => parseInt(s.id.replace('s', ''))));
      SID = maxSid + 1;
    }
    
    console.log('Data loaded from API:', { tasks: tasks.length, files: files.length, folders: folders.length, shortcuts: shortcuts.length, notifs: notifs.length });
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
}
