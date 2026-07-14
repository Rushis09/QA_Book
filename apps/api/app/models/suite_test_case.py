from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
)

from app.db.database import Base


class SuiteTestCase(Base):
    __tablename__ = "suite_test_cases"

    suite_id = Column(
        Integer,
        ForeignKey("test_suites.id"),
        primary_key=True,
    )

    test_case_id = Column(
        Integer,
        ForeignKey("test_cases.id"),
        primary_key=True,
    )