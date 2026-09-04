"""add bug resolution

Revision ID: 22048ff3aa37
Revises: 75b846906c0d
Create Date: 2026-09-03 20:18:38.500270

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "22048ff3aa37"
down_revision: Union[str, Sequence[str], None] = "75b846906c0d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bugs",
        sa.Column(
            "resolution",
            sa.String(length=30),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("bugs", "resolution")