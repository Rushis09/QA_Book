from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TestScenario(Base):
    __tablename__ = "test_scenarios"

    id = Column(Integer, primary_key=True, index=True)

    scenario_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    requirement_id = Column(
        Integer,
        ForeignKey("requirements.id"),
        nullable=False,
    )

    title = Column(String(100), nullable=False)

    description = Column(
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

    requirement = relationship(
        "Requirement",
        back_populates="test_scenarios",
    )
    test_cases = relationship(
        "TestCase",
        back_populates="scenario",
        cascade="all, delete-orphan",
    )