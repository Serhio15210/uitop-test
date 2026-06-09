# TaskFlow Backend

Independent Express and SQLite API project.

```bash
npm ci
copy .env.example .env
npm run dev
```

Locally, SQLite is stored at `data/todos.db`. On Vercel it is automatically
stored at `/tmp/taskflow.db`, which is temporary and can be reset.

For Vercel, create a project with `backend` as its Root Directory. Keep the
dashboard Build Command and Output Directory empty: Vercel detects
`src/index.ts` as the Express entrypoint and deploys it as a Function.

Quality checks:

```bash
npm run format:check
npm run lint
npm test
npm run build
```
