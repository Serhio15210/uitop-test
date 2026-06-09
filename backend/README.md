# TaskFlow Backend

Independent Express and SQLite API project.

```bash
npm ci
copy .env.example .env
npm run dev
```

Locally, SQLite is stored at `data/todos.db`.

For Railway, create a service from the repository with `backend` as its Root
Directory.

Railway settings:

```text
Build Command: npm run build
Start Command: npm run start
```

Environment variables:

```env
FRONTEND_URL=https://your-frontend.vercel.app
```

Do not set `PORT` manually. Railway provides it at runtime. For persistent
SQLite data, attach a Railway Volume or replace SQLite with an external
database.

Quality checks:

```bash
npm run format:check
npm run lint
npm test
npm run build
```
