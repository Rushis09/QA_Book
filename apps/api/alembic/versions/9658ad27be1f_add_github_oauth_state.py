"""add github oauth state

Revision ID: 9658ad27be1f
Revises: 38015078632f
Create Date: 2026-09-04 19:56:17.382672

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9658ad27be1f"
down_revision: Union[str, Sequence[str], None] = "38015078632f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "github_oauth_states",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "state",
            sa.String(length=128),
            nullable=False,
        ),
        sa.Column(
            "admin_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "automation_project_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["admin_id"],
            ["admins.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["automation_project_id"],
            ["automation_projects.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_github_oauth_states_id"),
        "github_oauth_states",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_github_oauth_states_state"),
        "github_oauth_states",
        ["state"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_github_oauth_states_state"),
        table_name="github_oauth_states",
    )

    op.drop_index(
        op.f("ix_github_oauth_states_id"),
        table_name="github_oauth_states",
    )

    op.drop_table("github_oauth_states")