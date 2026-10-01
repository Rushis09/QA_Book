# QA Book — Roadmap

## 1. Overview

QA Book is being developed as an AI-powered Quality Assurance workspace that combines QA management, Testing Studio, automation, CI/CD, reporting, and AI-assisted workflows.

The roadmap below separates functionality that is already implemented from areas that can be expanded in future development.

---

# 2. Current Platform

The current platform includes the following major capabilities.

## 2.1 User Authentication

Implemented:

* User registration
* User login
* Protected application access
* Current-user information
* Password change
* Forgot-password workflow
* Password reset
* User status management

---

## 2.2 Project Management

Implemented:

* Project creation
* Project management
* Project ownership
* Project status
* Project dates
* Project-level QA artifacts
* Project documents
* Project automation
* Project reporting
* Project exports

---

## 2.3 Requirement Management

Implemented:

* Requirement creation
* Requirement management
* Requirement status
* Requirement priority
* Requirement numbering
* Requirement traceability
* Requirement search and filtering
* AI-assisted requirement generation

---

## 2.4 Test Scenario Management

Implemented:

* Scenario creation
* Scenario management
* Requirement-to-scenario relationships
* Scenario status
* Scenario priority
* Search and filtering
* AI-assisted scenario generation

---

## 2.5 Test Case Management

Implemented:

* Test case creation
* Test case management
* Test steps
* Expected results
* Preconditions
* Priority
* Status
* Requirement/scenario relationships
* Automation information
* AI-assisted test case generation

---

## 2.6 Test Suite Management

Implemented:

* Test suite creation
* Test suite management
* Test case assignment
* Suite-level organization
* Suite status tracking

---

## 2.7 Test Run Management

Implemented:

* Test run creation
* Suite-based test runs
* Manual execution
* Automated execution
* Environment information
* Build information
* Tester information
* Run status
* Execution tracking

---

## 2.8 Test Execution

Implemented:

* Manual execution
* Automated execution
* Passed status
* Failed status
* Blocked status
* Not Executed status
* Execution timestamps
* Execution details
* Test case relationships

---

## 2.9 Bug Management

Implemented:

* Bug creation
* Bug management
* Severity
* Priority
* Status
* Assignment
* Preconditions
* Expected results
* Reproduction information
* Test execution relationships
* Retesting

---

# 3. Testing Studio

Testing Studio is implemented as a dedicated QA workspace for different testing disciplines.

Supported testing types include:

* Functional Testing
* API Testing
* Database Testing
* Automation Testing
* Performance Testing
* Security Testing
* Accessibility Testing

Supported execution methods include:

* Manual
* Automated
* External
* Imported

Testing Studio also supports discipline-specific testing metadata and testing evidence.

---

# 4. Testing Evidence

Implemented evidence support includes:

* PNG
* JPG
* JPEG
* WEBP
* PDF
* TXT
* LOG

Evidence is stored through the platform's object-storage integration.

---

# 5. AI-Assisted QA

Implemented AI-assisted workflows include:

* Requirement generation
* Test scenario generation
* Test case generation
* BRD-based requirement generation
* AI-assisted QA artifact creation

AI credentials are managed through the platform's AI credential-management functionality.

---

# 6. BRD Document Management

Implemented:

* BRD upload
* DOCX support
* PDF support
* Object-storage integration
* Document retrieval
* Document deletion
* BRD-based AI requirement generation

---

# 7. Automation

Implemented automation capabilities include:

* Automation project management
* Test case-to-automation mapping
* Automation configuration
* Playwright automation support
* pytest automation support
* Automation framework generation
* GitHub repository integration
* GitHub Actions integration
* Automated test execution
* Execution result synchronization
* Automated retesting

---

# 8. Automation Framework Generation

QA Book can generate the foundation of a Python-based Playwright/pytest automation project.

Generated projects can include:

* pytest configuration
* Playwright configuration
* Base page structure
* Test structure
* QABook manifest
* QABook client utilities
* Configuration utilities
* GitHub Actions workflow
* Environment configuration
* Project README

