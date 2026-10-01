

````md
# Git & GitHub Documentation

## Overview

QABook uses Git and GitHub for source-code management, collaboration, version control, and continuous integration.

The project repository is hosted on GitHub:

**Repository:**  
https://github.com/Rushis09/QA_Book

The repository contains the frontend, backend, documentation, configuration, and GitHub Actions workflow used to validate changes.

---

## Repository Structure

The main Git-related structure is:

```text
QA_Book/
│
├── apps/
│   ├── api/                 # FastAPI backend
│   └── web/                 # React + TypeScript frontend
│
├── docs/                    # Project documentation
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI workflow
│
├── README.md
└── ...
````

---

# Git Workflow

## Main Branch

QABook currently uses:

```text
main
```

as the primary branch.

Changes pushed to `main` trigger the GitHub Actions CI workflow.

Pull requests targeting `main` also trigger CI validation.

---

## Local Development Workflow

The typical local Git workflow is:

```text
Make changes
     ↓
Run local validation
     ↓
Check Git status
     ↓
Review changes
     ↓
Stage changes
     ↓
Commit changes
     ↓
Push to GitHub
     ↓
GitHub Actions CI
```

---

# Checking Repository Status

Before committing changes, check the working tree:

```bash
git status
```

This shows:

* modified files
* new files
* deleted files
* staged files
* the current branch
* whether the local branch is ahead or behind the remote branch

Example:

```bash
git status
```

---

# Reviewing Changes

Review the changes before staging them:

```bash
git diff
```

For staged changes:

```bash
git diff --cached
```

This helps verify that only the intended files are included in the commit.

---

# Staging Changes

To stage a specific file:

```bash
git add path/to/file
```

Example:

```bash
git add docs/Git.md
```

To stage multiple specific files:

```bash
git add docs/Git.md docs/API.md
```

To stage all changes:

```bash
git add .
```

For project changes, staging specific files is preferred when only a small part of the repository has been modified.

---

# Committing Changes

Create a commit after reviewing the staged changes:

```bash
git commit -m "Add Git documentation"
```

Commit messages should describe the change clearly.

Examples:

```bash
git commit -m "Update API documentation"
```

```bash
git commit -m "Add product screenshots"
```

```bash
git commit -m "Improve documentation page"
```

---

# Pushing Changes

Push the committed changes to the remote repository:

```bash
git push origin main
```

After the push, GitHub Actions automatically evaluates the change because the CI workflow is configured for the `main` branch.

---

# Pulling Latest Changes

Before starting work when the remote repository may have changed:

```bash
git pull origin main
```

This retrieves the latest changes from the remote `main` branch and integrates them into the local branch.

---

# Remote Repository

The QABook GitHub repository is:

```text
https://github.com/Rushis09/QA_Book
```

The normal remote configuration can be checked with:

```bash
git remote -v
```

Example:

```text
origin  https://github.com/Rushis09/QA_Book.git
```

---

# GitHub Actions

QABook uses GitHub Actions for continuous integration.

The workflow is located at:

```text
.github/workflows/ci.yml
```

The workflow is named:

```text
QA Book CI
```

---

# CI Triggers

The CI workflow runs for pushes to `main`:

```yaml
on:
  push:
    branches:
      - main
```

It also runs for pull requests targeting `main`:

```yaml
pull_request:
  branches:
    - main
```

Therefore, the CI pipeline validates both:

* changes pushed directly to `main`
* pull requests opened against `main`

---

# CI Pipeline

The workflow contains two independent jobs:

```text
QA Book CI
│
├── backend
│
└── frontend
```

The jobs run on:

```text
ubuntu-latest
```

---

# Backend CI

The backend job operates from:

```text
apps/api
```

The workflow checks out the repository first:

```yaml
- name: Checkout Repository
  uses: actions/checkout@v4
```

---

## Python Setup

The backend CI environment uses:

```text
Python 3.13
```

The workflow uses:

```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: "3.13"
```

---

## Backend Dependencies

Backend dependencies are installed from:

```text
apps/api/requirements.txt
```

The workflow runs:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

This ensures the dependencies required by the backend are installed before the verification step.

---

## Backend Import Verification

The current backend CI performs an application import check:

```bash
python -c "import app.main"
```

The workflow provides CI-specific environment variables:

```text
DATABASE_URL=sqlite:///./test.db
GEMINI_API_KEY=ci-test-key
```

The purpose of this check is to verify that the FastAPI application can be imported successfully in the CI environment.

The current workflow does not define a separate backend unit-test command.

---

# Frontend CI

The frontend job operates from:

```text
apps/web
```

The repository is checked out using:

```yaml
- name: Checkout Repository
  uses: actions/checkout@v4
