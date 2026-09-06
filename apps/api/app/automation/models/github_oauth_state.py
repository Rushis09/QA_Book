from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class GitHubOAuthState(Base):
    __tablename__ = "github_oauth_states"

    id = Column(Integer, primary_key=True, index=True)

    state = Column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )

    admin_id = Column(
        Integer,
        ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=False,
    )

    automation_project_id = Column(
        Integer,
        ForeignKey(
            "automation_projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    admin = relationship("Admin")

    automation_project = relationship(
        "AutomationProject"
    )