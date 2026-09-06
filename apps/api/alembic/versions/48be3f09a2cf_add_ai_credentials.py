"""add ai credentials

Revision ID: 48be3f09a2cf
Revises: 925b7bdc7962
Create Date: 2026-09-05 02:22:21.881814

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "48be3f09a2cf"
down_revision: Union[str, Sequence[str], None] = "925b7bdc7962"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "ai_credentials",
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
            "provider",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "encrypted_api_key",
            sa.String(length=1000),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
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
        sa.UniqueConstraint(
            "admin_id",
            "provider",
            name="uq_ai_credentials_admin_provider",
        ),
    )

    op.create_index(
        "ix_ai_credentials_admin_id",
        "ai_credentials",
        ["admin_id"],
        unique=False,
    )

    op.create_index(
        "ix_ai_credentials_id",
        "ai_credentials",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_ai_credentials_id",
        table_name="ai_credentials",
    )

    op.drop_index(
        "ix_ai_credentials_admin_id",
        table_name="ai_credentials",
    )

    op.drop_table("ai_credentials")