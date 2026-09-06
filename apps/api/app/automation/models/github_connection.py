from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class GitHubConnection(Base):
    __tablename__ = "github_connections"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    automation_project_id = Column(
        Integer,
        ForeignKey(
            "automation_projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    installation_id = Column(
        String(100),
        nullable=False,
    )

    # GitHub account that authorized QABook
    github_username = Column(
        String(100),
        nullable=True,
    )

    # OAuth user access token.
    # Stored as Text because GitHub token length can vary.
    github_access_token = Column(
        Text,
        nullable=True,
    )

    # OAuth refresh token, when GitHub provides one.
    github_refresh_token = Column(
        Text,
        nullable=True,
    )

    access_token_expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    refresh_token_expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    repository_owner = Column(
        String(100),
        nullable=True,
    )

    repository_name = Column(
        String(200),
        nullable=True,
    )

    branch = Column(
        String(200),
        nullable=False,
        default="main",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    automation_project = relationship(
        "AutomationProject",
        back_populates="github_connection",
    )