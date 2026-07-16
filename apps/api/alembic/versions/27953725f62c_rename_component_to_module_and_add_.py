"""rename component to module and add status to test cases

Revision ID: 27953725f62c
Revises: 9ac30150b83c
Create Date: 2026-07-17 03:29:37.113585

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '27953725f62c'
down_revision: Union[str, Sequence[str], None] = '9ac30150b83c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        "test_cases",
        "component",
        new_column_name="module",
        existing_type=sa.String(length=200),
    )

    op.alter_column(
        "test_cases",
        "module",
        type_=sa.String(length=100),
        existing_type=sa.String(length=200),
    )

    op.add_column(
        "test_cases",
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="Draft",
        ),
    )

    op.alter_column(
        "test_cases",
        "status",
        server_default=None,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "test_cases",
        "status",
    )

    op.alter_column(
        "test_cases",
        "module",
        type_=sa.String(length=200),
        existing_type=sa.String(length=100),
    )

    op.alter_column(
        "test_cases",
        "module",
        new_column_name="component",
        existing_type=sa.String(length=200),
    )
    # ### end Alembic commands ###
