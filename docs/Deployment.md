# QA Book Deployment

## Overview

QA Book is deployed using a modern cloud architecture.

- Frontend → Vercel
- Backend → Render
- Database → Neon PostgreSQL
- Source Control → GitHub

---

# Production Architecture

```
GitHub
   │
   ├────────────► Vercel
   │                 │
   │                 ▼
   │            React Frontend
   │
   └────────────► Render
                     │
                     ▼
               FastAPI Backend
                     │
                     ▼
             Neon PostgreSQL
```

---

# Frontend

Platform

- Vercel

Framework

- React
- Vite

Environment Variable

```env
VITE_API_BASE_URL=https://qabook-api.onrender.com
```

---

# Backend

Platform

- Render

Framework

- FastAPI

Environment Variable

```env
DATABASE_URL=<PostgreSQL Connection String>
```

---

# Database

Provider

- Neon

Database

- PostgreSQL

Migration Tool

- Alembic

---

# Deployment Workflow

```
Developer

↓

Git Commit

↓

Git Push

↓

GitHub

↓

Automatic Deployment

↓

Production
```

---

# Automatic Deployments

Every push to the main branch automatically triggers:

- Frontend deployment on Vercel
- Backend deployment on Render

No manual deployment is required.

---

# Local Development

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

# Production URLs

Frontend

```
https://qa-book.vercel.app
```

Backend

```
https://qabook-api.onrender.com
```

Swagger

```
https://qabook-api.onrender.com/docs
```