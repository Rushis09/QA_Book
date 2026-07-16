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


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    test_case_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    scenario_id = Column(
        Integer,
        ForeignKey("test_scenarios.id"),
        nullable=False,
    )

    module = Column(
        String(100),
        nullable=False,
    )

    priority = Column(
        String(20),
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="Draft",
    )

    title = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        String(1000),
        nullable=True,
    )

    preconditions = Column(
        String(2000),
        nullable=True,
    )

    test_data = Column(
        String(2000),
        nullable=True,
    )

    steps = Column(
        String(5000),
        nullable=True,
    )

    expected_result = Column(
        String(2000),
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

    scenario = relationship(
        "TestScenario",
        back_populates="test_cases",
    )
    test_suites = relationship(
        "TestSuite",
        secondary="suite_test_cases",
        back_populates="test_cases",
    )
    executions = relationship(
        "TestExecution",
        back_populates="test_case",
        cascade="all, delete-orphan",
    )
