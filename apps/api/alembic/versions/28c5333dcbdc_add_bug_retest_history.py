"""add bug retest history

Revision ID: 28c5333dcbdc
Revises: 22048ff3aa37
Create Date: 2026-09-03 22:36:10.491880

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "28c5333dcbdc"
down_revision: Union[str, Sequence[str], None] = "22048ff3aa37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "bug_retests",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "bug_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "execution_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["bug_id"],
            ["bugs.id"],
        ),
        sa.ForeignKeyConstraint(
            ["execution_id"],
            ["test_executions.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_bug_retests_id"),
        "bug_retests",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_bug_retests_id"),
        table_name="bug_retests",
    )

    op.drop_table("bug_retests")