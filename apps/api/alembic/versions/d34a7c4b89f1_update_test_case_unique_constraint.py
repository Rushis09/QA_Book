"""update test case unique constraint

Revision ID: d34a7c4b89f1
Revises: 66e7dba0c5b2
Create Date: 2026-07-18 21:08:07.823448

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d34a7c4b89f1"
down_revision: Union[str, Sequence[str], None] = "66e7dba0c5b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(
        "ix_test_cases_test_case_code",
        table_name="test_cases",
    )

    op.create_index(
        "ix_test_cases_test_case_code",
        "test_cases",
        ["test_case_code"],
        unique=False,
    )

    op.create_unique_constraint(
        "uq_test_case_scenario_code",
        "test_cases",
        ["scenario_id", "test_case_code"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_test_case_scenario_code",
        "test_cases",
        type_="unique",
    )

    op.drop_index(
        "ix_test_cases_test_case_code",
        table_name="test_cases",
    )

    op.create_index(
        "ix_test_cases_test_case_code",
        "test_cases",
        ["test_case_code"],
        unique=True,
    )