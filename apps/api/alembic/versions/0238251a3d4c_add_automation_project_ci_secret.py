"""add automation project ci secret

Revision ID: 0238251a3d4c
Revises: 93f91dd6c34c
Create Date: 2026-09-06 20:04:53.002128

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0238251a3d4c"
down_revision: Union[str, Sequence[str], None] = "93f91dd6c34c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "automation_projects",
        sa.Column(
            "ci_secret_hash",
            sa.String(128),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "automation_projects",
        "ci_secret_hash",
    )