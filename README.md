# QA Book

![React](https://img.shields.io/badge/React-19-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

> AI-Powered Manual Testing Workspace for Modern QA Teams

QA Book is a modern web-based Quality Assurance Management Platform designed to simplify and centralize the manual software testing lifecycle.

It provides a single workspace for managing projects, requirements, test scenarios, test cases, test suites, test runs, executions, defects, documents, and reports. The platform also includes AI-assisted QA artifact generation and maintains traceability across the testing lifecycle.

---

## Why QA Book?

Manual testing teams often manage requirements, test cases, execution results, and defects across spreadsheets and multiple tools.

QA Book brings these activities together in one platform to improve:

- Test organization
- Requirement-to-test traceability
- Execution tracking
- Defect management
- QA documentation
- Reporting
- Manual testing productivity

---

## Highlights

- Full-stack web application
- REST API
- FastAPI Swagger documentation
- PostgreSQL database
- Cloud deployment
- AI-assisted QA artifact generation
- BRD document upload and storage
- Manual testing workflow
- Project-based QA workspace
- Responsive UI
- GitHub Actions CI

---

# QA Testing Workflow

QA Book supports the complete testing flow:

```text
Requirements
     ↓
Test Scenarios
     ↓
Test Cases
     ↓
Test Suites
     ↓
Test Runs
     ↓
Test Execution
     ↓
Bug Tracking
     ↓
Reports
```

The platform maintains traceability between requirements, scenarios, test cases, executions, and defects.

---

# Key Features

### Project Management

- Create and manage projects
- Project status and version tracking
- Start and end dates
- Project-based QA workspace

### Requirement Management

- Create and manage requirements
- Requirement numbering
- Requirement-to-test traceability
- AI-assisted requirement generation
- BRD-based requirement generation

### Test Scenario Management

- Create and manage test scenarios
- Link scenarios to requirements
- Filter scenarios by requirement
- Read-only scenario viewing where required

### Test Case Management

- Create and manage detailed test cases
- Link test cases to requirements and scenarios
- Test case numbering
- Requirement context
- Project-based filtering

### Test Suite Management

- Create and manage test suites
- Assign test cases to suites
- Project-based test suite management

### Test Run & Execution

- Create test runs
- Execute assigned test cases
- Track execution status
- Record execution results

### Bug Management

- Record and manage defects
- Track bug status and details
- Maintain defect traceability with testing activities

### BRD Document Management

- Upload BRD documents to projects
- Supported formats: DOCX and PDF
- Store documents in object storage
- View project documents
- Download documents
- Delete documents
- Use uploaded BRD content for AI-assisted requirement generation

### AI-Assisted QA

- AI-assisted requirement generation
- AI-generated QA artifacts
- BRD-based requirement analysis and generation

### Reporting & Export

- Dashboard and analytics
- Excel export
- PDF export
- Project-level exports
- Requirements export
- Test scenario export
- Test case export
- Test suite export
- Test run export
- Bug report export

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Material UI
- Axios
- React Router

## Backend

- FastAPI
- Python
- SQLAlchemy
- Alembic
- Pydantic
- Boto3

## Database & Storage

- PostgreSQL
- Neon PostgreSQL
- Neon Object Storage / S3-compatible object storage

## AI

- Google Gemini API

## Deployment

- Vercel
- Render
- Neon

## Version Control & CI

- Git
- GitHub
- GitHub Actions

---

# Project Architecture

```text
                         QA Book
                            │
             ┌──────────────┴──────────────┐
             │                             │
       React Frontend                FastAPI Backend
       TypeScript + Vite                    │
       Material UI                           │
             │                              │
             └──────────────┬───────────────┘
                            │
                         REST API
                            │
             ┌──────────────┴──────────────┐
             │                             │
      PostgreSQL Database          Object Storage
          Neon PostgreSQL          BRD Documents
             │
             │
       AI / Gemini API
```

---

# Project Structure

```text
QA_Book/
│
├── apps/
│   ├── api/                         # FastAPI Backend
│   │   ├── app/
│   │   │   ├── ai/                 # AI services and prompts
│   │   │   ├── api/                # API routes
│   │   │   ├── models/             # SQLAlchemy models
│   │   │   ├── repositories/       # Data access layer
│   │   │   ├── schemas/            # Pydantic schemas
│   │   │   └── services/           # Business logic
│   │   └── alembic/                # Database migrations
│   │
│   └── web/                         # React Frontend
│       └── src/
│           ├── components/
│           ├── contexts/
│           ├── pages/
│           ├── services/
│           └── types/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI
│
├── docs/                            # Project documentation
├── docker/                          # Docker-related files
├── scripts/                         # Utility scripts
├── .gitignore
├── LICENSE
└── README.md
```

---

# Feature Development Workflow

When developing a new feature in QA Book, the general development flow is:

```text
Understand Requirement
        ↓
Break Feature into Backend + Frontend Work
        ↓
Backend Development
        ↓
Database / Migration
        ↓
API / Service / Repository
        ↓
Test Backend
        ↓
Frontend Development
        ↓
Connect Frontend to API
        ↓
End-to-End Feature Testing
        ↓
Fix Integration / Validation Issues
        ↓
Local Build / Validation
        ↓
Review Git Diff
        ↓
Git Add
        ↓
Git Commit
        ↓
Git Push
        ↓
GitHub Actions CI
        ↓
Backend + Frontend Checks
        ↓
CI Pass
```

### Backend-first approach

For most new features, development starts with the backend so that the required database structure, business logic, and API contract are established first.

Typical backend work includes:

1. Database model
2. Alembic migration
3. Pydantic schema
4. Repository
5. Service/business logic
6. API endpoint

The backend is then verified before the frontend is connected.

### Frontend development

After the backend contract is available, the frontend is implemented using React and TypeScript.

Typical frontend work includes:

- Pages
- Forms
- Dialogs
- Tables
- Validation
- Loading states
- Error handling
- Notifications
- API service integration

### Integration

The frontend communicates with the FastAPI backend through the API/service layer.

```text
React Component
      ↓
Frontend Service
      ↓
Axios
      ↓
FastAPI API
      ↓
Service
      ↓
Repository
      ↓
Database / Object Storage
```

The complete user workflow is then tested through the application.

---

# Git Workflow

The project uses Git and GitHub for version control.

Typical feature completion flow:

```bash
git status
git diff
git add <files>
git commit -m "Describe the change"
git push origin main
```

Before committing, changes are reviewed to make sure that:

- Only intended files are included
- Secrets are not committed
- Generated files are not accidentally tracked
- The feature changes are complete

---

# Continuous Integration

QA Book uses **GitHub Actions** for Continuous Integration (CI).

The workflow runs automatically when code is pushed to `main` or when a pull request targets `main`.

Current CI pipeline:

```text
Git Push / Pull Request
          ↓
   GitHub Actions
          ↓
    ┌─────┴─────┐
    │           │
 Backend     Frontend
    │           │
Install      npm ci
Dependencies    │
    │        npm run build
Import App      │
    │           │
    └─────┬─────┘
          ↓
       CI PASS
```

### Backend CI

The backend job:

- Runs on Ubuntu
- Sets up Python 3.13
- Installs backend dependencies
- Uses a CI test database configuration
- Uses a CI-only dummy Gemini API key
- Verifies that the FastAPI application imports successfully

### Frontend CI

The frontend job:

- Runs on Ubuntu
- Sets up Node.js
- Uses npm dependency caching
- Runs `npm ci`
- Runs the production build using `npm run build`

### Current CI scope

CI currently validates backend application initialization and frontend production build.

ESLint is not currently a CI gate because the project still contains existing lint issues that are planned to be addressed separately.

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
```

### Windows

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file with the required configuration.

Example:

```env
DATABASE_URL=YOUR_DATABASE_URL
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

AWS_ENDPOINT_URL_S3=YOUR_S3_ENDPOINT
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=YOUR_REGION
AWS_S3_BUCKET=YOUR_BUCKET
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd apps/web

npm ci
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

---

# Deployment

## Production

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Object Storage | Neon Object Storage |

Live application:

```text
https://qa-book.vercel.app
```

Backend API:

```text
https://qabook-api.onrender.com
```

API documentation:

```text
https://qabook-api.onrender.com/docs
```

---

# Development and Quality Practices

The project follows a layered full-stack architecture:

```text
Frontend
   ↓
API Service Layer
   ↓
FastAPI Routes
   ↓
Business Service Layer
   ↓
Repository Layer
   ↓
Database / Storage
```

Development focuses on:

- Separation of concerns
- Reusable frontend components
- Service/repository architecture
- Database migrations with Alembic
- API validation with Pydantic
- Error handling
- Functional testing
- UI and workflow verification
- Git-based version control
- Automated CI validation

---

# Roadmap

## Current Platform

- Project Management
- Requirement Management
- Test Scenario Management
- Test Case Management
- Test Suite Management
- Test Runs
- Test Execution
- Bug Tracking
- Dashboard & Analytics
- Excel Export
- PDF Export
- Production and Demo environments
- AI-assisted requirement generation
- BRD document management
- Object storage integration
- GitHub Actions CI

## Planned Improvements

- Automated backend test suite
- Stronger frontend linting and CI quality gates
- Expanded AI-assisted test case generation
- AI bug summaries
- AI risk analysis
- Authentication
- Role-based access
- Additional reporting capabilities
- Continuous Deployment automation

---

# Contributing

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Develop and test the feature.
4. Review your changes with Git.
5. Commit the changes.
6. Open a Pull Request.

---

# My Contribution

- Designed the overall QA Book product concept and workflow.
- Defined the functional requirements and QA lifecycle.
- Designed and implemented the database structure.
- Developed the frontend using React, TypeScript, Vite, and Material UI.
- Developed the backend using FastAPI, SQLAlchemy, Pydantic, and Alembic.
- Implemented REST APIs and service/repository architecture.
- Implemented project, requirement, scenario, test case, test suite, test run, execution, and bug management workflows.
- Implemented AI-assisted requirement generation.
- Implemented BRD document upload, extraction, storage, download, and deletion.
- Integrated PostgreSQL and object storage.
- Validated features through functional testing, UI testing, integration testing, and workflow verification.
- Deployed the application using Vercel, Render, and Neon.
- Implemented GitHub Actions CI for backend and frontend validation.
- Used AI-assisted development while reviewing, testing, and validating the resulting implementation.

---

# Author

**Rushikesh**

GitHub:

https://github.com/Rushis09/QA_Book

---

# License

This project is licensed under the MIT License.

See the `LICENSE` file for details.
