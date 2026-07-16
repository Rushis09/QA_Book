from fastapi import FastAPI
from app.api.dashboard import (
    router as dashboard_router,
)
from fastapi.middleware.cors import CORSMiddleware

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
from app.models.admin import Admin
from app.auth.router import router as auth_router
from app.ai.router import router as ai_router
from app.api.ai_requirements import (
    router as ai_requirement_router,
)



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
app.include_router(ai_requirement_router)
app.include_router(ai_router)
app.include_router(exports.router)
app.include_router(dashboard_router)
app.include_router(project_router)
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