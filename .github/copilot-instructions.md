# Copilot Instructions for Cafe Shift

## Language

Always answer the project owner in Russian.

Explain simply and step by step.

The project owner is not a senior developer.

Before changing code, always explain:
1. what files will be changed
2. why they will be changed
3. possible risks

After changing code, always explain:
1. what changed
2. how to test
3. what to commit

## Project Context

This project is Cafe Shift: a LINE-first SaaS MVP for Japanese cafes and restaurants.

The first demo client is a real cafe in Japan.

The app helps cafe workers and managers manage:
- shift calendar
- worker shift requests
- employee management
- recipes with photos and detailed steps
- LINE-first mobile workflow
- future notifications through LINE

## Tech Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- App Router

Backend later:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime

Hosting later:
- Vercel

LINE later:
- LIFF
- LINE Messaging API
- LINE Rich Menu

## Important Rules

- Do not connect Supabase until requested.
- Do not add LINE integration until requested.
- Do not add authentication until requested.
- Do not install new packages unless necessary.
- Do not add Redux, Prisma, NestJS, Docker, or microservices.
- Do not change package.json unless the task explicitly requires it.
- Do not remove existing working functionality.
- Keep UI mobile-first.
- Japanese UI is the default.
- English and Russian may be added later, but do not overengineer i18n now.

## Fixed Shift Types

Use these fixed shift types in MVP:

- 1シフト: 08:30–13:00
- 2シフト: 13:00–17:30
- 通しシフト: 08:30–17:30
- 休み
- 休暇

## UI Principles

- Japanese-first
- mobile-first
- simple and friendly for Japanese small cafes
- large tap targets
- clean cards
- easy navigation
- manager screens should work on both smartphone and PC

## File Organization

Use this structure:

src/app/
  page.tsx
  worker/page.tsx
  manager/page.tsx
  shifts/page.tsx
  recipes/page.tsx

src/components/
  app-shell.tsx
  mobile-nav.tsx

src/lib/
src/types/

## MVP Development Order

1. Project setup
2. UI shell
3. Basic mobile navigation
4. Worker dashboard
5. Manager dashboard
6. Shift calendar mock
7. Recipe mock
8. Supabase schema
9. Demo data
10. Worker shift calendar
11. Manager shift editor
12. Shift requests
13. Recipe list and editor
14. LIFF integration
15. LINE notifications
16. Production security
17. Vercel deploy

## Never Do

- Do not modify any old salon project.
- Do not copy salon booking logic.
- Do not copy customer reminder logic.
- Do not build payroll in MVP.
- Do not build complex labor-law calculations in MVP.
- Do not add Docker while the Mac has limited free space.