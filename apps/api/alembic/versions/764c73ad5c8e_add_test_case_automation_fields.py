"""add test case automation fields

Revision ID: 764c73ad5c8e
Revises: a464f50583a4
Create Date: 2026-09-02 01:20:49.177075

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '764c73ad5c8e'
down_revision: Union[str, Sequence[str], None] = 'a464f50583a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'test_cases',
        sa.Column(
            'automation_eligibility',
            sa.String(length=30),
            server_default='Eligible',
            nullable=False,
        ),
    )

    op.add_column(
        'test_cases',
        sa.Column(
            'automation_status',
            sa.String(length=30),
            server_default='Not Automated',
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        'test_cases',
        'automation_status',
    )

    op.drop_column(
        'test_cases',
        'automation_eligibility',
    )