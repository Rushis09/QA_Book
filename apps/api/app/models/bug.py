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


class Bug(Base):
    __tablename__ = "bugs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    bug_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    execution_id = Column(
        Integer,
        ForeignKey("test_executions.id"),
        nullable=False,
    )


    title = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    severity = Column(
        String(20),
        nullable=False,
    )

    priority = Column(
        String(20),
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="Open",
    )

    assigned_to = Column(
        String(100),
        nullable=True,
    )

    reported_by = Column(
        String(100),
        nullable=True,
    )

    environment = Column(
        String(100),
        nullable=True,
    )

    steps_to_reproduce = Column(
        Text,
        nullable=True,
    )



    actual_result = Column(
        Text,
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

    execution = relationship(
        "TestExecution",
        back_populates="bugs",
    )

 