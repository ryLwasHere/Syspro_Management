/**
 * Syspro Backend Server
 * Express.js API with SQLite database for the Syspro frontend
 */
"use strict";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "syspro.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

let db = null;

// Helper to save database to file
function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  }
}

initSqlJs().then(SQL => {
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log("Loaded existing SQLite database");
  } else {
    db = new SQL.Database();
    console.log("Created new SQLite database");
    initializeDatabase();
  }
  console.log("Connected to SQLite database");
});

function initializeDatabase() {
  // Create tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      status TEXT DEFAULT 'todo',
      prio TEXT DEFAULT 'medium',
      due TEXT,
      time TEXT,
      assignee TEXT,
      project TEXT,
      tags TEXT,
      desc TEXT,
      attachments TEXT,
      comments TEXT,
      activity TEXT,
      done INTEGER DEFAULT 0,
      doneAt INTEGER,
      doneBy TEXT,
      archived INTEGER DEFAULT 0,
      createdAt INTEGER
    )
  `);

  // Create files table
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT,
      folder TEXT,
      size INTEGER DEFAULT 0,
      mod INTEGER,
      owner TEXT,
      task TEXT,
      isNew INTEGER DEFAULT 0
    )
  `);

  // Create folders table
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT,
      parent TEXT,
      owner TEXT,
      color TEXT,
      description TEXT,
      shared TEXT,
      isNew INTEGER DEFAULT 0
    )
  `);

  // Create shortcuts table
  db.run(`
    CREATE TABLE IF NOT EXISTS shortcuts (
      id TEXT PRIMARY KEY,
      label TEXT,
      url TEXT,
      icon TEXT,
      color TEXT,
      target TEXT DEFAULT '_blank'
    )
  `);

  // Create notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT DEFAULT 'assign',
      html TEXT,
      ts INTEGER,
      unread INTEGER DEFAULT 1
    )
  `);
  
  saveDB();
}

// Helper to parse JSON strings from DB
function parseJSON(str) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
}

// Helper to stringify for DB storage
function stringifyJSON(obj) {
  return JSON.stringify(obj || []);
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== TASKS API =====

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const result = db.exec("SELECT * FROM tasks");
  if (!result.length) {
    return res.json([]);
  }
  const columns = result[0].columns;
  const values = result[0].values;
  const tasks = values.map(row => {
    const task = {};
    columns.forEach((col, i) => {
      task[col] = row[i];
    });
    task.tags = parseJSON(task.tags);
    task.attachments = parseJSON(task.attachments);
    task.comments = parseJSON(task.comments);
    task.activity = parseJSON(task.activity);
    task.done = task.done === 1;
    task.archived = task.archived === 1;
    return task;
  });
  res.json(tasks);
});

// Create task
app.post("/api/tasks", (req, res) => {
  const task = req.body;
  const id = task.id || Date.now().toString();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, status, prio, due, time, assignee, project, tags, desc, attachments, comments, activity, done, doneAt, doneBy, archived, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    id,
    task.title || "",
    task.status || "todo",
    task.prio || "medium",
    task.due || "",
    task.time || "",
    task.assignee || "",
    task.project || "",
    stringifyJSON(task.tags),
    task.desc || "",
    stringifyJSON(task.attachments),
    stringifyJSON(task.comments),
    stringifyJSON(task.activity),
    task.done ? 1 : 0,
    task.doneAt || null,
    task.doneBy || "",
    task.archived ? 1 : 0,
    task.createdAt || Date.now()
  ]);
  stmt.free();
  saveDB();
  res.json({ id, ...task });
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const task = req.body;
  db.run(`
    UPDATE tasks SET
      title = ?, status = ?, prio = ?, due = ?, time = ?,
      assignee = ?, project = ?, tags = ?, desc = ?,
      attachments = ?, comments = ?, activity = ?,
      done = ?, doneAt = ?, doneBy = ?, archived = ?
    WHERE id = ?
  `, [
    task.title,
    task.status,
    task.prio,
    task.due,
    task.time,
    task.assignee,
    task.project,
    stringifyJSON(task.tags),
    task.desc,
    stringifyJSON(task.attachments),
    stringifyJSON(task.comments),
    stringifyJSON(task.activity),
    task.done ? 1 : 0,
    task.doneAt,
    task.doneBy,
    task.archived ? 1 : 0,
    id
  ]);
  saveDB();
  res.json({ id, ...task });
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// ===== FILES API =====

// Get all files
app.get("/api/files", (req, res) => {
  const result = db.exec("SELECT * FROM files");
  if (!result.length) {
    return res.json([]);
  }
  const columns = result[0].columns;
  const values = result[0].values;
  const files = values.map(row => {
    const file = {};
    columns.forEach((col, i) => {
      file[col] = row[i];
    });
    file.isNew = file.isNew === 1;
    return file;
  });
  res.json(files);
});

