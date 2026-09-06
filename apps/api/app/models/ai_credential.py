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


class AICredential(Base):
    __tablename__ = "ai_credentials"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    admin_id = Column(
        Integer,
        ForeignKey(
            "admins.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    provider = Column(
        String(50),
        nullable=False,
    )

    encrypted_api_key = Column(
        String(1000),
        nullable=False,
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

    admin = relationship(
        "Admin",
        back_populates="ai_credentials",
    )

    __table_args__ = (
        UniqueConstraint(
            "admin_id",
            "provider",
            name="uq_ai_credentials_admin_provider",
        ),
    )