from pydantic import BaseModel


class CIRunRequest(BaseModel):
    automation_project_id: int
    repository: str
    commit_sha: str
    event_type: str
    run_id: int | None = None


class CIRunResponse(BaseModel):
    test_run_id: int
    automation_token: str
    test_files: list[str]