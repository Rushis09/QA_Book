"""add project account ownership

Revision ID: d8f477d1fbd3
Revises: 9658ad27be1f
Create Date: 2026-09-04 21:07:17.378445

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d8f477d1fbd3"
down_revision: Union[str, Sequence[str], None] = "9658ad27be1f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("admin_id", sa.Integer(), nullable=False),
    )

    op.create_index(
        op.f("ix_projects_admin_id"),
        "projects",
        ["admin_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_projects_admin_id_admins",
        "projects",
        "admins",
        ["admin_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_projects_admin_id_admins",
        "projects",
        type_="foreignkey",
    )

    op.drop_index(
        op.f("ix_projects_admin_id"),
        table_name="projects",
    )

    op.drop_column(
        "projects",
        "admin_id",
    )