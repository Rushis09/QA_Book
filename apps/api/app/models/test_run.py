from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)

    run_code = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    suite_id = Column(
        Integer,
        ForeignKey("test_suites.id"),
        nullable=False,
    )

    name = Column(
        String,
        nullable=False,
    )

    build_version = Column(
        String,
        nullable=True,
    )

    environment = Column(
        String,
        nullable=True,
    )

    tester = Column(
        String,
        nullable=True,
    )

    start_date = Column(
        Date,
        nullable=True,
    )

    end_date = Column(
        Date,
        nullable=True,
    )

    status = Column(
        String,
        default="Not Started",
        nullable=False,
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

    suite = relationship(
        "TestSuite",
        back_populates="test_runs",
    )
    executions = relationship(
        "TestExecution",
        back_populates="test_run",
        cascade="all, delete-orphan",
    )