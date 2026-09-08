QA Book






AI-Powered QA Workspace for Modern Testing Teams

QA Book is a modern full-stack Quality Assurance Management Platform
that brings the software testing lifecycle into a single workspace.

It provides project-based management for requirements, test scenarios,
test cases, test suites, test runs, test executions, bugs, documents,
reporting, and automation. The platform also includes AI-assisted QA
artifact generation, BRD-based requirement generation, GitHub Actions
automation, and end-to-end traceability across the testing lifecycle.

QA Book uses individual user accounts. Users sign up and log in to
the production application and work with the projects and QA data
available to their account. There is no Demo/Production environment
switch and no Demo database.

Why QA Book?

QA teams often manage requirements, test cases, execution results,
defects, documents, and reports across spreadsheets and multiple tools.

QA Book brings these activities together into one platform to improve:

Test organization

Requirement-to-test traceability

Test execution tracking

Defect management

QA documentation

Reporting and analytics

Manual testing productivity

Automation workflow management

Highlights

Full-stack web application

Individual user authentication

Project-based QA workspace

REST API

FastAPI Swagger documentation

PostgreSQL database

Cloud deployment

AI-assisted QA artifact generation

BRD document upload and storage

Manual testing lifecycle management

Test execution and defect tracking

GitHub Actions automation

Automated test execution through Playwright/pytest workflows

Project-level reporting and analytics

Excel and PDF exports

Responsive modern SaaS UI

QA Testing Lifecycle

QA Book supports the complete core testing flow:

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

Traceability is maintained across requirements, scenarios, test cases,
suites, runs, executions, bugs, and retests.

Automation Lifecycle

QA Book also supports an automation workflow:

Automation Project
       ↓
Test Case Mapping
       ↓
Generated Playwright / pytest Automation
       ↓
GitHub Repository
       ↓
GitHub Actions
       ↓
Automated Test Execution
       ↓
QABook REST API
       ↓
Test Execution Result
       ↓
Bug
       ↓
Retest

Automated test runs can update execution results in QA Book, allowing
manual and automated testing activities to remain connected to the same
QA lifecycle.

Key Features

User Authentication

Individual user signup

User login

Authenticated sessions using access tokens

Account information and role handling

Protected application routes

Logout

User-scoped project access

QA Book does not use a Demo user, Demo database, or Demo/Production
environment selector.

Project Management

Create and manage projects

Project status and version tracking

Start and end dates

Project ownership

Project-based QA workspace

Project overview and health information

Project-level requirements, scenarios, test cases, suites, runs,
bugs, automation, documents, exports, and settings

Project deletion with impact handling

Requirement Management

Create and manage requirements

Requirement numbering

Requirement-to-test traceability

Requirement status and priority

Search, filtering, and sorting

AI-assisted requirement generation

BRD-based requirement generation

Test Scenario Management

Create and manage test scenarios

Link scenarios to requirements

Scenario status and priority

Requirement-based filtering

Search and sorting

AI-assisted scenario generation

Test Case Management

Create and manage detailed test cases

Link test cases to requirements and scenarios

Test case numbering

Preconditions

Test steps

Expected results

Priority and status

Automation eligibility

Automation status

Project-based filtering

AI-assisted test case generation

Test Suite Management

Create and manage test suites

Assign test cases to suites

View suite coverage

Track suite status

Project-based suite management

Test Run Management

Create test runs from test suites

Manual and automated execution types

Build version and environment information

Tester information

Run status

Run configuration

Execution result tracking

Test run details and execution health

Test Execution

Execute assigned test cases

Record Passed, Failed, Blocked, and Not Executed results

Track execution timestamps

Track executed-by information

View execution details

Search and filter executions

Defect creation from failed executions

Manual and automated execution support

Bug Management

Create and manage defects

Bug severity and priority

Bug status workflow

Assigned-to tracking

Preconditions and expected results

Reproduction steps

Test case context

Resolution tracking

Manual retesting

Automated retesting

Bug lifecycle from discovery through closure

Defect traceability to test executions

BRD Document Management

Upload BRD documents to projects

Supported formats: DOCX and PDF

Store documents in object storage

View project documents

Download documents

Delete documents

Use uploaded BRD content for AI-assisted requirement generation

