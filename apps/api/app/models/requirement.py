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


class Requirement(Base):
    __tablename__ = "requirements"

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "requirement_code",
            name="uq_requirement_project_code",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    requirement_code = Column(
        String(20),
        nullable=False,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
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
    )

    description = Column(
        String(1000),
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
        back_populates="requirements",
    )
    test_scenarios = relationship(
        "TestScenario",
        back_populates="requirement",
        cascade="all, delete-orphan",
    )