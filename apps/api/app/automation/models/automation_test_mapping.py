from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class AutomationTestMapping(Base):
    __tablename__ = "automation_test_mappings"

    __table_args__ = (
        UniqueConstraint(
            "automation_project_id",
            "test_case_id",
            name="uq_automation_project_test_case",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    automation_project_id = Column(
        Integer,
        ForeignKey("automation_projects.id"),
        nullable=False,
    )

    test_case_id = Column(
        Integer,
        ForeignKey("test_cases.id"),
        nullable=False,
    )

    test_name = Column(
        String(200),
        nullable=False,
    )

    test_file_path = Column(
        String(500),
        nullable=False,
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
        back_populates="mappings",
    )

    test_case = relationship(
        "TestCase",
    )