// Create file
app.post("/api/files", (req, res) => {
  const file = req.body;
  const id = file.id || Date.now().toString();
  db.run(`
    INSERT INTO files (id, name, folder, size, mod, owner, task, isNew)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    file.name || "",
    file.folder || "",
    file.size || 0,
    file.mod || Date.now(),
    file.owner || "",
    file.task || "",
    file.isNew ? 1 : 0
  ]);
  saveDB();
  res.json({ id, ...file });
});

// Update file
app.put("/api/files/:id", (req, res) => {
  const { id } = req.params;
  const file = req.body;
  db.run(`
    UPDATE files SET
      name = ?, folder = ?, size = ?, mod = ?,
      owner = ?, task = ?, isNew = ?
    WHERE id = ?
  `, [
    file.name,
    file.folder,
    file.size,
    file.mod,
    file.owner,
    file.task,
    file.isNew ? 1 : 0,
    id
  ]);
  saveDB();
  res.json({ id, ...file });
});

// Delete file
app.delete("/api/files/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM files WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// ===== FOLDERS API =====

// Get all folders
app.get("/api/folders", (req, res) => {
  const result = db.exec("SELECT * FROM folders");
  if (!result.length) {
    return res.json([]);
  }
  const columns = result[0].columns;
  const values = result[0].values;
  const folders = values.map(row => {
    const folder = {};
    columns.forEach((col, i) => {
      folder[col] = row[i];
    });
    folder.isNew = folder.isNew === 1;
    folder.shared = parseJSON(folder.shared);
    return folder;
  });
  res.json(folders);
});

// Create folder
app.post("/api/folders", (req, res) => {
  const folder = req.body;
  const id = folder.id || Date.now().toString();
  db.run(`
    INSERT INTO folders (id, name, parent, owner, color, description, shared, isNew)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    folder.name || "",
    folder.parent || "",
    folder.owner || "",
    folder.color || "",
    folder.description || "",
    stringifyJSON(folder.shared),
    folder.isNew ? 1 : 0
  ]);
  saveDB();
  res.json({ id, ...folder });
});

// Update folder
app.put("/api/folders/:id", (req, res) => {
  const { id } = req.params;
  const folder = req.body;
  db.run(`
    UPDATE folders SET
      name = ?, parent = ?, owner = ?, color = ?,
      description = ?, shared = ?, isNew = ?
    WHERE id = ?
  `, [
    folder.name,
    folder.parent,
    folder.owner,
    folder.color,
    folder.description,
    stringifyJSON(folder.shared),
    folder.isNew ? 1 : 0,
    id
  ]);
  saveDB();
  res.json({ id, ...folder });
});

// Delete folder
app.delete("/api/folders/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM folders WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// ===== SHORTCUTS API =====

// Get all shortcuts
app.get("/api/shortcuts", (req, res) => {
  const result = db.exec("SELECT * FROM shortcuts");
  if (!result.length) {
    return res.json([]);
  }
  const columns = result[0].columns;
  const values = result[0].values;
  const shortcuts = values.map(row => {
    const shortcut = {};
    columns.forEach((col, i) => {
      shortcut[col] = row[i];
    });
    return shortcut;
  });
  res.json(shortcuts);
});

// Create shortcut
app.post("/api/shortcuts", (req, res) => {
  const shortcut = req.body;
  const id = shortcut.id || Date.now().toString();
  db.run(`
    INSERT INTO shortcuts (id, label, url, icon, color, target)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    id,
    shortcut.label || "",
    shortcut.url || "",
    shortcut.icon || "",
    shortcut.color || "",
    shortcut.target || "_blank"
  ]);
  saveDB();
  res.json({ id, ...shortcut });
});

// Update shortcut
app.put("/api/shortcuts/:id", (req, res) => {
  const { id } = req.params;
  const shortcut = req.body;
  db.run(`
    UPDATE shortcuts SET
      label = ?, url = ?, icon = ?, color = ?, target = ?
    WHERE id = ?
  `, [
    shortcut.label,
    shortcut.url,
    shortcut.icon,
    shortcut.color,
    shortcut.target,
    id
  ]);
  saveDB();
  res.json({ id, ...shortcut });
});

// Delete shortcut
app.delete("/api/shortcuts/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM shortcuts WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// ===== NOTIFICATIONS API =====

// Get all notifications
app.get("/api/notifications", (req, res) => {
  const result = db.exec("SELECT * FROM notifications ORDER BY ts DESC");
  if (!result.length) {
    return res.json([]);
  }
  const columns = result[0].columns;
  const values = result[0].values;
  const notifications = values.map(row => {
    const notif = {};
    columns.forEach((col, i) => {
      notif[col] = row[i];
    });
    notif.unread = notif.unread === 1;
    return notif;
  });
  res.json(notifications);
});

// Create notification
app.post("/api/notifications", (req, res) => {
  const notif = req.body;
  const id = notif.id || Date.now().toString();
  db.run(`
    INSERT INTO notifications (id, type, html, ts, unread)
    VALUES (?, ?, ?, ?, ?)
  `, [
    id,
    notif.type || "assign",
    notif.html || "",
    notif.ts || Date.now(),
    notif.unread !== false ? 1 : 0
  ]);
  saveDB();
  res.json({ id, ...notif });
});

// Mark notification as read
app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  db.run("UPDATE notifications SET unread = 0 WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// Delete notification
app.delete("/api/notifications/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM notifications WHERE id = ?", [id]);
  saveDB();
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Syspro Backend Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`Frontend served at http://localhost:${PORT}/index.html`);
});
