from sqlalchemy import Column, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    project_code = Column(String(20), unique=True, nullable=False)

    name = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)

    status = Column(String(20), nullable=False, default="Active")

    version = Column(String(30), nullable=True)

    start_date = Column(Date, nullable=True)

    end_date = Column(Date, nullable=True)

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

    requirements = relationship(
        "Requirement",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    test_suites = relationship(
        "TestSuite",
        back_populates="project",
        cascade="all, delete-orphan",
    )