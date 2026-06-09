# TaskFlow

Full-stack Todo application with categories, a five-task category limit, and
five-second Undo notifications.

## Projects

The repository contains two independent npm projects:

```text
frontend/   Next.js application
backend/    Express API with SQLite
```

Each directory has its own:

- `package.json` and `package-lock.json`
- dependencies and npm scripts
- ESLint and Prettier configuration
- `.env.example` and `.gitignore`

There are no npm workspaces or shared runtime dependencies.

## Local development

Start the backend:

```bash
cd backend
npm ci
copy .env.example .env
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm ci
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs at
[http://localhost:4000](http://localhost:4000).

## Quality commands

Run commands from the corresponding project directory:

```bash
npm run format
npm run format:check
npm run lint
npm run lint:fix
npm run build
```

The backend additionally provides:

```bash
npm test
```

ESLint reports unused variables and removes unused imports with
`npm run lint:fix`. Prettier formats both projects independently.

## Architecture

Frontend responsibilities are separated into:

- `services/` for Axios API access
- `hooks/` for application state and Undo workflows
- `components/` for presentation
- `types/` for API models

Backend responsibilities are separated into:

- `domain/` for entities, errors, and the repository contract
- `application/` for validation and business use cases
- `infrastructure/` for SQLite persistence
- `http/` for Express routes and error mapping

The application layer depends on the `TodoRepository` interface instead of the
SQLite implementation.

## API

| Method   | Endpoint               | Description                         |
| -------- | ---------------------- | ----------------------------------- |
| `GET`    | `/categories`          | List categories                     |
| `GET`    | `/todos?category=work` | List and optionally filter tasks    |
| `POST`   | `/todos`               | Create a task                        |
| `PATCH`  | `/todos/:id`           | Update the completed status          |
| `DELETE` | `/todos/:id`           | Delete a task                        |

Creating a sixth task in one category returns `400 Bad Request`.

## Deployment

The recommended deployment uses Railway for the backend and Vercel for the
frontend.

### Backend on Railway

Create a Railway service from this GitHub repository:

1. Set the service **Root Directory** to `backend`.
2. Set the Build Command to `npm run build`.
3. Set the Start Command to `npm run start`.
4. Generate a public Railway domain for the service.
5. Set `FRONTEND_URL` to the deployed frontend URL.

Do not set `PORT` manually. Railway provides it at runtime and the backend reads
it from the environment.

Locally, SQLite is stored at `backend/data/todos.db`. On Railway, use a
persistent volume or an external database if data must survive redeploys and
service restarts.

### Frontend on Vercel

Create a Vercel project from this GitHub repository:

1. Set **Root Directory** to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` to the Railway backend URL.
3. Deploy it as a Next.js project.
4. Update Railway `FRONTEND_URL` with the final Vercel frontend URL and redeploy
   the backend.

Example:

```env
# frontend
NEXT_PUBLIC_API_URL=https://taskflow-api.up.railway.app

# backend
FRONTEND_URL=https://taskflow-web.vercel.app
```