---

# 9. GitHub Integration

Implemented:

* GitHub connection
* GitHub OAuth
* Repository integration
* Automation project repository association
* GitHub Actions execution
* Automated test execution
* Automated retesting

---

# 10. CI/CD

Implemented CI/CD functionality includes:

* GitHub Actions
* Backend CI validation
* Frontend CI validation
* Automation workflow execution
* QA Book CI callbacks
* Automated execution result synchronization
* Automated retest execution

---

# 11. Automated Retesting

Implemented automated retesting workflow:

```text id="c5v3hl"
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
Updated Execution
```

This connects defect verification directly with automation.

---

# 12. Reporting & Analytics

Implemented reporting areas include:

* Executive quality overview
* Pass rate
* Execution progress
* Requirement coverage
* Open defects
* Critical/high defects
* Execution analytics
* Test coverage analytics
* Defect intelligence
* Quality risk
* Traceability intelligence
* Interactive drill-down

---

# 13. Export

Implemented export functionality includes:

* Excel export
* PDF export
* Project exports
* QA artifact exports

---

# 14. Administration

Implemented platform administration capabilities include:

* User management
* User creation
* User activation/deactivation
* Role management
* Password administration
* Administrator-only workflows

---

# 15. Current Architecture

The current platform consists of:

```text id="7bdyly"
React + TypeScript Frontend
            ↓
        FastAPI API
            ↓
       Service Layer
            ↓
      Repository Layer
            ↓
        PostgreSQL
```

Additional integrations include:

```text id="q8t3qf"
FastAPI
 ├── AI
 ├── Testing Studio
 ├── Automation
 ├── Administration
 ├── GitHub
 ├── Object Storage
 └── Reporting
```

---

# 16. Future Development Areas

The following areas can be expanded in future versions.

## 16.1 AI Improvements

Potential improvements:

* More advanced test-generation workflows
* AI-assisted bug summaries
* AI-assisted defect analysis
* AI-assisted risk analysis
* AI-assisted test optimization
* AI-assisted coverage recommendations

---

## 16.2 Automation Improvements

Potential improvements:

* Additional automation framework integrations
* More generated framework templates
* Improved automation synchronization
* Enhanced automation diagnostics
* More advanced execution controls
* Additional CI/CD integrations

---

## 16.3 Testing Studio Improvements

Potential improvements:

* More specialized testing workflows
* Additional testing tools
* Enhanced testing evidence management
* Expanded discipline-specific reporting
* Additional external testing integrations

---

## 16.4 Reporting Improvements

Potential improvements:

* Additional dashboards
* Custom report configuration
* More advanced trend analysis
* Release-level quality analytics
* Historical quality comparisons
* Additional export formats

---

## 16.5 Collaboration

Potential improvements:

* Team collaboration features
* Comments
* Mentions
* Notifications
* Activity feeds
* Approval workflows

---

## 16.6 Deployment & DevOps

Potential improvements:

* Automated deployment pipelines
* Environment promotion workflows
* Improved deployment monitoring
* Additional cloud integrations
* Infrastructure automation

---

# 17. Long-Term Direction

The long-term goal of QA Book is to provide a unified workspace where QA teams can manage the complete testing lifecycle:

```text id="cn5sqa"
Requirement
     ↓
Scenario
     ↓
Test Case
     ↓
Test Suite
     ↓
Test Run
     ↓
Execution
     ↓
Bug
     ↓
Retest
     ↓
Automation
     ↓
CI/CD
     ↓
Reporting
```

AI assistance is intended to reduce repetitive QA work while keeping generated artifacts connected to the underlying QA lifecycle.

---

# 18. Roadmap Principle

Future development should prioritize:

1. Reliability of existing workflows
2. Test coverage
3. Automation stability
4. Traceability
5. AI usefulness
6. Reporting accuracy
7. Security
8. Developer experience
9. Deployment reliability
10. Additional integrations

The roadmap is intentionally iterative so that new functionality can be added without breaking the existing QA lifecycle.
