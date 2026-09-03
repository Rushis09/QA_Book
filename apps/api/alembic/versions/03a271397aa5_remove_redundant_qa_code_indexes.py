"""remove redundant qa code indexes

Revision ID: 03a271397aa5
Revises: b8ee7c8aa441
Create Date: 2026-09-03 17:32:49.090333

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "03a271397aa5"
down_revision: Union[str, Sequence[str], None] = "b8ee7c8aa441"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(
        "ix_requirements_requirement_code",
        table_name="requirements",
    )
    op.drop_index(
        "ix_test_scenarios_scenario_code",
        table_name="test_scenarios",
    )
    op.drop_index(
        "ix_test_cases_test_case_code",
        table_name="test_cases",
    )


def downgrade() -> None:
    op.create_index(
        "ix_requirements_requirement_code",
        "requirements",
        ["requirement_code"],
        unique=True,
    )
    op.create_index(
        "ix_test_scenarios_scenario_code",
        "test_scenarios",
        ["scenario_code"],
        unique=True,
    )
    op.create_index(
        "ix_test_cases_test_case_code",
        "test_cases",
        ["test_case_code"],
        unique=True,
    )