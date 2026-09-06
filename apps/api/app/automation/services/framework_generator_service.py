import json
import re
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile

from app.automation.models.automation_project import (
    AutomationProject,
)


class FrameworkGeneratorService:
    def generate(
        self,
        automation_project: AutomationProject,
    ) -> BytesIO:
        buffer = BytesIO()

        with ZipFile(
            buffer,
            "w",
            ZIP_DEFLATED,
        ) as zip_file:
            # Root files
            self._add_file(
                zip_file,
                "README.md",
                self._readme_content(
                    automation_project
                ),
            )

            self._add_file(
                zip_file,
                "requirements.txt",
                self._requirements_content(),
            )

            self._add_file(
                zip_file,
                "pytest.ini",
                self._pytest_ini_content(),
            )

            self._add_file(
                zip_file,
                "conftest.py",
                self._conftest_content(),
            )

            self._add_file(
                zip_file,
                ".env.example",
                self._env_example_content(),
            )

            self._add_file(
                zip_file,
                ".gitignore",
                self._gitignore_content(),
            )

            # GitHub Actions
            self._add_file(
                zip_file,
                ".github/workflows/qabook.yml",
                self._github_workflow_content(
                    automation_project
                ),
            )

            # QABook metadata
            self._add_file(
                zip_file,
                "qabook/__init__.py",
                "",
            )

            self._add_file(
                zip_file,
                "qabook/manifest.json",
                self._manifest_content(
                    automation_project
                ),
            )

            # Pages
            self._add_file(
                zip_file,
                "pages/__init__.py",
                "",
            )

            self._add_file(
                zip_file,
                "pages/base_page.py",
                self._base_page_content(),
            )

            # Fixtures
            self._add_file(
                zip_file,
                "fixtures/__init__.py",
                "",
            )

            # Utils
            self._add_file(
                zip_file,
                "utils/__init__.py",
                "",
            )

            self._add_file(
                zip_file,
                "utils/config.py",
                self._config_content(),
            )

            self._add_file(
                zip_file,
                "utils/manifest.py",
                self._manifest_loader_content(),
            )

            self._add_file(
                zip_file,
                "utils/qabook_client.py",
                self._qabook_client_content(),
            )

            # Tests
            self._add_file(
                zip_file,
                "tests/__init__.py",
                "",
            )

            self._add_file(
                zip_file,
                "tests/ui/__init__.py",
                "",
            )

            # Test data and reports
            self._add_file(
                zip_file,
                "test_data/.gitkeep",
                "",
            )

            self._add_file(
                zip_file,
                "reports/.gitkeep",
                "",
            )

            # Generate mapped tests
            for mapping in automation_project.mappings:
                self._add_test_file(
                    zip_file,
                    mapping.test_file_path,
                    mapping.test_name,
                )

        buffer.seek(0)

        return buffer

    @staticmethod
    def _add_file(
        zip_file: ZipFile,
        file_path: str,
        content: str,
    ) -> None:
        zip_file.writestr(
            file_path,
            content,
        )

    def _add_test_file(
        self,
        zip_file: ZipFile,
        file_path: str,
        test_name: str,
    ) -> None:
        safe_path = file_path.replace(
            "\\",
            "/",
        ).lstrip("/")

        if ".." in safe_path.split("/"):
            return

        # Automation test files must remain inside tests/.
        if not safe_path.startswith("tests/"):
            safe_path = f"tests/{safe_path}"

        file_name = safe_path.split("/")[-1]

        if not file_name.endswith(".py"):
            file_name = f"{file_name}.py"

        safe_path = (
            "/".join(safe_path.split("/")[:-1])
            + "/"
            + file_name
        )

        safe_test_name = re.sub(
            r"[^0-9a-zA-Z_]",
            "_",
            test_name,
        )

        if safe_test_name and safe_test_name[0].isdigit():
            safe_test_name = f"test_{safe_test_name}"

        content = f'''import pytest


@pytest.mark.automation
def {safe_test_name}():
    """
    Automation placeholder generated by QABook.

    Implement the actual Playwright test here.
    """
    pytest.skip(
        "Automation test not implemented yet."
    )
'''

        self._add_file(
            zip_file,
            safe_path,
            content,
        )

    @staticmethod
    def _manifest_content(
        automation_project: AutomationProject,
    ) -> str:
        tests = []

        for mapping in automation_project.mappings:
            safe_path = mapping.test_file_path.replace(
                "\\",
                "/",
            ).lstrip("/")

            if ".." in safe_path.split("/"):
                continue

            if not safe_path.startswith("tests/"):
                safe_path = f"tests/{safe_path}"

            file_name = safe_path.split("/")[-1]

            if not file_name.endswith(".py"):
                file_name = f"{file_name}.py"

            safe_path = (
                "/".join(safe_path.split("/")[:-1])
                + "/"
                + file_name
            )

            tests.append(
                {
                    "test_case_id": mapping.test_case_id,
                    "file": safe_path,
                }
            )

        return json.dumps(
            {
                "tests": tests,
            },
            indent=2,
        ) + "\n"

    @staticmethod
    def _readme_content(
        automation_project: AutomationProject,
    ) -> str:
        return f"""# {automation_project.name}

Automation framework generated by QABook.

## Framework

Python + pytest + Playwright

## Project Structure

    .
    ├── .github/
    │   └── workflows/
    │       └── qabook.yml
    ├── tests/
    │   └── ui/
    ├── pages/
    ├── fixtures/
    ├── utils/
    ├── qabook/
    │   ├── __init__.py
    │   └── manifest.json
    ├── test_data/
    ├── reports/
    ├── conftest.py
    ├── pytest.ini
    ├── requirements.txt
    ├── .env.example
    ├── .gitignore
    └── README.md

## Setup

Create and activate a virtual environment:

    python -m venv .venv

### Windows

    .venv\\Scripts\\activate

### Linux/macOS

    source .venv/bin/activate

Install dependencies:

    pip install -r requirements.txt

Install Playwright browsers:

    playwright install

## Environment

Copy `.env.example` to `.env` and configure the test environment.

Example:

    BASE_URL=https://example.com
    QABOOK_API_URL=http://127.0.0.1:8000

For normal local development, no QABook
automation token is required.

## Run Tests Locally

Run all automation tests:

    pytest

Run only automation tests:

    pytest -m automation

Local execution does not send results to QABook.

## CI/CD

Pushing changes to the GitHub repository automatically
starts the QABook GitHub Actions workflow.

The workflow:

1. Authenticates with QABook.
2. Creates or obtains the appropriate QABook Test Run.
3. Receives the execution context.
4. Runs the mapped automation tests.
5. Reports Passed/Failed results back to QABook.

The QABook CI authentication value is stored as a
GitHub Actions repository secret.

It must never be committed to the repository.

## QABook Integration

This framework uses QABook Test Cases as the
business reference.

Automation mappings are represented in:

    qabook/manifest.json

The manifest maintains the relationship between a
QABook Test Case ID and its automation test file.

Example:

    {{
      "tests": [
        {{
          "test_case_id": 95,
          "file": "tests/tc-002.py"
        }}
      ]
    }}

QABook-specific Test Case IDs are intentionally kept
outside the automation test source code.

During CI/CD execution, QABook supplies the execution
context and automation token at runtime.

The token is never stored in the repository.

## Page Objects

Reusable UI page behavior should be implemented inside:

    pages/

The `BasePage` class provides common Playwright page
operations that can be shared by page objects.

## Test Data

Test data can be stored inside:

    test_data/

## Reports

Generated reports and execution artifacts can be stored
inside:

    reports/

QABook also stores execution-level results so they can
be displayed in the QABook Reports workspace.
"""

    @staticmethod
    def _requirements_content() -> str:
        return """pytest
playwright
pytest-playwright
python-dotenv
requests
"""

    @staticmethod
    def _pytest_ini_content() -> str:
        return """[pytest]
testpaths = tests

python_files =
    test_*.py
    *_test.py
    tc*.py

markers =
    automation: QABook automation tests
"""

    @staticmethod
    def _conftest_content() -> str:
        return '''import os
from pathlib import Path

import pytest
from dotenv import load_dotenv

from utils.manifest import get_test_case_id_for_file
from utils.qabook_client import QABookClient


load_dotenv()


@pytest.fixture(scope="session")
def base_url():
    return os.getenv(
        "BASE_URL",
        "https://example.com",
    )


def pytest_addoption(parser):
    parser.addoption(
        "--qabook-token",
        action="store",
        default=None,
        help="Optional QABook automation token override.",
    )


@pytest.fixture(scope="session")
def qabook_token(pytestconfig):
    """
    Resolve the QABook automation token.

    Priority:
    1. Explicit --qabook-token CLI option
    2. QABOOK_AUTOMATION_TOKEN environment variable

    Normal local execution does not require either.
    """
    cli_token = pytestconfig.getoption(
        "--qabook-token"
    )

    if cli_token:
        return cli_token

    return os.getenv(
        "QABOOK_AUTOMATION_TOKEN"
    )


@pytest.fixture(scope="session")
def qabook_executions(qabook_token):
    """
    Load all QABook Test Executions belonging
    to the current automation Test Run.
    """
    if not qabook_token:
        return []

    client = QABookClient()

    return client.get_executions_by_token(
        qabook_token,
    )


@pytest.fixture
def qabook_test_case_id(request):
    """
    Resolve the QABook Test Case ID for the
    current pytest test through manifest.json.
    """
    test_file = Path(
        request.node.fspath
    ).resolve()

    project_root = Path(
        request.config.rootdir
    ).resolve()

    try:
        relative_file = test_file.relative_to(
            project_root
        )
    except ValueError:
        return None

    return get_test_case_id_for_file(
        relative_file.as_posix()
    )


@pytest.fixture
def qabook_client():
    """
    Provide a QABook API client.
    """
    return QABookClient()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(
    item,
    call,
):
    """
    Capture the final pytest test report.
    """
    outcome = yield

    report = outcome.get_result()

    if report.when == "call":
        item.qabook_test_report = report


def pytest_runtest_teardown(
    item,
    nextitem,
):
    """
    Report automation results to QABook.

    QABook reporting is completely disabled when
    no automation token is supplied.
    """
    token = item.config.getoption(
        "--qabook-token"
    ) or os.getenv(
        "QABOOK_AUTOMATION_TOKEN"
    )

    if not token:
        return

    report = getattr(
        item,
        "qabook_test_report",
        None,
    )

    if report is None:
        return

    test_file = Path(
        item.fspath
    ).resolve()

    project_root = Path(
        item.config.rootdir
    ).resolve()

    try:
        relative_file = test_file.relative_to(
            project_root
        )
    except ValueError:
        return

    test_case_id = get_test_case_id_for_file(
        relative_file.as_posix()
    )

    if test_case_id is None:
        return

    client = QABookClient()

    execution = client.get_execution_by_token_and_test_case(
        token,
        test_case_id,
    )

    if report.passed:
        execution_status = "Passed"
    elif report.failed:
        execution_status = "Failed"
    elif report.skipped:
        execution_status = "Blocked"
    else:
        return

    client.update_test_execution(
        execution["id"],
        execution_status,
    )
'''

    @staticmethod
    def _manifest_loader_content() -> str:
        return """import json
from pathlib import Path


MANIFEST_PATH = (
    Path(__file__).resolve().parent.parent
    / "qabook"
    / "manifest.json"
)


def load_manifest() -> list[dict]:
    if not MANIFEST_PATH.exists():
        return []

    with MANIFEST_PATH.open(
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    return data.get("tests", [])


def get_test_case_id_for_file(
    test_file: str,
) -> int | None:
    normalized_file = test_file.replace(
        "\\\\",
        "/",
    ).lstrip("./")

    for item in load_manifest():
        manifest_file = item.get("file", "")

        manifest_file = manifest_file.replace(
            "\\\\",
            "/",
        ).lstrip("./")

        if manifest_file == normalized_file:
            return item.get("test_case_id")

    return None
"""

    @staticmethod
    def _base_page_content() -> str:
        return """from playwright.sync_api import Page


class BasePage:
    def __init__(self, page: Page):
        self.page = page

    def navigate(self, url: str) -> None:
        self.page.goto(url)

    def get_title(self) -> str:
        return self.page.title()
"""

    @staticmethod
    def _config_content() -> str:
        return """import os


BASE_URL = os.getenv(
    "BASE_URL",
    "https://example.com",
)

QABOOK_API_URL = os.getenv(
    "QABOOK_API_URL",
    "http://127.0.0.1:8000",
)
"""

    @staticmethod
    def _qabook_client_content() -> str:
        return """import requests

from utils.config import QABOOK_API_URL


class QABookClient:
    def __init__(self):
        self.base_url = QABOOK_API_URL.rstrip("/")

    def get_executions_by_token(
        self,
        automation_token: str,
    ):
        response = requests.get(
            f"{self.base_url}/test-executions/token/"
            f"{automation_token}",
            timeout=30,
        )

        response.raise_for_status()

        return response.json()

    def get_execution_by_token_and_test_case(
        self,
        automation_token: str,
        test_case_id: int,
    ):
        response = requests.get(
            f"{self.base_url}/test-executions/token/"
            f"{automation_token}/test-case/{test_case_id}",
            timeout=30,
        )

        response.raise_for_status()

        return response.json()

    def update_test_execution(
        self,
        execution_id: int,
        status: str,
    ):
        response = requests.put(
            f"{self.base_url}/test-executions/{execution_id}",
            json={
                "status": status,
            },
            timeout=30,
        )

        response.raise_for_status()

        return response.json()
"""

    @staticmethod
    def _env_example_content() -> str:
        return """BASE_URL=https://example.com
QABOOK_API_URL=http://127.0.0.1:8000
"""

    @staticmethod
    def _gitignore_content() -> str:
        return """# Python
__pycache__/
*.py[cod]
*.pyo
*.pyd

# Virtual environment
.venv/
venv/
env/

# Environment files
.env

# Playwright
test-results/
playwright-report/
blob-report/

# Reports and artifacts
reports/*
!reports/.gitkeep

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
"""

    @staticmethod
    def _github_workflow_content(
        automation_project: AutomationProject,
    ) -> str:
        return f"""name: QABook Automation

on:
  push:
    branches:
      - "**"

  repository_dispatch:
    types:
      - qabook-retest

permissions:
  contents: read

jobs:
  automation:
    name: Run QABook Automation
    runs-on: ubuntu-latest

    env:
      QABOOK_API_URL: ${{{{ secrets.QABOOK_API_URL }}}}
      QABOOK_CI_SECRET: ${{{{ secrets.QABOOK_CI_SECRET }}}}
      QABOOK_AUTOMATION_PROJECT_ID: "{automation_project.id}"
      QABOOK_REPOSITORY: "${{{{ github.repository }}}}"
      QABOOK_COMMIT_SHA: "${{{{ github.sha }}}}"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Install Playwright browsers
        run: |
          playwright install --with-deps

      - name: Create QABook Test Run
        id: qabook_run
        shell: bash
        run: |
          set -euo pipefail

          response=$(curl --fail-with-body --silent --show-error \\
            --request POST \\
            --header "Content-Type: application/json" \\
            --header "X-QABook-CI-Secret: $QABOOK_CI_SECRET" \\
            --data "{{
              \\"automation_project_id\\": $QABOOK_AUTOMATION_PROJECT_ID,
              \\"repository\\": \\"$QABOOK_REPOSITORY\\",
              \\"commit_sha\\": \\"$QABOOK_COMMIT_SHA\\",
              \\"event_type\\": \\"${{{{ github.event_name }}}}\\",
              \\"retest_run_id\\": \\"${{{{ github.event.client_payload.run_id || '' }}}}\\"
            }}" \\
            "$QABOOK_API_URL/automation-projects/$QABOOK_AUTOMATION_PROJECT_ID/ci/run")

          echo "$response" > qabook-run.json

          python - <<'PY'
          import json
          import os

          with open("qabook-run.json", "r", encoding="utf-8") as file:
              data = json.load(file)

          token = data.get("automation_token")
          test_files = data.get("test_files", [])

          if not token:
              raise SystemExit(
                  "QABook did not return an automation token."
              )

          with open(
              os.environ["GITHUB_OUTPUT"],
              "a",
              encoding="utf-8",
          ) as output:
              output.write(f"automation_token={{token}}\\n")
              output.write(
                  "test_files="
                  + json.dumps(test_files)
                  + "\\n"
              )
          PY

      - name: Run automation tests
        env:
          QABOOK_AUTOMATION_TOKEN: ${{{{ steps.qabook_run.outputs.automation_token }}}}
        shell: bash
        run: |
          set -euo pipefail

          python - <<'PY'
          import json
          import os
          import subprocess
          import sys

          with open("qabook-run.json", "r", encoding="utf-8") as file:
              data = json.load(file)

          test_files = data.get("test_files", [])

          if not test_files:
              raise SystemExit(
                  "QABook returned no test files for this execution."
              )

          command = [
              sys.executable,
              "-m",
              "pytest",
              *test_files,
          ]

          result = subprocess.run(command)

          raise SystemExit(result.returncode)
          PY
"""