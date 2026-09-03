from sqlalchemy import Column, Integer, String, UniqueConstraint

from app.db.database import Base


class CodeSequence(Base):
    __tablename__ = "code_sequences"

    __table_args__ = (
        UniqueConstraint(
            "entity_type",
            name="uq_code_sequence_entity_type",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    next_number = Column(Integer, nullable=False, default=1)