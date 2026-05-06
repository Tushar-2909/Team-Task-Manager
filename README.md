# Team Task Manager

A production-ready full-stack task manager with Django REST Framework, JWT auth, SQLite, React, Vite, Tailwind CSS, ShadCN-style UI primitives, Zustand, Axios, Recharts, and drag-and-drop task movement.

## 1. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The backend uses SQLite by default at `backend/db.sqlite3` when `DATABASE_URL` is not set. On Render, it uses `/tmp/db.sqlite3` for the demo deployment when `DATABASE_URL` is absent.

Run the API:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend apps:

- `accounts`: custom `User` model with `ADMIN` and `MEMBER` roles, register/login serializers, JWT token issuing.
- `projects`: `Project` and `Membership`, creator becomes Admin, owner-admin project management, member visibility.
- `tasks`: task CRUD, priority, assignment validation, status workflow, dashboard stats.

Main endpoints:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/users/`
- `GET|POST /api/projects/`
- `GET|PATCH|DELETE /api/projects/:id/`
- `POST /api/projects/:id/members/`
- `DELETE /api/projects/:id/members/:user_id/`
- `GET|POST /api/tasks/`
- `GET|PATCH|DELETE /api/tasks/:id/`
- `GET /api/tasks/dashboard/`

## 2. Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set the API URL in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Frontend structure:

- `src/components`: reusable UI and route guard components.
- `src/components/ui`: ShadCN-style Tailwind primitives.
- `src/layouts`: authenticated sidebar layout.
- `src/pages`: login, signup, dashboard, projects, task board, profile.
- `src/services`: Axios API clients and JWT refresh interceptor.
- `src/store`: Zustand auth state.
- `src/hooks`: shared async loading helper.

## 3. Integration Flow

1. Register or login.
2. Create a project. The creator is promoted to `ADMIN`.
3. Register member accounts.
4. Add/remove members from the Projects page or with `POST /api/projects/:id/members/`.
5. Create tasks with title, description, due date, priority, project, and assignee.
6. Drag assigned tasks between `Todo`, `In Progress`, and `Done`.
7. Dashboard stats update from `GET /api/tasks/dashboard/`, including total tasks, tasks by status, tasks per user, and overdue tasks.

Tokens are stored in local storage for this assessment build, with automatic access-token refresh via Axios. For a hardened production deployment, move refresh tokens to secure, HTTP-only cookies.

## 4. Deployment

### Backend on Render

1. Push this repository to GitHub.
2. Create a new Web Service from the same GitHub repository.
3. Set the root directory to `backend`.
4. Use these commands:

```bash
Build Command: bash build.sh
Start Command: python manage.py migrate --noinput && gunicorn config.wsgi:application
```

5. Add environment variables:

```env
SECRET_KEY=strong-production-secret
DEBUG=False
```

The repository also includes `render.yaml` for Render Blueprint deployments.

Render notes:

- Leave `DATABASE_URL` unset to use SQLite. On Render, the app stores the demo database at `/tmp/db.sqlite3`.
- Render `.onrender.com` hosts are allowed automatically by the Django settings.
- CORS is open automatically on Render for this demo deployment. For a stricter deployment, set `CORS_ALLOW_ALL_ORIGINS=False` and `CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app`.
- Render provides a `PORT` automatically. Gunicorn binds correctly on Render with the default Python runtime settings.
- `backend/build.sh` installs dependencies, collects static files, and runs migrations.
- Important: SQLite on Render is not durable across redeploys/restarts. For a demo assignment it can work, but for real production data use PostgreSQL or attach persistent disk storage.

### Frontend on Netlify

1. Go to Netlify and import the same GitHub repository.
2. Set base directory to `frontend`.
3. Build command:

```bash
npm run build
```

4. Publish directory:

```text
frontend/dist
```

If Netlify asks for publish directory relative to the base directory, use:

```text
dist
```

5. Add environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

6. After Netlify deploys, copy the Netlify URL and update Render:

```env
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
```

`frontend/netlify.toml` includes SPA redirects for React Router.

## 5. Production Notes

- SQLite is used by default when `DATABASE_URL` is unset.
- CORS is environment-driven with `django-cors-headers`.
- JWT authentication uses `djangorestframework-simplejwt`.
- Creating a project promotes the creator to Admin.
- Admin-only write actions are enforced for project and user management.
- Admins can manage tasks inside their projects.
- Members can view and update assigned tasks only.
- Task assignment validates that the assignee belongs to the task project.
- Dashboard includes total, completed, overdue, tasks by status, tasks per user, and due-soon tasks.

## 6. Submission Checklist

- Live Render backend URL
- Live Netlify frontend URL
- GitHub repository URL
- README with setup and deployment steps
- 2-5 minute demo video explaining auth, projects, tasks, dashboard, roles, and deployment

## 7. Useful Commands

Backend:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```
