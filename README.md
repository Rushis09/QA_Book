![React](https://img.shields.io/badge/React-19-blue)

![FastAPI](https://img.shields.io/badge/FastAPI-Green)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Blue)

![License](https://img.shields.io/badge/License-MIT-yellow)
# QA Book

## Why QA Book?

Manual testing teams often manage requirements, test cases and defects across multiple spreadsheets and tools.

QA Book consolidates the entire manual testing lifecycle into a single platform, improving collaboration, traceability and reporting.


> AI-Powered Manual Testing Workspace for Modern QA Teams

QA Book is a modern web-based test management platform designed to simplify manual software testing. It enables QA engineers, testers, developers, and teams to manage the complete testing lifecycle from requirements to bug tracking through a single unified workspace.

The platform helps teams organize projects, create requirements, design test scenarios, write detailed test cases, execute test runs, track bugs, generate reports, and maintain complete testing traceability.

---

## Highlights

✔ Full Stack Application

✔ REST API

✔ Swagger Documentation

✔ Cloud Deployment

✔ PostgreSQL

✔ Responsive UI

✔ Manual Testing Workflow

✔ Modern Architecture

## Workflow 

Requirements
      ↓
Test Scenarios
      ↓
Test Cases
      ↓
Test Runs
      ↓
Execution
      ↓
Bug Tracking
      ↓
Reports

## Live Demo

**Frontend:** https://qa-book.vercel.app

**Backend API:** https://qabook-api.onrender.com

**API Documentation:**

https://qabook-api.onrender.com/docs

---

## Key Features

- Project Management
- Requirement Management
- Test Scenario Management
- Test Case Management
- Test Suite Management
- Test Run Management
- Test Execution Tracking
- Bug Tracking
- Dashboard & Analytics
- Excel Export
- PDF Export
- REST API
- PostgreSQL Database
- Cloud Deployment
- Responsive UI

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- Axios
- React Router

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic

### Database

- PostgreSQL (Neon)

### Deployment

- Vercel
- Render

### Version Control

- Git
- GitHub

---

# Project Architecture

```
QA Book
│
├── Frontend (React + TypeScript + Vite)
│       │
│       ▼
│   FastAPI REST API
│       │
│       ▼
│ PostgreSQL (Neon Database)
│
├── Frontend Deployment
│   └── Vercel
│
└── Backend Deployment
    └── Render
```

---

# Project Structure

```
QA_Book/
│
├── apps/
│   ├── api/        # FastAPI Backend
│   └── web/        # React Frontend
│
├── docs/           # Project Documentation
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/Rushis09/QA_Book.git

cd QA_Book
```

---

## Backend Setup

```bash
cd apps/api

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=YOUR_DATABASE_URL
```

Run the backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

Swagger API

```
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd apps/web

npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```
---

# Deployment

## Production

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

---

# API Documentation

Interactive API documentation is available through FastAPI Swagger UI.

Development

```
http://localhost:8000/docs
```

Production

```
https://qabook-api.onrender.com/docs
```

---

# Roadmap

## Version 1.x

- Project Management
- Requirement Management
- Test Scenario Management
- Test Case Management
- Test Suite Management
- Test Runs
- Test Execution
- Bug Tracking
- Reports
- Dashboard
- Excel Export
- PDF Export

## Planned Features

- Authentication
- User Management
- Organizations
- Role-Based Access Control
- Notifications
- Audit Logs
- AI Test Case Generation
- AI Requirement Analysis
- AI Bug Summaries
- AI Risk Analysis

---

# Contributing

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## My Contribution

Designed the product.

Defined requirements.

Designed the database.

Developed frontend and backend using AI-assisted development.

Validated features through Functional Testing, UI Testing and workflow verification.

Deployed the application to Vercel and Render.

# Author

**Rushikesh**

GitHub:

https://github.com/Rushis09

---

# License

This project is licensed under the MIT License.

See the LICENSE file for details.
