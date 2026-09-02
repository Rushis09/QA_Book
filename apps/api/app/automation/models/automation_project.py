from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class AutomationProject(Base):
    __tablename__ = "automation_projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        unique=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    framework = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="Active",
    )

    repository_url = Column(
        String(500),
        nullable=True,
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

    project = relationship(
        "Project",
    )

    mappings = relationship(
        "AutomationTestMapping",
        back_populates="automation_project",
        cascade="all, delete-orphan",
    )