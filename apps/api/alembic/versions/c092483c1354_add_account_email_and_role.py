"""add account email and role

Revision ID: c092483c1354
Revises: d8f477d1fbd3
Create Date: 2026-09-04 23:18:08.567730

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c092483c1354"
down_revision: Union[str, Sequence[str], None] = "d8f477d1fbd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the new columns as nullable first because existing
    # accounts already exist in the database.
    op.add_column(
        "admins",
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "admins",
        sa.Column(
            "role",
            sa.String(length=30),
            nullable=True,
        ),
    )

    # Populate the existing accounts.
    op.execute(
        sa.text(
            """
            UPDATE admins
            SET email = 'rushishete09@gmail.com',
                role = 'PLATFORM_ADMIN'
            WHERE username = 'rushis09'
            """
        )
    )

    op.execute(
        sa.text(
            """
            UPDATE admins
            SET email = 'rscreation0374@gmail.com',
                role = 'USER'
            WHERE username = 'student1'
            """
        )
    )

    # Existing accounts are now populated, so enforce the
    # required fields.
    op.alter_column(
        "admins",
        "email",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    op.alter_column(
        "admins",
        "role",
        existing_type=sa.String(length=30),
        nullable=False,
    )

    op.create_index(
        op.f("ix_admins_email"),
        "admins",
        ["email"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_admins_email"),
        table_name="admins",
    )

    op.drop_column(
        "admins",
        "role",
    )

    op.drop_column(
        "admins",
        "email",
    )