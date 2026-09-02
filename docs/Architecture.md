# QA Book Architecture

## Overview

QA Book follows a modern three-tier architecture consisting of:

- React Frontend
- FastAPI Backend
- PostgreSQL Database

The frontend communicates with the backend through REST APIs, while the backend manages business logic and persists data in PostgreSQL.

---

# System Architecture

```text
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
````

---

# Frontend

## Technology Stack

* React
* TypeScript
* Vite
* Material UI
* Axios
* React Router

## Responsibilities

* User Interface
* API Communication
* Form Validation
* Navigation
* Dashboard
* Report Visualization

---

# Backend

## Technology Stack

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

## Responsibilities

* REST API
* Business Logic
* Data Validation
* Database Operations
* Report Generation

---

# Automation Framework

QA Book is designed to integrate with external test automation frameworks.

The automation layer is separate from the QA management application and is responsible for executing automated tests.

## Technology Stack

* Python
* pytest
* Playwright

## Responsibilities

* Automated Test Execution
* Page Object Model
* Test Fixtures
* Test Data Management
* Environment Configuration
* Test Case Mapping
* Execution Result Reporting

The automation framework uses the QABook Test Case as the primary business reference.

Test Cases are project-specific, therefore automation mapping uses:

```text
Project Code + Test Case Code
```

Example:

```text
PRJ-001 + TC001
```

The same Test Case code can exist in different projects because Test Case numbering is project-specific.

---

# Database

## Database

* PostgreSQL (Neon)

## ORM

* SQLAlchemy

## Migration Tool

* Alembic

---

# Deployment

## Frontend

* Vercel

## Backend

* Render

## Database

* Neon PostgreSQL

---

# Communication Flow

## Manual Testing

```text
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

## Automation Testing

```text
QABook
↓
Test Case / Test Suite / Test Run
↓
Automation Framework
↓
pytest
↓
Playwright
↓
Test Result
↓
QABook REST API
↓
Test Execution
```

## Overall Architecture

```text
                         QABook
                  QA Management Platform
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Requirements      Test Cases      Test Suites
                                           │
                                           ▼
                                       Test Run
                                           │
                                           ▼
                                  Automation Framework
                                           │
                                    pytest + Playwright
                                           │
                                           ▼
                                         Result
                                           │
                                           ▼
                                     QABook REST API
                                           │
                                           ▼
                                    Test Execution
```

---

# Automation Mapping

```text
Project
  ↓
Test Case
  ↓
Project Code + Test Case Code
  ↓
Automation Test
  ↓
Playwright
  ↓
Execution Result
```

Example:

```text
PRJ-001
  ↓
TC001
  ↓
@pytest.mark.project("PRJ-001")
@pytest.mark.tc("TC001")
  ↓
Playwright Test
  ↓
Passed / Failed
  ↓
QABook API
  ↓
Test Execution
```

---

# Current Architecture

The current version is a single-organization application.

Future versions will introduce:

* Authentication
* Organizations
* User Management
* Roles & Permissions
* AI Services
* Notifications

````

### `docs/Roadmap.md`

```markdown
# QA Book Roadmap

## Vision

QA Book aims to become a modern, AI-powered manual testing platform that helps QA teams manage the complete software testing lifecycle.

---

# Current Version

## Completed Features

### Project Management

- Projects
- Dashboard

### Requirements

- Requirement Management

### Test Design

- Test Scenarios
- Test Cases
- Test Suites

### Test Execution

- Test Runs
- Test Execution Tracking

### Defect Management

- Bug Tracking

### Reporting

- Dashboard
- Reports
- Excel Export
- PDF Export

### Platform

- FastAPI
- React
- PostgreSQL
- Neon
- Render
- Vercel

---

# Current Phase

## Phase 2A — Production Hardening

Completed

- Repository Cleanup
- Environment Examples
- Documentation
- Cloud Deployment

In Progress

- GitHub Actions
- Version 1.0 Release

---

# Upcoming Phase

## Phase 2B

### Authentication

- Login
- Logout
- Password Hashing
- JWT Authentication

### User Management

- Users
- Organizations
- Teams
- Roles
- Permissions

---

# Future Features

## Test Automation

- Automation Framework Foundation
- Python + pytest + Playwright
- Page Object Model
- Test Case to Automation Mapping
- Automated Test Execution
- Automation Result Integration
- Hybrid Manual + Automated Execution

## Collaboration

- Comments
- Notifications
- Activity Timeline
- Attachments

## Reporting

- Advanced Analytics
- Trend Reports
- Requirement Coverage

## AI Features

- AI Test Case Generation
- AI Test Scenario Generation
- AI Requirement Analysis
- Duplicate Test Detection
- AI Bug Summary
- Risk Analysis
- Smart Suggestions

---

# Long-Term Goals

- Enterprise Workspaces
- Multi-Organization Support
- Integrations
- Public API
- Plugin System
- AI Assistant
````
