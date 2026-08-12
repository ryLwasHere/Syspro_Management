# Syspro Backend

Simple Express.js backend API for the Syspro Workspace frontend application.

## Features

- RESTful API for tasks, files, folders, shortcuts, and notifications
- JSON file-based persistence (data saved to `db.json`)
- CORS enabled for cross-origin requests
- Serves the frontend static files

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Access the application

- Frontend: http://localhost:3000/index.html
- API Health Check: http://localhost:3000/api/health

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Files
- `GET /api/files` - Get all files
- `POST /api/files` - Create a new file entry
- `DELETE /api/files/:id` - Delete a file

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create a new folder

### Shortcuts
- `GET /api/shortcuts` - Get all shortcuts
- `POST /api/shortcuts` - Create a new shortcut
- `DELETE /api/shortcuts/:id` - Delete a shortcut

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Create a notification
- `PUT /api/notifications/:id/read` - Mark notification as read

### Bulk Operations
- `GET /api/data` - Get all data (tasks, files, folders, shortcuts, notifications)
- `POST /api/data/seed` - Replace all data (useful for initial seeding)

## Data Persistence

All data is persisted to `db.json` in the root directory. This file is automatically created when you first create/update any data.

## Example Requests

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "status": "todo",
    "prio": "high",
    "assignee": "John Doe",
    "project": "My Project"
  }'
```

### Get All Tasks
```bash
curl http://localhost:3000/api/tasks
```

### Update a Task
```bash
curl -X PUT http://localhost:3000/api/tasks/TSK-1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "progress"
  }'
```

## Integrating with Frontend

To connect the frontend to this backend, you'll need to modify the JavaScript files to make API calls instead of using local data. Here's a basic example:

```javascript
// Instead of using local TASKS array
async function loadTasks() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();
  return tasks;
}

// To save a task
async function saveTask(task) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  return await response.json();
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)

```bash
PORT=8080 npm start
```
