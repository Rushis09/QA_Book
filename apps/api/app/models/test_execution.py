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


class TestExecution(Base):
    __tablename__ = "test_executions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    run_id = Column(
        Integer,
        ForeignKey("test_runs.id"),
        nullable=False,
    )

    test_case_id = Column(
        Integer,
        ForeignKey("test_cases.id"),
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="Not Executed",
    )

    actual_result = Column(
        Text,
        nullable=True,
    )

    comments = Column(
        Text,
        nullable=True,
    )

    executed_by = Column(
        String,
        nullable=True,
    )

    executed_at = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    test_run = relationship(
        "TestRun",
        back_populates="executions",
    )

    test_case = relationship(
        "TestCase",
        back_populates="executions",
    )

    bugs = relationship(
        "Bug",
        back_populates="execution",
        cascade="all, delete-orphan",
    )