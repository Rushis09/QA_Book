"""allow github connection before repository selection

Revision ID: 4fb29f0d2792
Revises: 48be3f09a2cf
Create Date: 2026-09-06 01:21:41.499186

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4fb29f0d2792"
down_revision: Union[str, Sequence[str], None] = "48be3f09a2cf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "github_connections",
        "repository_owner",
        existing_type=sa.String(length=100),
        nullable=True,
    )

    op.alter_column(
        "github_connections",
        "repository_name",
        existing_type=sa.String(length=200),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "github_connections",
        "repository_name",
        existing_type=sa.String(length=200),
        nullable=False,
    )

    op.alter_column(
        "github_connections",
        "repository_owner",
        existing_type=sa.String(length=100),
        nullable=False,
    )