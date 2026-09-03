from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.code_sequence import CodeSequence


def generate_sequential_code(
    db: Session,
    entity_type: str,
    prefix: str,
) -> str:
    """
    Generate the next globally unique business code for an entity type.

    Example:
        entity_type="test_case", prefix="TC"
        -> TC-001
        -> TC-002
        -> TC-003

    Numbers are reserved independently from the actual entity rows,
    so deleting an entity will never cause its code number to be reused.
    """

    sequence = db.execute(
        select(CodeSequence)
        .where(CodeSequence.entity_type == entity_type)
        .with_for_update()
    ).scalar_one()

    number = sequence.next_number

    sequence.next_number += 1

    db.flush()

    return f"{prefix}-{number:03d}"