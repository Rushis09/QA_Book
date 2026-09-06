import os
import re
from io import BytesIO
from zipfile import ZipFile

from fastapi import HTTPException, status
from nacl import encoding, public
from sqlalchemy.orm import Session, selectinload

from app.automation.models.automation_project import (
    AutomationProject,
)
from app.automation.models.github_connection import (
    GitHubConnection,
)
from app.automation.repositories.automation_project_repository import (
    AutomationProjectRepository,
)
from app.automation.services.automation_project_service import (
    AutomationProjectService,
)
from app.automation.services.framework_generator_service import (
    FrameworkGeneratorService,
)
from app.automation.services.github_api_service import (
    GitHubAPIService,
)


class GitHubConnectionService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repository = AutomationProjectRepository(db)
        self.github_api = GitHubAPIService()
        self.framework_generator = FrameworkGeneratorService()
        self.automation_project_service = (
            AutomationProjectService(db)
        )

    def generate_and_push_framework(
        self,
        automation_project_id: int,
        admin_id: int,
    ) -> dict:
        """
        Perform the one-time initial framework generation.

        Initial generation creates the GitHub repository,
        pushes the framework, configures GitHub Actions,
        and permanently connects the repository to the
        Automation Project.
        """

        try:
            automation_project = (
                self._get_authorized_automation_project(
                    automation_project_id,
                    admin_id,
                )
            )

            if automation_project.repository_url:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Automation framework has already been "
                        "generated. Use Sync Repository for "
                        "subsequent mapping changes."
                    ),
                )

            if automation_project.ci_secret_hash:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "QABook CI/CD is already configured "
                        "for this automation project."
                    ),
                )

            connection = self._get_github_connection(
                automation_project_id
            )

            if not connection:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "GitHub is not connected. "
                        "Connect GitHub before generating "
                        "the framework."
                    ),
                )

            if not connection.github_access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "GitHub authorization is incomplete. "
                        "Please reconnect GitHub."
                    ),
                )

            user_access_token = connection.github_access_token

            repository_name = self._build_repository_name(
                automation_project
            )

            repository = self.github_api.create_repository(
                user_access_token=user_access_token,
                repository_name=repository_name,
                description=(
                    "QABook automation framework "
                    f"for {automation_project.name}"
                ),
                private=True,
            )

            repository_owner = repository[
                "owner"
            ]["login"]

            repository_name = repository[
                "name"
            ]

            branch = (
                repository.get("default_branch")
                or "main"
            )

            ci_secret = (
                self.automation_project_service
                .generate_ci_secret(
                    automation_project_id,
                    commit=False,
                )
            )

            buffer = self.framework_generator.generate(
                automation_project
            )

            self._push_framework_files(
                buffer=buffer,
                user_access_token=user_access_token,
                repository_owner=repository_owner,
                repository_name=repository_name,
                branch=branch,
            )

            self._configure_github_actions(
                user_access_token=user_access_token,
                repository_owner=repository_owner,
                repository_name=repository_name,
                ci_secret=ci_secret,
            )

            repository_url = (
                f"https://github.com/"
                f"{repository_owner}/"
                f"{repository_name}"
            )

            automation_project.repository_url = (
                repository_url
            )

            connection.github_username = (
                connection.github_username
                or repository_owner
            )
            connection.repository_owner = (
                repository_owner
            )
            connection.repository_name = (
                repository_name
            )
            connection.branch = branch

            self.db.commit()

            return {
                "automation_project_id": automation_project.id,
                "github_connection_id": connection.id,
                "repository_owner": repository_owner,
                "repository_name": repository_name,
                "branch": branch,
                "repository_url": repository_url,
                "repository_created": True,
                "message": (
                    "Automation framework generated, "
                    "GitHub Actions configured, and framework "
                    "pushed to GitHub successfully."
                ),
            }

        except Exception:
            self.db.rollback()
            raise

    def sync_framework(
        self,
        automation_project_id: int,
        admin_id: int,
    ) -> dict:
        """
        Synchronize newly mapped automation test cases into
        the existing GitHub repository.

        Existing test files are never overwritten.
        The QABook manifest is always refreshed.
        """

        try:
            automation_project = (
                self._get_authorized_automation_project(
                    automation_project_id,
                    admin_id,
                )
            )

            if not automation_project.repository_url:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Automation framework has not been "
                        "generated yet."
                    ),
                )

            connection = self._get_github_connection(
                automation_project_id
            )

            if not connection:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "GitHub connection is not configured."
                    ),
                )

            if not connection.github_access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "GitHub authorization is incomplete. "
                        "Please reconnect GitHub."
                    ),
                )

            if (
                not connection.repository_owner
                or not connection.repository_name
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "GitHub repository is not configured "
                        "for this automation project."
                    ),
                )

            repository_owner = (
                connection.repository_owner
            )

            repository_name = (
                connection.repository_name
            )

            branch = (
                connection.branch
                or "main"
            )

            buffer = self.framework_generator.generate(
                automation_project
            )

            result = self._sync_framework_files(
                buffer=buffer,
                user_access_token=(
                    connection.github_access_token
                ),
                repository_owner=repository_owner,
                repository_name=repository_name,
                branch=branch,
            )

            self.db.commit()

            repository_url = (
                f"https://github.com/"
                f"{repository_owner}/"
                f"{repository_name}"
            )

            return {
                "automation_project_id": automation_project.id,
                "github_connection_id": connection.id,
                "repository_owner": repository_owner,
                "repository_name": repository_name,
                "branch": branch,
                "repository_url": repository_url,
                "created_test_files": (
                    result["created_test_files"]
                ),
                "skipped_test_files": (
                    result["skipped_test_files"]
                ),
                "manifest_updated": (
                    result["manifest_updated"]
                ),
                "message": (
                    "Automation repository synchronized "
                    "successfully."
                ),
            }

        except Exception:
            self.db.rollback()
            raise

    def _sync_framework_files(
        self,
        buffer: BytesIO,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        branch: str,
    ) -> dict:
        """
        Sync only QABook-managed mapping information.

        Existing test files are preserved.
        New test files are created.
        The manifest is refreshed.
        """

        created_test_files: list[str] = []
        skipped_test_files: list[str] = []
        manifest_updated = False

        buffer.seek(0)

        with ZipFile(buffer, "r") as zip_file:
            for zip_info in zip_file.infolist():
                if zip_info.is_dir():
                    continue

                file_path = (
                    zip_info.filename
                    .replace("\\", "/")
                    .lstrip("/")
                )

                content = zip_file.read(
                    zip_info
                ).decode("utf-8")

                if file_path.startswith("tests/"):
                    result = self.github_api.upload_file(
                        user_access_token=user_access_token,
                        repository_owner=repository_owner,
                        repository_name=repository_name,
                        file_path=file_path,
                        content=content,
                        branch=branch,
                        commit_message=(
                            "Sync QABook automation test mappings"
                        ),
                        overwrite_existing=False,
                    )

                    if result.get("skipped"):
                        skipped_test_files.append(
                            file_path
                        )
                    else:
                        created_test_files.append(
                            file_path
                        )

                    continue

                if file_path == "qabook/manifest.json":
                    self.github_api.upload_file(
                        user_access_token=user_access_token,
                        repository_owner=repository_owner,
                        repository_name=repository_name,
                        file_path=file_path,
                        content=content,
                        branch=branch,
                        commit_message=(
                            "Update QABook automation manifest"
                        ),
                        overwrite_existing=True,
                    )

                    manifest_updated = True

        return {
            "created_test_files": created_test_files,
            "skipped_test_files": skipped_test_files,
            "manifest_updated": manifest_updated,
        }

    def _get_authorized_automation_project(
        self,
        automation_project_id: int,
        admin_id: int,
    ) -> AutomationProject:
        automation_project = (
            self.db.query(AutomationProject)
            .options(
                selectinload(
                    AutomationProject.mappings
                )
            )
            .filter(
                AutomationProject.id
                == automation_project_id
            )
            .first()
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found.",
            )

        if (
            automation_project.project.admin_id
            != admin_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have access to this "
                    "automation project."
                ),
            )

        return automation_project

    def _get_github_connection(
        self,
        automation_project_id: int,
    ) -> GitHubConnection | None:
        return (
            self.db.query(GitHubConnection)
            .filter(
                GitHubConnection.automation_project_id
                == automation_project_id
            )
            .first()
        )

    def _configure_github_actions(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        ci_secret: str,
    ) -> None:
        public_key = (
            self.github_api.get_actions_public_key(
                user_access_token=user_access_token,
                repository_owner=repository_owner,
                repository_name=repository_name,
            )
        )

        key = public.PublicKey(
            public_key["key"].encode("utf-8"),
            encoding.Base64Encoder,
        )

        encrypted_ci_secret = (
            public.SealedBox(key).encrypt(
                ci_secret.encode("utf-8")
            )
        )

        encrypted_ci_secret = (
            encoding.Base64Encoder
            .encode(encrypted_ci_secret)
            .decode("utf-8")
        )

        self.github_api.create_or_update_actions_secret(
            user_access_token=user_access_token,
            repository_owner=repository_owner,
            repository_name=repository_name,
            secret_name="QABOOK_CI_SECRET",
            encrypted_value=encrypted_ci_secret,
            key_id=public_key["key_id"],
        )

        qabook_api_url = (
            os.getenv("QABOOK_API_URL")
            or os.getenv("API_URL")
        )

        if not qabook_api_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "QABOOK_API_URL is not configured on the server. "
                    "GitHub Actions cannot be configured."
                ),
            )

        encrypted_api_url = (
            public.SealedBox(key).encrypt(
                qabook_api_url.encode("utf-8")
            )
        )

        encrypted_api_url = (
            encoding.Base64Encoder
            .encode(encrypted_api_url)
            .decode("utf-8")
        )

        self.github_api.create_or_update_actions_secret(
            user_access_token=user_access_token,
            repository_owner=repository_owner,
            repository_name=repository_name,
            secret_name="QABOOK_API_URL",
            encrypted_value=encrypted_api_url,
            key_id=public_key["key_id"],
        )

    def _push_framework_files(
        self,
        buffer: BytesIO,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        branch: str,
    ) -> None:
        buffer.seek(0)

        with ZipFile(buffer, "r") as zip_file:
            for zip_info in zip_file.infolist():
                if zip_info.is_dir():
                    continue

                file_path = zip_info.filename

                content = zip_file.read(
                    zip_info
                ).decode("utf-8")

                self.github_api.upload_file(
                    user_access_token=user_access_token,
                    repository_owner=repository_owner,
                    repository_name=repository_name,
                    file_path=file_path,
                    content=content,
                    branch=branch,
                    commit_message=(
                        "Generate QABook automation framework"
                    ),
                )

    @staticmethod
    def _build_repository_name(
        automation_project: AutomationProject,
    ) -> str:
        name = (
            automation_project.name
            or "qabook-automation"
        )

        name = name.strip().lower()

        name = re.sub(
            r"[^a-z0-9._-]+",
            "-",
            name,
        )

        name = re.sub(
            r"-+",
            "-",
            name,
        )

        name = name.strip(".-")

        if not name:
            name = "qabook-automation"

        if not name.endswith("-automation"):
            name = f"{name}-automation"

        return name[:100]