# QA Book — Architecture

## 1. Overview

QA Book is a full-stack AI-powered Quality Assurance Management Platform designed to manage the software testing lifecycle in a centralized workspace.

The platform combines:

* Project management
* Requirements
* Test scenarios
* Test cases
* Test suites
* Test runs
* Test executions
* Bug management
* Retesting
* Testing Studio
* AI-assisted QA workflows
* Automation projects
* GitHub integration
* GitHub Actions
* Reporting and analytics
* Document management
* Platform administration

The system is divided into a React frontend, FastAPI backend, PostgreSQL database, object storage, AI services, and external GitHub/CI integrations.

---

# 2. High-Level Architecture

```text
                         QA Book Platform
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
          React Frontend                 FastAPI Backend
          TypeScript + Vite                    │
          Material UI                          │
                 │                             │
                 └──────────────┬──────────────┘
                                │
                           REST API
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
   PostgreSQL              Object Storage            AI Services
        │                       │                        │
   Neon PostgreSQL       Documents / Evidence       Gemini API
                                │
                                │
                           GitHub / CI
                                │
                         GitHub Actions
                                │
                      Playwright + pytest
```

---

# 3. Frontend Architecture

The frontend is implemented using React and TypeScript.

Main technologies include:

* React
* TypeScript
* Vite
* Material UI
* Axios
* React Router

The frontend is organized around feature-specific pages, reusable components, services, contexts, and type definitions.

```text
React Application
       │
       ├── Pages
       ├── Components
       ├── Contexts
       ├── Services
       ├── Types
       └── Configuration
              │
              ↓
          Axios Client
              │
              ↓
         FastAPI REST API
```

Major frontend areas include:

* Authentication
* Dashboard
* Projects
* Requirements
* Test Scenarios
* Test Cases
* Test Suites
* Test Runs
* Test Executions
* Bugs
* Retests
* Testing Studio
* Automation
* Reports
* Documents
* Settings
* Administration

---

# 4. Backend Architecture

The backend is implemented using FastAPI and follows a layered architecture.

```text
FastAPI Routes
      ↓
Schemas / Validation
      ↓
Service Layer
      ↓
Repository Layer
      ↓
SQLAlchemy Models
      ↓
PostgreSQL
```

The backend contains feature-specific modules for:

* Authentication
* Administration
* Projects
* Requirements
* Test Scenarios
* Test Cases
* Test Suites
* Test Runs
* Test Executions
* Bugs
* Retesting
* Testing Studio
* Automation
* AI
* Documents
* Reporting
* GitHub integration

---

# 5. Database Architecture

QA Book uses PostgreSQL as its primary relational database.

The application uses:

* SQLAlchemy for ORM
* Alembic for database migrations
* PostgreSQL for persistent application data

The production database can be hosted using Neon PostgreSQL.

The database stores entities related to:

* Users
* Projects
* Requirements
* Test Scenarios
* Test Cases
* Test Suites
* Test Runs
* Test Executions
* Bugs
* Retests
* Automation Projects
* Testing Profiles
* AI Credentials
* GitHub Connections
* Documents and related metadata

---

# 6. Authentication Architecture

QA Book provides individual user authentication and protected application access.

Authentication functionality includes:

* Registration
* Login
* Current-user information
* Password change
* Forgot-password workflow
* Password reset
* Protected routes
* User status management

Authentication is handled through the backend authentication layer and protected API routes.

---

# 7. Administration Architecture

The platform includes an administration module for managing users and platform-level access.

Administration capabilities include:

* User management
* User creation
* User activation/deactivation
* Role management
* Password administration
* Administrative access controls

The frontend exposes administration functionality through administrator-only workflows.

---

# 8. QA Lifecycle Architecture

QA Book models the QA lifecycle as connected entities.

```text
Project
   ↓
Requirement
   ↓
Test Scenario
   ↓
Test Case
   ↓
Test Suite
   ↓
Test Run
   ↓
Test Execution
   ↓
Bug
   ↓
Retest
```

These relationships provide traceability between requirements, testing activities, execution results, defects, and retesting.

---

# 9. Testing Studio Architecture

Testing Studio provides structured support for multiple testing disciplines.

Supported testing types include:

* Functional
* API
* Database
* Automation
* Performance
* Security
* Accessibility

Testing Studio also supports different execution methods:

* Manual
* Automated
* External
* Imported

Testing-specific information is associated with the core test-case model through testing profiles.

This allows different testing disciplines to use the same overall QA lifecycle while maintaining discipline-specific metadata.

---

# 10. Testing Evidence

Testing Studio supports evidence associated with testing workflows.

Supported evidence formats include:

* PNG
* JPG
* JPEG
* WEBP
* PDF
* TXT
* LOG

Evidence files are stored through the application's object-storage layer.

---

# 11. AI Architecture

QA Book provides AI-assisted QA workflows.

AI capabilities include:

* Requirement generation
* Test scenario generation
* Test case generation
* BRD-based requirement generation
* AI-assisted QA artifact creation

The AI integration uses the Google Gemini API.

AI credentials are managed through the application's credential-management layer.

The platform includes encrypted credential handling rather than treating AI credentials as ordinary application data.

---

# 12. BRD Document Architecture

Project documents can be uploaded and stored using the document-management functionality.

Supported document types include:

* DOCX
* PDF

The workflow is:

```text
BRD Document
     ↓
Upload
     ↓
Object Storage
     ↓
Document Processing
     ↓
AI-Assisted Analysis
     ↓
Generated Requirements
```

---

# 13. Automation Architecture

QA Book provides project-based automation management.

The automation workflow connects QA test cases to executable automation.

