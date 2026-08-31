from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "document_code",
            name="uq_document_project_code",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    document_code = Column(
        String(20),
        nullable=False,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    document_type = Column(
        String(20),
        nullable=False,
        default="BRD",
    )

    title = Column(
        String(200),
        nullable=False,
    )

    file_name = Column(
        String(255),
        nullable=False,
    )

    file_type = Column(
        String(20),
        nullable=False,
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    storage_key = Column(
        String(500),
        nullable=False,
    )

    status = Column(
        String(20),
        nullable=False,
        default="Uploaded",
    )

    uploaded_by = Column(
        String(100),
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
        back_populates="documents",
    )