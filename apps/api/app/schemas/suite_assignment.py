from pydantic import BaseModel


class SuiteAssignmentRequest(BaseModel):
    test_case_ids: list[int]