```text
QA Test Case
      ↓
Automation Mapping
      ↓
Automation Project
      ↓
Generated Automation Framework
      ↓
GitHub Repository
      ↓
GitHub Actions
      ↓
Automated Execution
      ↓
QA Book Execution Result
```

Automation projects support Playwright and pytest based automation.

---

# 14. Automation Framework Generation

QA Book can generate a Python-based Playwright/pytest automation framework.

Generated projects can contain:

```text
README.md
requirements.txt
pytest.ini
conftest.py
.env.example
.gitignore

.github/
└── workflows/
    └── qabook.yml

qabook/
└── manifest.json

pages/
└── base_page.py

utils/
├── config.py
├── manifest.py
└── qabook_client.py

tests/
└── ...
```

The generated project provides a foundation for implementing automation associated with QA Book test cases.

---

# 15. GitHub Architecture

QA Book integrates with GitHub for automation projects and CI execution.

The integration includes:

* GitHub OAuth
* GitHub connection management
* Repository integration
* Repository association with automation projects
* GitHub Actions workflows
* Automated execution
* Automated retesting

The integration allows QA automation to remain connected to the corresponding QA Book project and test records.

---

# 16. CI/CD Architecture

GitHub Actions is used for continuous integration and automation execution.

The QA automation flow is:

```text
GitHub Repository
       ↓
GitHub Actions
       ↓
Playwright + pytest
       ↓
Test Results
       ↓
QA Book CI API
       ↓
Test Run
       ↓
Test Execution
```

Automation events can include:

* Repository push
* QA Book automation execution
* QA Book automated retest

---

# 17. Automated Retesting Architecture

Automated retesting connects defects to executable automation.

```text
Failed Execution
       ↓
Bug
       ↓
Retest
       ↓
Automated Retest
       ↓
GitHub Actions
       ↓
Playwright / pytest
       ↓
Updated Execution Result
```

This allows automated verification of fixes while preserving the relationship between the original execution, defect, retest, and resulting execution.

---

# 18. Object Storage Architecture

QA Book uses S3-compatible object storage for file-based data.

Object storage is used for areas such as:

* BRD documents
* Testing evidence
* Other project file assets

The backend communicates with object storage through the storage integration layer.

---

# 19. Reporting Architecture

QA Book provides reporting and analytics over the QA lifecycle.

Reporting areas include:

* Quality overview
* Pass rate
* Execution progress
* Requirement coverage
* Open defects
* Critical/high defects
* Execution analytics
* Test coverage analytics
* Defect intelligence
* Quality risk
* Traceability

Reports can provide drill-down from high-level metrics to underlying QA entities.

---

# 20. Export Architecture

QA Book supports export workflows for QA information.

Export functionality includes:

* Excel exports
* PDF exports
* Project-level exports
* QA artifact exports

Export functionality is implemented through dedicated backend services and frontend workflows.

---

# 21. API Architecture

The FastAPI backend exposes REST endpoints for the application modules.

The backend provides API functionality for:

```text
Authentication
Administration
Projects
Requirements
Test Scenarios
Test Cases
Test Suites
Test Runs
Test Executions
Bugs
Retests
Testing Studio
Automation
AI
Documents
Reports
GitHub Integration
```

FastAPI automatically exposes interactive API documentation through Swagger/OpenAPI.

---

# 22. Security Architecture

Security-related application concerns include:

* Protected API routes
* Authentication
* Role-aware administration
* Password management
* Encrypted AI credential storage
* Environment-based secrets
* Project-level access boundaries

Secrets and credentials should be supplied through environment configuration rather than committed to source control.

---

# 23. Deployment Architecture

The platform is designed for cloud deployment.

Current deployment components include:

```text
Frontend
   ↓
Vercel

Backend
   ↓
Render

Database
   ↓
Neon PostgreSQL

Object Storage
   ↓
S3-Compatible Storage

Source Control / CI
   ↓
GitHub + GitHub Actions
```

---

# 24. Repository Structure

```text
QA_Book/
│
├── apps/
│   │
│   ├── api/
│   │   ├── app/
│   │   │   ├── administration/
│   │   │   ├── ai/
│   │   │   ├── automation/
│   │   │   ├── auth/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── testing_studio/
│   │   │
│   │   └── alembic/
│   │
│   └── web/
│       └── src/
│           ├── components/
│           ├── config/
│           ├── contexts/
│           ├── pages/
│           ├── services/
│           └── types/
│
├── .github/
│   └── workflows/
│
├── docs/
├── docker/
├── scripts/
├── .gitignore
├── LICENSE
└── README.md
```

---

# 25. Architectural Principles

The platform follows several core architectural principles:

### Separation of concerns

Frontend, API, business logic, persistence, and integrations are separated into distinct layers.

### Reusable QA entities

Requirements, scenarios, test cases, suites, runs, executions, bugs, and retests are modeled as connected reusable entities.

### Extensible testing model

Testing Studio allows multiple testing disciplines to use the same core QA lifecycle while supporting discipline-specific information.

### Automation integration

Automation is connected to the QA lifecycle rather than being treated as a completely separate system.

### Traceability

QA artifacts maintain relationships across the testing lifecycle to support reporting and defect analysis.

### External integrations

GitHub, GitHub Actions, AI services, and object storage are integrated through dedicated service layers.

---

# 26. Summary

The current QA Book architecture combines:

```text
QA Management
      +
Testing Studio
      +
AI Assistance
      +
Automation
      +
GitHub / CI/CD
      +
Defect & Retest Management
      +
Reporting & Traceability
      +
Document & Evidence Storage
      +
Platform Administration
```

This architecture allows QA teams to manage the software testing lifecycle from requirements through automated execution and retesting within a single platform.
