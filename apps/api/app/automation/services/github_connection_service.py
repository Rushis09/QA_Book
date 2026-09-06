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
        Generate the QABook automation framework and push it
        to a new or already-connected GitHub repository.

        The generated repository is also configured for
        QABook GitHub Actions CI/CD.
        """

        try:
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

            connection = (
                self.db.query(GitHubConnection)
                .filter(
                    GitHubConnection.automation_project_id
                    == automation_project_id
                )
                .first()
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

            user_access_token = (
                connection.github_access_token
            )

            repository_created = False

            if (
                automation_project.repository_url
                and connection.repository_owner
                and connection.repository_name
            ):
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

            else:
                repository_name = (
                    self._build_repository_name(
                        automation_project
                    )
                )

                repository = (
                    self.github_api.create_repository(
                        user_access_token=user_access_token,
                        repository_name=repository_name,
                        description=(
                            "QABook automation framework "
                            f"for {automation_project.name}"
                        ),
                        private=True,
                    )
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

                repository_created = True

            # A CI secret can only be generated when there is
            # no existing secret hash. This prevents silently
            # invalidating an already configured repository.
            if automation_project.ci_secret_hash:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "QABook CI/CD is already configured "
                        "for this automation project."
                    ),
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
                "automation_project_id": (
                    automation_project.id
                ),
                "github_connection_id": (
                    connection.id
                ),
                "repository_owner": (
                    repository_owner
                ),
                "repository_name": (
                    repository_name
                ),
                "branch": branch,
                "repository_url": repository_url,
                "repository_created": repository_created,
                "message": (
                    "Automation framework generated, "
                    "GitHub Actions configured, and framework "
                    "pushed to GitHub successfully."
                ),
            }

        except Exception:
            self.db.rollback()
            raise

    def _configure_github_actions(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        ci_secret: str,
    ) -> None:
        """
        Configure the GitHub Actions repository secrets
        required by the generated QABook workflow.
        """

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
            or "http://127.0.0.1:8000"
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
        """
        Extract the generated ZIP and push
        every framework file to GitHub.
        """

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
        """
        Build a safe GitHub repository name from
        the Automation Project name.
        """

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

        name = name.strip(
            ".-"
        )

        if not name:
            name = "qabook-automation"

        if not name.endswith(
            "-automation"
        ):
            name = f"{name}-automation"

        return name[:100]