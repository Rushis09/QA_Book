from sqlalchemy import func
from sqlalchemy.orm import Session


def generate_sequential_code(
    db: Session,
    model,
    project_id: int,
    code_field: str,
    prefix: str,
) -> str:
    """
    Generates the next sequential code for a project.

    Example:
        REQ001
        REQ002
        REQ003
    """

    column = getattr(model, code_field)

    latest_code = (
        db.query(func.max(column))
        .filter(model.project_id == project_id)
        .scalar()
    )

    if not latest_code:
        next_number = 1
    else:
        numeric_part = int(
            latest_code.replace(prefix, "")
        )
        next_number = numeric_part + 1

    return f"{prefix}{next_number:03d}"