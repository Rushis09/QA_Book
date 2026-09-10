from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TestCaseTestingProfile(Base):
    """Sidecar definition for multi-discipline testing.

    Kept separate from the existing test_cases table so the established QABook
    schema and APIs remain backward compatible while Testing Studio evolves.
    """

    __tablename__ = "test_case_testing_profiles"

    __table_args__ = (
        UniqueConstraint("test_case_id", name="uq_testing_profile_test_case"),
    )

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(
        Integer,
        ForeignKey("test_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    testing_type = Column(String(30), nullable=False, index=True)
    execution_method = Column(String(20), nullable=False, default="MANUAL")
    meta_attributes = Column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    test_case = relationship("TestCase", back_populates="testing_profile")


class TestExecutionResultProfile(Base):
    """Type-specific result payload kept separate from the existing execution row."""

    __tablename__ = "test_execution_result_profiles"

    __table_args__ = (
        UniqueConstraint("execution_id", name="uq_execution_result_profile_execution"),
    )

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(
        Integer,
        ForeignKey("test_executions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    result_attributes = Column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    execution = relationship("TestExecution", back_populates="result_profile")
