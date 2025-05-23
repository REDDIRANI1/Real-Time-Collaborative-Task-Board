# 🧩 Collaborative Task Board

A real-time collaborative task board built with **React**, **TailwindCSS**, **Supabase**, and **Drag & Drop** functionality. Supports real-time updates, task editing, description editing, and multi-user collaboration.


## 🚀 Features

- 📦 Drag-and-drop task management (@hello-pangea/dnd)
- 🔁 Real-time sync using Supabase Realtime
- 🧱 Column features:
   ➕ Column creation
   ✏️ Editable column titles
   🗑️ Column deletion

- 📋 Task features:
   ➕ Task creation
   ✏️ Editable task titles
   🗑️ Task deletion
- 🧾 Task descriptions
- 💬 Comments or activity feed on tasks
- ↩️ Undo/Redo functionality
- 📊 Column reordering
- ⏰ Task due dates and reminders
- 👥 Collaborative multi-user environment
- ⚡ Instant updates without refreshing the page



## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL, Realtime)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Deployment**: Vercel

🔄 Real-Time Architecture and Data Flow
Overview
Supabase Realtime and Presence features are used to provide live sync across users.

1. Database Changes
Supabase Realtime listens for INSERT, UPDATE, and DELETE events on tasks and columns.
These events are pushed to all connected clients via WebSockets.
The app listens to these events using .on('postgres_changes') and dispatches Redux actions accordingly.

2. Presence System
A dedicated presence:board channel tracks online users.
Each client joins the presence channel using a unique ID (crypto.randomUUID() or auth user ID).
The list of online users is maintained locally using Supabase's presenceState().

3. Drag-and-Drop
Managed by @hello-pangea/dnd.
Task movements dispatch a moveTask action locally.
We can optionally persist task order and column order in the DB.

⚖️ Tradeoffs and Limitations
✅ Pros
Easy setup with Supabase (managed backend + realtime).
Lightweight real-time collaboration for small teams.
Simple codebase — easy to reason about Redux state and sync.

⚠️ Limitations
Area	                    Limitation
Presence        	   Uses anonymous crypto.randomUUID() unless real auth is implemented.
Data Persistence	   Task reordering is not persisted in the database (unless explicitly saved).
Offline Mode	       No offline-first support or conflict resolution.
Scalability	         Supabase Realtime may not scale well with hundreds of concurrent users.
Security	           No auth/RLS by default — meant for demo/dev usage.


🛠️ Future Improvements
✅ Real Supabase Auth for unique user identification
📦 Persist column and task position updates
🧠 Conflict resolution strategies
🌐 Multi-board support


## 📦 Installation

git clone https://github.com/REDDIRANI1/Real-Time-Collaborative-Task-Board
cd collab-task-board
npm install
npm run dev