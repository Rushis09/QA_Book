from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class BugRetest(Base):
    __tablename__ = "bug_retests"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    bug_id = Column(
        Integer,
        ForeignKey("bugs.id"),
        nullable=False,
    )

    execution_id = Column(
        Integer,
        ForeignKey("test_executions.id"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    bug = relationship(
        "Bug",
        back_populates="retests",
    )

    execution = relationship(
        "TestExecution",
        back_populates="bug_retests",
    )