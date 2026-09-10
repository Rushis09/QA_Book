from copy import deepcopy

from app.models.admin import Admin
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_scenario import TestScenario
from app.repositories.test_case_repository import TestCaseRepository
from app.services.test_case_service import TestCaseService
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate
from app.testing_studio.models import TestCaseTestingProfile
from app.testing_studio.schemas import (
    StudioTestCaseCreate,
    StudioTestCaseUpdate,
    validate_definition,
)
from app.testing_studio.constants import TestingType


class TestingStudioService:
    def __init__(self, db):
        self.db = db
        self.test_case_service = TestCaseService(TestCaseRepository(db))

    def _project_access(self, project_id: int, admin: Admin):
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")
        if admin.role != "PLATFORM_ADMIN" and project.admin_id != admin.id:
            raise ValueError("You do not have access to this project.")
        return project

    def _scenario_in_project(self, scenario_id: int, project_id: int):
        scenario = (
            self.db.query(TestScenario)
            .join(Requirement, TestScenario.requirement_id == Requirement.id)
            .filter(TestScenario.id == scenario_id, Requirement.project_id == project_id)
            .first()
        )
        if not scenario:
            raise ValueError("Test Scenario not found in this project")
        return scenario

    @staticmethod
    def _legacy_definition(test_case: TestCase) -> dict:
        steps = []
        if test_case.steps:
            lines = [line.strip() for line in test_case.steps.splitlines() if line.strip()]
            steps = [
                {"step_no": index, "action": line, "test_data": "", "expected_result": ""}
                for index, line in enumerate(lines, 1)
            ]
        return {
            "environment": "",
            "browser_os": [],
            "steps": steps,
            "legacy_preconditions": test_case.preconditions or "",
            "legacy_test_data": test_case.test_data or "",
            "legacy_expected_result": test_case.expected_result or "",
        }

    def _profile_response(self, test_case: TestCase):
        profile = test_case.testing_profile
        if profile:
            return profile
        return TestCaseTestingProfile(
            id=0,
            test_case_id=test_case.id,
            testing_type=TestingType.FUNCTIONAL.value,
            execution_method="MANUAL",
            meta_attributes=self._legacy_definition(test_case),
        )

    def list_test_cases(self, project_id: int, admin: Admin, testing_type: str | None = None):
        self._project_access(project_id, admin)
        query = (
            self.db.query(TestCase)
            .join(TestScenario, TestCase.scenario_id == TestScenario.id)
            .join(Requirement, TestScenario.requirement_id == Requirement.id)
            .filter(Requirement.project_id == project_id)
        )
        cases = query.order_by(TestCase.test_case_code).all()
        if testing_type:
            result = []
            for case in cases:
                profile = case.testing_profile
                case_type = profile.testing_type if profile else TestingType.FUNCTIONAL.value
                if case_type == testing_type:
                    result.append(case)
            return result
        return cases

    def get_case_for_admin(self, test_case_id: int, admin: Admin):
        case = self.db.query(TestCase).filter(TestCase.id == test_case_id).first()
        if not case:
            raise ValueError("Test Case not found")
        self.test_case_service._validate_test_case_access(case, admin)
        return case

    def get_case(self, project_id: int, test_case_id: int, admin: Admin):
        self._project_access(project_id, admin)
        case = self.db.query(TestCase).filter(TestCase.id == test_case_id).first()
        if not case:
            raise ValueError("Test Case not found")
        self._scenario_in_project(case.scenario_id, project_id)
        return case

    def create(self, project_id: int, payload: StudioTestCaseCreate, admin: Admin):
        self._project_access(project_id, admin)
        self._scenario_in_project(payload.scenario_id, project_id)
        attrs = validate_definition(payload.profile.testing_type, deepcopy(payload.profile.meta_attributes))

        core = TestCaseCreate(
            scenario_id=payload.scenario_id,
            module=payload.module,
            priority=payload.priority,
            status=payload.status,
            automation_eligibility=payload.automation_eligibility,
            automation_status=payload.automation_status,
            title=payload.title,
            description=payload.description,
            preconditions=payload.preconditions,
            test_data=payload.test_data,
            steps=payload.steps,
            expected_result=payload.expected_result,
        )
        case = self.test_case_service.create(core, admin)
        profile = TestCaseTestingProfile(
            test_case_id=case.id,
            testing_type=payload.profile.testing_type.value,
            execution_method=payload.profile.execution_method.value,
            meta_attributes=attrs,
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(case)
        return case

    def update(self, project_id: int, test_case_id: int, payload: StudioTestCaseUpdate, admin: Admin):
        case = self.get_case(project_id, test_case_id, admin)
        attrs = validate_definition(payload.profile.testing_type, deepcopy(payload.profile.meta_attributes))
        core = TestCaseUpdate(
            scenario_id=payload.scenario_id,
            module=payload.module,
            priority=payload.priority,
            status=payload.status,
            automation_eligibility=payload.automation_eligibility,
            automation_status=payload.automation_status,
            title=payload.title,
            description=payload.description,
            preconditions=payload.preconditions,
            test_data=payload.test_data,
            steps=payload.steps,
            expected_result=payload.expected_result,
        )
        self.test_case_service.update(case, core, admin)
        profile = case.testing_profile
        if not profile:
            profile = TestCaseTestingProfile(test_case_id=case.id)
            self.db.add(profile)
        profile.testing_type = payload.profile.testing_type.value
        profile.execution_method = payload.profile.execution_method.value
        profile.meta_attributes = attrs
        self.db.commit()
        self.db.refresh(case)
        return case

    def delete(self, project_id: int, test_case_id: int, admin: Admin):
        case = self.get_case(project_id, test_case_id, admin)
        self.db.delete(case)
        self.db.commit()

    def serialize(self, case: TestCase):
        profile = self._profile_response(case)
        return {
            "id": case.id,
            "test_case_code": case.test_case_code,
            "scenario_id": case.scenario_id,
            "module": case.module,
            "priority": case.priority,
            "status": case.status,
            "automation_eligibility": case.automation_eligibility,
            "automation_status": case.automation_status,
            "title": case.title,
            "description": case.description,
            "preconditions": case.preconditions,
            "test_data": case.test_data,
            "steps": case.steps,
            "expected_result": case.expected_result,
            "scenario_code": case.scenario.scenario_code if case.scenario else "",
            "scenario_title": case.scenario.title if case.scenario else "",
            "requirement_code": case.scenario.requirement.requirement_code if case.scenario and case.scenario.requirement else "",
            "profile": {
                "id": profile.id,
                "test_case_id": case.id,
                "testing_type": profile.testing_type,
                "execution_method": profile.execution_method,
                "meta_attributes": profile.meta_attributes or {},
                "created_at": profile.created_at or case.created_at,
                "updated_at": profile.updated_at or case.updated_at,
            },
            "created_at": case.created_at,
            "updated_at": case.updated_at,
        }
