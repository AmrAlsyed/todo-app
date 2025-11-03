# To-Do Dashboard

A responsive Todo App built with Next.js, featuring drag-and-drop, infinite scroll, and real-time search.

## Features

- 4-column board (Backlog, In Progress, Review, Done)
- Drag & drop tasks between columns
- Infinite scroll in each column
- Search tasks by title/description
- Add, edit, delete tasks
- **Bonus**: jQuery dynamic list with fade animations (`/public/bonus.html`)

## Tech Stack

- Next.js 14, TypeScript, Material-UI
- Zustand (state management), React Query (data fetching)
- json-server (mock API), @hello-pangea/dnd (drag & drop)

## Setup

1. Clone repo: `git clone https://github.com/AmrAlsyed/todo-app.git`
2. Install dependencies: `npm install`
3. Create `.env.local` file in the root directory with:NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
4. Start json-server: `npm run server` (runs on :4000)
5. Start development server: `npm run dev` (runs on :3000)

## Deployment

- Frontend: Vercel
- API: json-server (mock), cPanel (live)

## Live Demo

https://todo-app-peach-mu.vercel.app
