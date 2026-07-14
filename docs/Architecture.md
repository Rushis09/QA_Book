# QA Book Architecture

## Overview

QA Book follows a modern three-tier architecture consisting of:

- React Frontend
- FastAPI Backend
- PostgreSQL Database

The frontend communicates with the backend through REST APIs, while the backend manages business logic and persists data in PostgreSQL.

---

# System Architecture

```
                User
                 │
                 ▼
     React + TypeScript (Vite)
                 │
          REST API (Axios)
                 │
                 ▼
        FastAPI Application
                 │
        SQLAlchemy ORM
                 │
                 ▼
      PostgreSQL (Neon Database)
```

---

# Frontend

Technology Stack

- React
- TypeScript
- Vite
- Material UI
- Axios
- React Router

Responsibilities

- User Interface
- API Communication
- Form Validation
- Navigation
- Dashboard
- Report Visualization

---

# Backend

Technology Stack

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic

Responsibilities

- REST API
- Business Logic
- Data Validation
- Database Operations
- Report Generation

---

# Database

Database

- PostgreSQL (Neon)

ORM

- SQLAlchemy

Migration Tool

- Alembic

---

# Deployment

Frontend

- Vercel

Backend

- Render

Database

- Neon PostgreSQL

---

# Communication Flow

```
Browser

↓

React

↓

Axios

↓

FastAPI

↓

SQLAlchemy

↓

PostgreSQL
```

---

# Current Architecture

The current version is a single-organization application.

Future versions will introduce:

- Authentication
- Organizations
- User Management
- Roles & Permissions
- AI Services
- Notifications