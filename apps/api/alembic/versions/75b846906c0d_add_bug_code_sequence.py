"""add bug code sequence

Revision ID: 75b846906c0d
Revises: 03a271397aa5
Create Date: 2026-09-03

"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import table, column
from sqlalchemy import Integer, String


revision: str = "75b846906c0d"
down_revision: Union[str, Sequence[str], None] = "03a271397aa5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    code_sequences = table(
        "code_sequences",
        column("entity_type", String),
        column("next_number", Integer),
    )

    op.bulk_insert(
        code_sequences,
        [
            {
                "entity_type": "bug",
                "next_number": 1,
            }
        ],
    )


def downgrade() -> None:
    code_sequences = table(
        "code_sequences",
        column("entity_type", String),
    )

    op.execute(
        code_sequences.delete().where(
            code_sequences.c.entity_type == "bug"
        )
    )