AI-Assisted QA

QA Book uses AI to assist QA teams with artifact creation and analysis.

Current capabilities include:

AI-assisted requirement generation

AI-assisted test scenario generation

AI-assisted test case generation

BRD-based requirement analysis and generation

AI-assisted QA workflow support

Automation

QA Book provides a project-based automation workspace for connecting QA
test cases with executable automation.

Capabilities include:

Automation project management

Test case mapping

Playwright/pytest automation generation

GitHub repository integration

GitHub Actions integration

Automated test execution

Execution result synchronization

Automated retest workflow

Run-specific retest execution

Bug-to-retest traceability

Reporting & Analytics

QA Book provides project-aware and global QA reporting.

Reporting areas include:

Executive quality overview

Pass rate

Execution progress

Requirement coverage

Open defects

Critical/high defects

Execution analytics

Test coverage analytics

Defect intelligence

Quality risk

Traceability intelligence

Interactive report drill-down

Record-level navigation from report details

Reports are designed to allow users to move from aggregate quality
metrics to the actual QA records behind those metrics.

Export

QA Book supports export capabilities for QA artifacts and project
information, including:

Project export

Requirements export

Test scenario export

Test case export

Test suite export

Test run export

Bug report export

Excel export

PDF export

Tech Stack

Frontend

React 19

TypeScript

Vite

Material UI

Axios

React Router

Backend

FastAPI

Python

SQLAlchemy

Alembic

Pydantic

Boto3

Database & Storage

PostgreSQL

Neon PostgreSQL

S3-compatible object storage

AI

Google Gemini API

Deployment

Vercel

Render

Neon

Version Control & CI/CD

Git

GitHub

GitHub Actions

Project Architecture

                           QA Book
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      React Frontend                    FastAPI Backend
      TypeScript + Vite                       │
      Material UI                             │
             │                                 │
             └────────────────┬────────────────┘
                              │
                           REST API
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      PostgreSQL Database                Object Storage
      Neon PostgreSQL                    BRD Documents
             │
             │
        Gemini API

Project Structure

QA_Book/
│
├── apps/
│   ├── api/                              # FastAPI Backend
│   │   ├── app/
│   │   │   ├── ai/                       # AI services and prompts
│   │   │   ├── api/                      # API routes
│   │   │   ├── automation/               # Automation services and integrations
│   │   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── repositories/             # Data access layer
│   │   │   ├── schemas/                  # Pydantic schemas
│   │   │   └── services/                 # Business logic
│   │   └── alembic/                      # Database migrations
│   │
│   └── web/                              # React Frontend
│       └── src/
│           ├── components/
│           ├── config/
│           ├── contexts/
│           ├── pages/
│           ├── services/
│           └── types/
│
├── .github/
│   └── workflows/                        # GitHub Actions workflows
│
├── docs/                                 # Project documentation
├── docker/                               # Docker-related files
├── scripts/                              # Utility scripts
├── .gitignore
├── LICENSE
└── README.md

Feature Development Workflow

When developing a new feature in QA Book, the general development flow
is:

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

Backend-first approach

For most new features, development starts with the backend so that the
required database structure, business logic, and API contract are
established first.

Typical backend work includes:

Database model

Alembic migration

Pydantic schema

Repository

Service/business logic

API endpoint

The backend is verified before the frontend is connected.

Frontend development

After the backend contract is available, the frontend is implemented
using React and TypeScript.

Typical frontend work includes:

Pages

Forms

Dialogs

Tables

Validation

Loading states

Error handling

Notifications

API service integration

Integration

The frontend communicates with the FastAPI backend through the
API/service layer.

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

The complete user workflow is then tested through the application.

Git Workflow

The project uses Git and GitHub for version control.

Typical feature completion flow:

git status
git diff
git add <files>
git commit -m "Describe the change"
git push origin main

Before committing, changes are reviewed to make sure that:

Only intended files are included

Secrets are not committed

Generated files are not accidentally tracked

The feature changes are complete

The application builds successfully

Continuous Integration

QA Book uses GitHub Actions for Continuous Integration (CI).

The workflow runs automatically when code is pushed to main or when a
pull request targets main.

Current CI pipeline:

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

Backend CI