```

---

## Node.js Setup

The frontend CI environment uses:

```text
Node.js 22
```

The workflow uses:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: apps/web/package-lock.json
```

npm dependency caching is configured using:

```text
apps/web/package-lock.json
```

---

## Frontend Dependencies

The workflow installs dependencies with:

```bash
npm ci
```

`npm ci` uses the project's lock file to install the declared dependency versions.

---

## Frontend Build

The final frontend CI step runs:

```bash
npm run build
```

This verifies that the production frontend build can be generated successfully in the CI environment.

---

# CI Validation Summary

The current QABook CI workflow performs the following checks:

| Area          | CI Check                     |
| ------------- | ---------------------------- |
| Repository    | Checkout source code         |
| Backend       | Python 3.13 environment      |
| Backend       | Install `requirements.txt`   |
| Backend       | Import `app.main`            |
| Frontend      | Node.js 22 environment       |
| Frontend      | npm dependency installation  |
| Frontend      | Production build             |
| Pull Requests | CI runs against `main`       |
| Main Branch   | CI runs after push to `main` |

---

# GitHub Actions Workflow

The current workflow can be represented as:

```text
GitHub Repository
       │
       ├── Push to main
       │
       └── Pull Request → main
                    │
                    ▼
             QA Book CI
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      Backend              Frontend
          │                   │
   Python 3.13            Node.js 22
          │                   │
 requirements.txt          npm ci
          │                   │
 import app.main          npm run build
          │                   │
          └─────────┬─────────┘
                    ▼
              CI Result
```

---

# Recommended Local Workflow

Before pushing a change, the recommended sequence is:

```bash
git status
```

Review the changes:

```bash
git diff
```

Stage the intended files:

```bash
git add <files>
```

Review staged changes:

```bash
git diff --cached
```

Commit:

```bash
git commit -m "Describe the change"
```

Push:

```bash
git push origin main
```

Then check the GitHub Actions result for the pushed commit.

---

# Pull Request Workflow

For changes developed through a pull request:

```text
Create branch
     ↓
Make changes
     ↓
Commit changes
     ↓
Push branch
     ↓
Open Pull Request
     ↓
GitHub Actions CI
     ↓
Review CI result
     ↓
Merge into main
```

The current CI workflow is configured to run automatically for pull requests targeting `main`.

---

# Useful Git Commands

## Check current branch

```bash
git branch
```

## Show all branches

```bash
git branch -a
```

## Check remote repository

```bash
git remote -v
```

## View commit history

```bash
git log --oneline
```

## View recent commits

```bash
git log --oneline -10
```

## Check branch synchronization

```bash
git status
```

## Download remote changes

```bash
git fetch origin
```

## Pull latest main branch

```bash
git pull origin main
```

---

# Handling an Unwanted Local Change

To discard changes in a specific tracked file:

```bash
git restore path/to/file
```

For example:

```bash
git restore docs/Git.md
```

Use this only when the local changes are no longer required.

---

# GitHub Actions Troubleshooting

If CI fails, open the repository's **Actions** section on GitHub and select the failed workflow run.

Check which job failed:

```text
backend
frontend
```

### Backend failure

Review:

* Python version
* `requirements.txt`
* dependency installation
* application imports
* CI environment variables
* backend startup/import errors

### Frontend failure

Review:

* Node.js version
* `package-lock.json`
* npm dependency installation
* TypeScript errors
* build errors
* frontend configuration

---

# Current CI Scope

The current CI workflow validates:

```text
Backend
├── Dependency installation
└── Application import

Frontend
├── Dependency installation
└── Production build
```

It does not currently define separate automated test commands such as:

```text
pytest
Playwright
npm test
API integration tests
```

Those checks can be added to the CI workflow when they become part of the project's automated CI strategy.

---

# Related Documentation

Other QABook technical documentation is available in the `docs/` directory:

```text
docs/
├── API.md
├── Architecture.md
├── Database.md
├── Deployment.md
├── Git.md
└── Roadmap.md
```

---

# Summary

Git and GitHub provide QABook with:

* source-code version control
* repository collaboration
* commit history
* pull request validation
* automated CI checks
* backend import verification
* frontend production-build verification

The GitHub Actions workflow provides an automated validation layer for changes targeting the `main` branch.

````
