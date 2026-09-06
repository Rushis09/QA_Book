from pydantic import BaseModel, Field


class GitHubRepositorySelectRequest(BaseModel):
    repository_owner: str = Field(min_length=1, max_length=100)
    repository_name: str = Field(min_length=1, max_length=200)
    branch: str = Field(default="main", min_length=1, max_length=200)