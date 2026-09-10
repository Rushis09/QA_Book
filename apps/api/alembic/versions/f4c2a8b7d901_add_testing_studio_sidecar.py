"""add additive testing studio sidecar tables

Revision ID: f4c2a8b7d901
Revises: 0238251a3d4c
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f4c2a8b7d901"
down_revision: Union[str, Sequence[str], None] = ("0238251a3d4c")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "test_case_testing_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("test_case_id", sa.Integer(), nullable=False),
        sa.Column("testing_type", sa.String(length=30), nullable=False),
        sa.Column("execution_method", sa.String(length=20), nullable=False, server_default="MANUAL"),
        sa.Column("meta_attributes", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["test_case_id"], ["test_cases.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("test_case_id", name="uq_testing_profile_test_case"),
    )
    op.create_index("ix_test_case_testing_profiles_id", "test_case_testing_profiles", ["id"], unique=False)
    op.create_index("ix_test_case_testing_profiles_test_case_id", "test_case_testing_profiles", ["test_case_id"], unique=False)
    op.create_index("ix_test_case_testing_profiles_testing_type", "test_case_testing_profiles", ["testing_type"], unique=False)

    op.create_table(
        "testing_evidence",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("test_case_id", sa.Integer(), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["test_case_id"], ["test_cases.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("storage_key", name="uq_testing_evidence_storage_key"),
    )
    op.create_index("ix_testing_evidence_id", "testing_evidence", ["id"], unique=False)
    op.create_index("ix_testing_evidence_test_case_id", "testing_evidence", ["test_case_id"], unique=False)

    op.create_table(
        "test_execution_result_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("execution_id", sa.Integer(), nullable=False),
        sa.Column("result_attributes", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["execution_id"], ["test_executions.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("execution_id", name="uq_execution_result_profile_execution"),
    )
    op.create_index("ix_test_execution_result_profiles_id", "test_execution_result_profiles", ["id"], unique=False)
    op.create_index("ix_test_execution_result_profiles_execution_id", "test_execution_result_profiles", ["execution_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_test_execution_result_profiles_execution_id", table_name="test_execution_result_profiles")
    op.drop_index("ix_test_execution_result_profiles_id", table_name="test_execution_result_profiles")
    op.drop_table("test_execution_result_profiles")
    op.drop_index("ix_test_case_testing_profiles_testing_type", table_name="test_case_testing_profiles")
    op.drop_index("ix_test_case_testing_profiles_test_case_id", table_name="test_case_testing_profiles")
    op.drop_index("ix_test_case_testing_profiles_id", table_name="test_case_testing_profiles")
    op.drop_table("test_case_testing_profiles")
    op.drop_index("ix_testing_evidence_test_case_id", table_name="testing_evidence")
    op.drop_index("ix_testing_evidence_id", table_name="testing_evidence")
    op.drop_table("testing_evidence")
