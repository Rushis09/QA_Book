from fastapi import FastAPI
from app.api.dashboard import (
    router as dashboard_router,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.projects import router as project_router
from app.api.requirements import router as requirement_router
from app.api.test_cases import router as test_case_router
from app.api.test_scenarios import router as test_scenario_router
from app.api.test_suites import router as test_suite_router
from app.api.test_runs import router as test_run_router
from app.api.test_executions import router as test_execution_router
from app.api.bugs import router as bug_router
from app.api.reports import (router as report_router)
from app.api import exports
from app.automation.api.automation_project import (
    router as automation_project_router,
)
from app.automation.api.automation_test_mapping import (
    router as automation_test_mapping_router,
)
from app.automation.api.framework import (
    router as framework_router,
)


# Import models so SQLAlchemy registers all ORM mappings
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_scenario import TestScenario
from app.models.test_suite import TestSuite
from app.models.suite_test_case import SuiteTestCase
from app.models.test_run import TestRun
from app.models.test_execution import TestExecution
from app.models.bug import Bug
from app.models.bug_retest import BugRetest
from app.models.admin import Admin
from app.auth.router import router as auth_router
from app.ai.router import router as ai_router
from app.api.ai_requirements import (
    router as ai_requirement_router,
)
from app.api import ai_scenarios
from app.api import ai_test_cases
from app.api.documents import router as document_router
from app.automation.models.automation_project import AutomationProject
from app.automation.models.automation_test_mapping import AutomationTestMapping


app = FastAPI(
    title="QABook API",
    description="AI-Powered Manual Testing Workspace",
    version="0.1.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://qa-book.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(automation_project_router)
app.include_router(automation_test_mapping_router)
app.include_router(framework_router)
app.include_router(ai_requirement_router)
app.include_router(ai_scenarios.router)
app.include_router(ai_test_cases.router)
app.include_router(ai_router)
app.include_router(exports.router)
app.include_router(dashboard_router)
app.include_router(project_router)
app.include_router(document_router)
app.include_router(requirement_router)
app.include_router(test_scenario_router)
app.include_router(test_case_router)
app.include_router(test_suite_router)
app.include_router(test_run_router)
app.include_router(test_execution_router)
app.include_router(bug_router)
app.include_router(report_router)



@app.get("/")
def root():
    return {
        "application": "QABook",
        "version": "0.1.0",
        "status": "Running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    upload_schema = (
        openapi_schema
        .get("paths", {})
        .get("/documents/upload", {})
        .get("post", {})
        .get("requestBody", {})
        .get("content", {})
        .get("multipart/form-data", {})
        .get("schema", {})
    )

    if "$ref" in upload_schema:
        schema_name = upload_schema["$ref"].split("/")[-1]

        document_schema = (
            openapi_schema
            .get("components", {})
            .get("schemas", {})
            .get(schema_name)
        )

        if document_schema and "properties" in document_schema:
            file_schema = document_schema["properties"].get("file")

            if file_schema:
                file_schema.pop("contentMediaType", None)
                file_schema["format"] = "binary"

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi