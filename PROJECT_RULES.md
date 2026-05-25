# Cafe Shift — Project Rules

## Project Goal

Cafe Shift is a LINE-first SaaS MVP for Japanese cafes and restaurants.

The product helps cafe managers and workers manage:

- employee shifts
- shift calendar
- shift requests
- worker availability
- recipes
- notifications through LINE
- mobile-first daily operations

The first demo client is a real cafe in Japan.

## Product Name

Cafe Shift

## Target Market

Small cafes and restaurants in Japan.

The product must feel simple, friendly, mobile-first, and familiar for Japanese small business users.

## Main Users

### Worker

A worker should be able to:

- open the app from LINE
- see the monthly shift calendar
- see who works on a selected day
- see their own shifts
- send shift requests for the next month
- read recipes

### Manager / Admin

A manager should be able to:

- see the full shift calendar
- add and edit employees
- edit shifts by month
- edit shifts by day
- edit shifts by employee
- review worker shift requests
- approve or adjust shift requests
- add and edit recipes
- use the app on both smartphone and PC

## Fixed Shift Types

The MVP uses fixed shifts:

| Code | Japanese Label | Time |
| --- | --- | --- |
| shift_1 | 1シフト | 08:30–13:00 |
| shift_2 | 2シフト | 13:00–17:30 |
| full_day | 通しシフト | 08:30–17:30 |
| off | 休み | — |
| vacation | 休暇 | — |

## Recipe Requirements

Recipes should support:

- photo
- recipe title
- ingredients
- step-by-step instructions
- detailed preparation notes

Example: matcha latte should include milk amount, syrup amount, ice, matcha solution, hot water, cold water, mixing steps, and final serving instructions.

## Language Strategy

Japanese is the default and main UI language.

English and Russian can be added later only if they do not make the MVP more complex.

Do not overengineer multilingual support in the first MVP.

## Tech Stack

Frontend:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui later if useful

Backend:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Row Level Security later

Hosting:

- Vercel

LINE:

- LIFF
- LINE Messaging API
- LINE Rich Menu

## Development Rules

- Keep the old salon LINE Mini App project untouched.
- This cafe project is a separate project.
- Do not copy salon booking logic.
- Do not copy customer reminder logic.
- Do not build payroll in MVP.
- Do not build complex labor-law calculations in MVP.
- Do not add Docker unless needed later.
- Do not add Supabase CLI while the Mac has limited free space.
- Do not introduce Redux, Prisma, NestJS, or microservices unless explicitly approved.
- Prefer simple and maintainable code.

## Architecture Rules

- Mobile-first.
- Japanese-first.
- LINE-first.
- Keep worker screens simple.
- Manager screens can be more detailed but must still work on smartphone.
- Use cafe_id for all business data.
- Design database for multi-tenant SaaS from the beginning.
- First build demo mode quickly.
- Harden security after the core demo works.

## Planned Database Tables

Core tables:

- cafes
- cafe_members
- employees
- shift_types
- shifts
- shift_requests
- recipe_categories
- recipes
- activity_events

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

## Testing Rule

After every meaningful change:

1. Run the app.
2. Check the browser.
3. Check mobile width.
4. Run Git status.
5. Commit only working changes.

## Git Rule

Make small commits.

Good commit examples:

- Initial Next.js setup
- Add project rules
- Add mobile app shell
- Add worker dashboard mock
- Add manager dashboard mock
- Add shift calendar mock

Never commit broken code knowingly.