The backend job:

Runs on Ubuntu

Sets up Python

Installs backend dependencies

Uses CI database configuration

Uses a CI-only dummy Gemini API key

Verifies that the FastAPI application imports successfully

Frontend CI

The frontend job:

Runs on Ubuntu

Sets up Node.js

Uses npm dependency caching

Runs npm ci

Runs the production build using npm run build

Current CI scope

CI currently validates backend application initialization and frontend
production build.

Getting Started

Clone Repository

git clone https://github.com/Rushis09/QA_Book.git
cd QA_Book

Backend Setup

cd apps/api

python -m venv .venv

Windows

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file with the required configuration.

Example:

DATABASE_URL=YOUR_DATABASE_URL

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

AWS_ENDPOINT_URL_S3=YOUR_S3_ENDPOINT
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=YOUR_REGION
AWS_S3_BUCKET=YOUR_BUCKET

Run the backend:

uvicorn app.main:app --reload

Backend:

http://localhost:8000

Swagger API documentation:

http://localhost:8000/docs

Frontend Setup

cd apps/web
npm ci

Create .env with the API configuration required by the frontend.

Example:

VITE_PRODUCTION_API_URL=http://localhost:8000

Run:

npm run dev

Frontend:

http://localhost:5173

Production build:

npm run build

Deployment

QA Book is deployed as a production application.

Component        Platform

Frontend         Vercel
Backend          Render
Database         Neon PostgreSQL
Object Storage   S3-compatible object storage

Live application:

https://qa-book.vercel.app

Backend API:

https://qabook-api.onrender.com

API documentation:

https://qabook-api.onrender.com/docs

There is no Demo environment or Demo database in the deployed
application. Users create individual accounts, log in, and use the
production application according to their project access.

Development and Quality Practices

The project follows a layered full-stack architecture:

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

Development focuses on:

Separation of concerns

Reusable frontend components

Service/repository architecture

Database migrations with Alembic

API validation with Pydantic

Authentication and project access control

Error handling

Functional testing

UI and workflow verification

Integration testing

Git-based version control

Automated CI validation

Roadmap

Current Platform

Individual user signup and login

Project management

Project workspace

Requirement management

Test scenario management

Test case management

Test suite management

Test runs

Test execution

Bug tracking

Manual bug retesting

Automation project management

Test case automation mapping

Playwright/pytest automation generation

GitHub integration

GitHub Actions automation

Automated test execution

Automated retesting

Dashboard and analytics

Interactive reporting and drill-down

Excel export

PDF export

AI-assisted QA artifact generation

BRD document management

Object storage integration

Production cloud deployment

GitHub Actions CI

Planned Improvements

Automated backend test suite expansion

Stronger frontend linting and CI quality gates

Expanded AI-assisted test generation

AI bug summaries

AI risk analysis

Additional reporting capabilities

Continuous deployment automation

Further automation framework improvements

Contributing

If you'd like to contribute:

Fork the repository.

Create a feature branch.

Develop and test the feature.

Review your changes with Git.

Commit the changes.

Open a Pull Request.

My Contribution

Designed the overall QA Book product concept and workflow.

Defined the functional requirements and QA lifecycle.

Designed and implemented the database structure.

Developed the frontend using React, TypeScript, Vite, and Material
UI.

Developed the backend using FastAPI, SQLAlchemy, Pydantic, and
Alembic.

Implemented REST APIs and service/repository architecture.

Implemented individual user authentication and project access.

Implemented project, requirement, scenario, test case, test suite,
test run, execution, and bug management workflows.

Implemented manual and automated retesting workflows.

Implemented AI-assisted QA artifact generation.

Implemented BRD document upload, extraction, storage, download, and
deletion.

Integrated PostgreSQL and object storage.

Implemented reporting, analytics, traceability, and interactive
drill-down.

Implemented GitHub Actions automation and CI integration.

Validated features through functional testing, UI testing,
integration testing, and end-to-end workflow verification.

Deployed the application using Vercel, Render, and Neon.

Used AI-assisted development while reviewing, testing, and
validating the resulting implementation.

Author

Rushikesh

GitHub:
https://github.com/Rushis09

License

This project is licensed under the MIT License.

See the LICENSE file for details.