# QA Book — API Documentation

## 1. Overview

QA Book exposes a REST API built with FastAPI.

The API provides backend functionality for:

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
* AI-assisted QA
* Documents
* Reporting
* GitHub integration

The API uses JSON for normal request and response payloads.

Interactive API documentation is available through FastAPI Swagger/OpenAPI.

```text id="7yqv6f"
http://localhost:8000/docs
```

---

# 2. API Architecture

```text id="z5ctv9"
React Frontend
      ↓
Axios / HTTP
      ↓
FastAPI REST API
      ↓
Service Layer
      ↓
Repository Layer
      ↓
SQLAlchemy
      ↓
PostgreSQL
```

External integrations are handled through dedicated backend services.

```text id="3x9c5k"
FastAPI
 ├── AI Services
 ├── Testing Studio
 ├── Automation
 ├── GitHub
 ├── Object Storage
 └── Reporting
```

---

# 3. Base URL

For local development:

```text id="2v6f8n"
http://localhost:8000
```

For production, use the deployed backend URL configured for the environment.

---

# 4. Authentication

Authentication endpoints provide user account and access management.

Typical authentication workflow:

```text id="j0x6qh"
Register
   ↓
Login
   ↓
Authentication Token
   ↓
Authenticated API Requests
```

Authentication functionality includes:

* Registration
* Login
* Current user
* Password change
* Forgot password
* Password reset

Protected endpoints require an authenticated user.

---

# 5. User Authentication Endpoints

## Register

```http
POST /auth/register
```

Creates a new user account.

---

## Login

```http
POST /auth/login
```

Authenticates a user and returns authentication information.

---

## Current User

```http
GET /auth/me
```

Returns information about the authenticated user.

---

## Change Password

```http
POST /auth/change-password
```

Changes the authenticated user's password.

---

## Forgot Password

```http
POST /auth/forgot-password
```

Starts the password-recovery workflow.

---

## Reset Password

```http
POST /auth/reset-password
```

Completes the password-reset workflow.

---

# 6. Projects API

Project endpoints manage QA projects.

Core project operations include:

```text id="3b4nq7"
Create Project
List Projects
Get Project
Update Project
Delete Project
```

Projects act as the primary container for QA artifacts.

Project-related functionality includes:

* Project information
* Requirements
* Scenarios
* Test Cases
* Test Suites
* Test Runs
* Bugs
* Documents
* Automation
* Reporting

---

# 7. Requirements API

Requirement endpoints manage project requirements.

Core operations include:

```text id="c9m0b3"
Create Requirement
List Requirements
Get Requirement
Update Requirement
Delete Requirement
```

Requirements can be associated with test scenarios and test cases.

AI-assisted requirement generation is also available through the AI functionality.

---

# 8. Test Scenarios API

Test scenario endpoints manage QA scenarios.

Core operations include:

```text id="3f6p7a"
Create Scenario
List Scenarios
Get Scenario
Update Scenario
Delete Scenario
```

Scenarios can be associated with requirements and test cases.

---

# 9. Test Cases API

Test case endpoints manage executable QA test definitions.

Core operations include:

```text id="1z5b8m"
Create Test Case
List Test Cases
Get Test Case
Update Test Case
Delete Test Case
```

Test cases can contain:

* Preconditions
* Test steps
* Expected results
* Priority
* Status
* Requirement relationships
* Scenario relationships
* Automation information

---

# 10. Test Suites API

Test suite endpoints organize test cases into reusable collections.

Core operations include:

```text id="0r8yq4"
Create Test Suite
List Test Suites
Get Test Suite
Update Test Suite
Delete Test Suite
```

Suites can contain multiple test cases and can be used to create test runs.

---

# 11. Test Runs API

Test run endpoints manage execution cycles.

Core operations include:

```text id="n6r3m2"
Create Test Run
List Test Runs
Get Test Run
Update Test Run
Delete Test Run
```

A test run can contain execution records for the test cases included in the run.

Run information can include:

* Build
* Environment
* Tester
* Status
* Execution information

---

# 12. Test Executions API

Test execution endpoints manage individual test execution results.

Supported execution outcomes include:

```text id="x5t9p3"
PASSED
FAILED
BLOCKED
NOT EXECUTED
```

Execution records can contain:

* Test case information
* Execution status
* Execution timestamp
* Execution details
* Defect relationships

Executions can originate from manual or automated testing workflows.

---

# 13. Bugs API

Bug endpoints manage defects identified during testing.

Core operations include:

```text id="b6p1s8"
Create Bug
List Bugs
Get Bug
Update Bug
Delete Bug
```

Bug information can include:

* Title
* Description
* Severity
* Priority
* Status
* Assignment
* Preconditions
* Expected result
* Reproduction information
* Related test execution

---

# 14. Retesting API

Retesting functionality allows a failed test or defect to be verified again.

Retesting can be performed manually or through automation.

The general workflow is:

```text id="x3r6k2"
Failed Execution
       ↓
Bug
       ↓
Retest
       ↓
New Execution Result
```

Automated retesting can use the GitHub Actions automation workflow.

---

# 15. Testing Studio API

Testing Studio provides APIs for structured testing workflows.

Supported testing types include:

```text id="q8w2e1"
FUNCTIONAL
API
DATABASE
AUTOMATION
PERFORMANCE
SECURITY
ACCESSIBILITY
```

Supported execution methods include:

```text id="f7v3m9"
MANUAL
AUTOMATED
EXTERNAL
IMPORTED
```

Testing Studio functionality includes:

* Testing profiles
* Testing metadata
* Execution result profiles
* Testing evidence
* Discipline-specific test information

---

# 16. Testing Evidence API

Testing evidence can be uploaded and associated with testing workflows.

Supported file types include:

```text id="a6y2c8"
PNG
JPG
JPEG
WEBP
PDF
TXT
LOG
```

Evidence is stored using the application's object-storage integration.

---

# 17. AI API

AI functionality supports AI-assisted QA workflows.

Capabilities include:

* Requirement generation
* Scenario generation
* Test case generation
* BRD-based requirement generation
* AI-assisted QA artifact creation

The AI layer integrates with Google Gemini.

---

# 18. AI Credentials API

QA Book provides application-level management for AI credentials.

The backend includes:

* AI credential storage
* Credential retrieval
* Credential update
* Encrypted credential handling

Sensitive credentials should not be committed to source control.

---

# 19. Documents API

Document endpoints manage project-level files.

Supported document types include:

* DOCX
* PDF

Document functionality includes:

```text id="h2k7d9"
Upload
List
Retrieve
Download
Delete
```

Documents can also be used as inputs for AI-assisted BRD processing.

---

# 20. Automation API

Automation APIs manage automation projects and their relationship with QA test cases.

Automation functionality includes:

* Automation project creation
* Automation project management
* Test case mapping
* Automation configuration
* Framework generation
* Execution
* Retesting
* CI integration

---

# 21. Automation Framework API

QA Book can generate a Playwright/pytest automation project.

The generated project can contain:

```text id="r5s1m7"
pytest configuration
Playwright configuration
Test structure
Page object structure
QABook manifest
QABook client
Configuration utilities
GitHub Actions workflow
Environment configuration
```

The generated framework can then be associated with a GitHub repository.

---

# 22. GitHub API

GitHub integration provides repository and OAuth functionality.

The integration includes:

* GitHub OAuth
* GitHub connection
* Repository information
* Repository association
* Automation project integration

GitHub is used as the source-control layer for automation projects.

---

# 23. GitHub Actions / CI API

QA Book provides CI integration for automation execution.

The CI workflow can handle events such as:

```text id="q4m8t2"
push
qabook-automation-run
qabook-retest
```

The general flow is:

```text id="z6v1p8"
QA Book
   ↓
Automation Request
   ↓
GitHub Actions
   ↓
Playwright / pytest
   ↓
Execution Result
   ↓
QA Book CI API
   ↓
Test Run / Test Execution
```

---

# 24. Administration API

Administration endpoints provide platform-level user management.

Administration functionality includes:

* User listing
* User creation
* User updates
* User activation/deactivation
* Role management
* Password administration

Administrative endpoints should only be accessible to authorized administrators.

---

# 25. Reporting API

Reporting functionality provides QA metrics and analytics.

Reporting areas include:

* Quality overview
* Execution metrics
* Pass rate
* Requirement coverage
* Test coverage
* Open defects
* Critical/high defects
* Defect intelligence
* Quality risk
* Traceability

Reports can provide drill-down to the underlying QA entities.

---

# 26. Export API

QA Book supports export functionality for QA information.

Export capabilities include:

* Excel
* PDF
* Project exports
* QA artifact exports

Specific export availability depends on the corresponding feature module.

---

# 27. API Response Model

API responses use JSON for standard application requests.

A typical successful resource response follows the structure defined by the corresponding Pydantic response schema.

Example:

```json
{
  "id": 1,
  "name": "Example Project"
}
```

The exact response fields depend on the endpoint and schema.

---

# 28. Error Handling

The FastAPI backend uses HTTP status codes and structured API responses for errors.

Common categories include:

```text id="z0s6n4"
400 — Invalid request
401 — Authentication required
403 — Access denied
404 — Resource not found
409 — Resource conflict
422 — Validation error
500 — Internal server error
```

The exact status code depends on the operation and backend validation.

---

# 29. API Documentation

FastAPI automatically generates OpenAPI documentation.

When running locally:

```text id="f1d5q9"
http://localhost:8000/docs
```

The API documentation provides:

* Available endpoints
* Request parameters
* Request schemas
* Response schemas
* Authentication information
* Interactive API testing

FastAPI also provides the OpenAPI JSON specification through the application's OpenAPI endpoint.

---

# 30. API Development Principles

The API follows several development principles:

### REST-oriented design

Resources are exposed through HTTP endpoints using standard REST patterns.

### Schema validation

Pydantic schemas validate API request and response structures.

### Service layer

Business logic is kept inside service classes rather than being placed directly inside route handlers.

### Repository layer

Database access is separated from API and business logic.

### Authentication

Protected resources require authenticated access where applicable.

### Modular design

Major product capabilities are separated into feature-specific API modules.

### External integrations

AI, GitHub, object storage, and automation integrations are handled through dedicated services.

---

# 31. API Module Overview

The current backend API is organized around these major functional areas:

```text id="9c7x4m"
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
Retesting
Testing Studio
AI
Documents
Automation
GitHub
Reports
Exports
```

The exact routes and schemas should be treated as defined by the current FastAPI application and its generated OpenAPI specification.

---

# 32. Swagger / OpenAPI

For complete endpoint-level documentation, run the backend and open:

```text id="m3w7k1"
http://localhost:8000/docs
```

Swagger provides the authoritative interactive representation of the currently registered API routes and schemas.

---

# 33. API Summary

The QA Book API connects the complete QA lifecycle:

```text id="p7x4n2"
Authentication
      ↓
Projects
      ↓
Requirements
      ↓
Scenarios
      ↓
Test Cases
      ↓
Test Suites
      ↓
Test Runs
      ↓
Executions
      ↓
Bugs
      ↓
Retesting
      ↓
Reporting
```

Additional platform capabilities extend this lifecycle through:

```text id="e5m8q1"
AI
Testing Studio
Automation
GitHub
GitHub Actions
Documents
Object Storage
Administration
```

Together, these APIs provide the backend foundation for the QA Book web application.
