# QA Book API

## Overview

QA Book exposes a RESTful API built with FastAPI.

Interactive API documentation is automatically generated using Swagger UI and OpenAPI.

---

# Development

Swagger UI

```
http://localhost:8000/docs
```

OpenAPI JSON

```
http://localhost:8000/openapi.json
```

---

# Production

Swagger UI

```
https://qabook-api.onrender.com/docs
```

OpenAPI JSON

```
https://qabook-api.onrender.com/openapi.json
```

---

# Available Modules

Current API modules include:

- Dashboard
- Projects
- Requirements
- Test Scenarios
- Test Cases
- Test Suites
- Test Runs
- Test Executions
- Bugs
- Reports
- Exports

---

# API Design

The API follows REST principles.

Typical operations include:

- GET
- POST
- PUT
- DELETE

Responses are JSON.

---

# Validation

Request validation is handled using:

- Pydantic
- FastAPI

---

# Error Handling

Typical HTTP status codes:

| Code | Meaning |
|------|----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# Future Enhancements

Planned improvements include:

- JWT Authentication
- API Versioning
- Rate Limiting
- Pagination
- Filtering
- Sorting
- Search