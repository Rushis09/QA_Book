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


class TestSuite(Base):
    __tablename__ = "test_suites"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    suite_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        String(1000),
        nullable=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default="Active",
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
        back_populates="test_suites",
    )
    test_cases = relationship(
        "TestCase",
        secondary="suite_test_cases",
        back_populates="test_suites",
    )

    test_runs = relationship(
        "TestRun",
        back_populates="suite",
        cascade="all, delete-orphan",
    )