# Prodex Integrated Productivity Management System (Frontend)

Prodex is a frontend application built with Next.js for managing:
- tasks (kanban style)
- weekly workload and capacity
- career goals, applications, and skills
- user settings

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Vitest + Testing Library

## Project Structure

- `app/` - routes and page-level UI
- `components/` - reusable UI and feature components
- `lib/` - shared utilities, types, sample data
- `hooks/` - custom React hooks
- `styles/` - global styles
- `test/` - test setup

## Prerequisites

- Node.js 18+ (recommended)
- npm (or pnpm)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open:

`http://localhost:3000`

## Available Scripts

- `npm run dev` - run dev server
- `npm run build` - build for production
- `npm run start` - start production server
- `npm run lint` - run lint checks
- `npm run test` - run frontend tests once
- `npm run test:watch` - run tests in watch mode

## Testing

Run all frontend tests:

```bash
npm run test
```

Current coverage includes:
- auth provider behavior
- data provider behavior
- utility function tests

## Notes

- Current auth is frontend-only (localStorage token based).
- App data is initialized from sample data in `lib/sample-data.ts`.
