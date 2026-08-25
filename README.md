# KISAL

A retro-futuristic Kanban board PWA with a Swiss-brutalist cyberpunk aesthetic. Built with React, TypeScript, and Supabase, with cross-app task export to the DANNA planner.

## Features

- **Kanban board** — five columns (Backlog, Started, In Progress, Done, Persistent) with native HTML5 drag-and-drop
- **Multiple sheets** — organize work into separate boards with tabbed navigation
- **Global tag system** — create shared tags from the filter bar, tag cards, and filter the board by any combination of tags
- **Card details** — title, notes, tags, and metadata in a slide-out panel
- **DANNA export** — send any card to the DANNA planner's inbox with one click
- **Cloud sync** — all data stored per-user in Supabase; log in from anywhere
- **Auth** — email/password sign-up, login, and password reset
- **Two themes** — dark (navy/orange) and light, toggled from the header
- **PWA** — installable with offline fallback via service worker

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + TypeScript + Vite |
| Routing | React Router 7 |
| Auth & Database | Supabase (Postgres + RLS) |
| State | React Context + `useReducer` |
| Styling | Plain CSS with custom properties |
| Drag & Drop | Native HTML5 DnD API |

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### 3. Create the database tables

Run this in the Supabase SQL Editor:

```sql
CREATE TABLE sheets (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) NOT NULL,
  title       text NOT NULL,
  description text,
  source      text,
  source_app  text,
  source_id   text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE kisal_cards (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) NOT NULL,
  sheet_id      uuid REFERENCES sheets(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL,
  notes         text,
  tags          text[],
  column_id     text NOT NULL,
  card_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  danna_item_id uuid
);

ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kisal_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sheets" ON sheets
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cards" ON kisal_cards
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 4. Run

```bash
npm run dev
```

Build for production with `npm run build`.

## DANNA Integration

KISAL shares a Supabase project with the DANNA planner app. Exporting a card inserts a task into DANNA's `items` table with `source: 'kisal'` and `inbox: true`, then stores the returned item id on the card so it shows a "Sent to DANNA" badge.

## Project Structure

```
src/
├── components/       # Board, columns, cards, tabs, tag system, modals
│   └── auth/         # Login, signup, password reset
├── danna/            # DANNA export service
├── styles/           # Design tokens (variables.css) + global styles
├── store.tsx         # App-wide state (Context + useReducer)
├── supabase.ts       # Supabase client
└── types.ts          # Shared TypeScript types
```
