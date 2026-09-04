from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.bug import Bug
from app.models.bug_retest import BugRetest
from app.models.test_execution import TestExecution
from app.schemas.bug_retest import BugRetestCreate
from app.schemas.test_run import TestRunCreate
from app.services.test_run_service import TestRunService


class BugRetestService:
    def __init__(self, db: Session):
        self.db = db
        self.test_run_service = TestRunService(db)

    def create_retest(
        self,
        bug_id: int,
        data: BugRetestCreate,
    ):
        bug = (
            self.db.query(Bug)
            .filter(Bug.id == bug_id)
            .first()
        )

        if not bug:
            raise HTTPException(
                status_code=404,
                detail="Bug not found",
            )

        if bug.status not in {
            "Fixed",
            "Ready for QA",
        }:
            if bug.status == "Retesting":
                raise HTTPException(
                    status_code=400,
                    detail="Bug already has an active retest.",
                )
        
            raise HTTPException(
                status_code=400,
                detail=(
                    "Bug must be in Fixed or Ready for QA "
                    "status before creating a retest."
                ),
            )
        original_execution = self.db.get(
            TestExecution,
            bug.execution_id,
        )

        if not original_execution:
            raise HTTPException(
                status_code=404,
                detail="Original test execution not found",
            )

        original_run = self.test_run_service.get_test_run(
            original_execution.run_id,
        )

        test_case = original_execution.test_case

        if test_case not in original_run.suite.test_cases:
            raise HTTPException(
                status_code=400,
                detail="Bug test case is not part of the original test suite.",
            )

        execution_type = data.execution_type

        if execution_type not in {
            "Manual",
            "Automated",
        }:
            raise HTTPException(
                status_code=400,
                detail="Execution type must be Manual or Automated.",
            )

        try:
            test_run = self.test_run_service.create_test_run_pending_commit(
                TestRunCreate(
                    suite_id=original_run.suite_id,
                    name=f"Retest {bug.bug_code}",
                    build_version=original_run.build_version,
                    environment=original_run.environment,
                    tester=original_run.tester,
                    status="Not Started",
                    execution_type=execution_type,
                )
            )

            execution = TestExecution(
                run_id=test_run.id,
                test_case_id=test_case.id,
                status="Not Executed",
            )

            self.db.add(execution)
            self.db.flush()

            bug_retest = BugRetest(
                bug_id=bug.id,
                execution_id=execution.id,
            )

            self.db.add(bug_retest)

            bug.status = "Retesting"
            bug.resolution = None

            self.db.commit()

            retest = (
                self.db.query(BugRetest)
                .options(
                    selectinload(
                        BugRetest.execution
                    ).selectinload(
                        TestExecution.test_run
                    )
                )
                .filter(
                    BugRetest.id == bug_retest.id
                )
                .first()
            )

            if not retest:
                raise HTTPException(
                    status_code=404,
                    detail="Bug retest not found after creation.",
                )

            return retest

        except Exception:
            self.db.rollback()
            raise