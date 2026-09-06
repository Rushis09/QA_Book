"""add password reset tokens

Revision ID: 925b7bdc7962
Revises: c092483c1354
Create Date: 2026-09-05 00:31:42.249370

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "925b7bdc7962"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "c092483c1354"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "password_reset_tokens",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "admin_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "token_hash",
            sa.String(length=128),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "used_at",
            sa.DateTime(timezone=True),
            nullable=True,
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
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_password_reset_tokens_id",
        "password_reset_tokens",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_password_reset_tokens_admin_id",
        "password_reset_tokens",
        ["admin_id"],
        unique=False,
    )

    op.create_index(
        "ix_password_reset_tokens_token_hash",
        "password_reset_tokens",
        ["token_hash"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_password_reset_tokens_token_hash",
        table_name="password_reset_tokens",
    )

    op.drop_index(
        "ix_password_reset_tokens_admin_id",
        table_name="password_reset_tokens",
    )

    op.drop_index(
        "ix_password_reset_tokens_id",
        table_name="password_reset_tokens",
    )

    op.drop_table(
        "password_reset_tokens",
    )