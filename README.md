# To-Do Dashboard

A responsive Todo App built with Next.js, featuring drag-and-drop, infinite scroll, and real-time search.

## Features

- 4-column (Backlog, In Progress, Review, Done)
- Drag & drop tasks between columns
- Infinite scroll in each column
- Search tasks by title/description
- Add, edit, delete tasks

## Tech Stack

- Next.js 14, TypeScript, Material-UI
- Zustand (state management), React Query (data fetching)
- json-server (mock API), @hello-pangea/dnd (drag & drop)

## Setup

1. Clone repo: `git clone [your-repo]`
2. Install: `npm install`
3. Start json-server: `npm run server` (runs on :4000)
4. Start dev: `npm run dev` (runs on :3000)

## Deployment

- Frontend: Vercel/Netlify
- API: json-server (mock) or connect to real API
