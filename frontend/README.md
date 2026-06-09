# TaskFlow Frontend

Independent Next.js frontend project.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Deploy this project to Vercel with `frontend` as the Root Directory.

Set `NEXT_PUBLIC_API_URL` to the deployed Railway backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

Quality checks:

```bash
npm run format:check
npm run lint
npm run build
```
