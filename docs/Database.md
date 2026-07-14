# QA Book Database

## Overview

QA Book uses PostgreSQL as its primary relational database.

The application uses SQLAlchemy as the ORM and Alembic for database migrations.

---

# Database Technologies

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migration | Alembic |
| Cloud Database | Neon |

---

# Core Entities

Current entities include:

- Projects
- Requirements
- Test Scenarios
- Test Cases
- Test Suites
- Suite Test Cases
- Test Runs
- Test Executions
- Bugs

---

# Entity Relationships

```
Project
    │
    ├────────► Requirements
    │
    ├────────► Test Scenarios
    │
    ├────────► Test Cases
    │
    ├────────► Test Suites
    │
    ├────────► Test Runs
    │
    └────────► Bugs

Test Suite
      │
      ▼
Suite Test Cases
      │
      ▼
Test Cases

Test Run
      │
      ▼
Test Execution
```

---

# Primary Keys

Every table uses an integer primary key.

Example

```
id
```

---

# Foreign Keys

Examples

```
project_id

suite_id

test_case_id

test_run_id
```

These maintain referential integrity across the system.

---

# Migrations

Database schema changes are managed using Alembic.

Typical workflow:

```bash
alembic revision --autogenerate -m "description"

alembic upgrade head
```

---

# Future Database Enhancements

Planned additions include:

- Users
- Organizations
- Roles
- Permissions
- Audit Logs
- Notifications
- AI Usage History
- Attachments