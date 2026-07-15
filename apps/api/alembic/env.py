from logging.config import fileConfig
import os

from dotenv import load_dotenv

from sqlalchemy import engine_from_config, pool

from alembic import context

from app.db.database import Base

# Import all models so Alembic discovers them
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_scenario import TestScenario
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite
from app.models.suite_test_case import SuiteTestCase
from app.models.test_run import TestRun
from app.models.test_execution import TestExecution
from app.models.bug import Bug
from app.models.admin import Admin

config = context.config

dotenv_file = os.getenv("DOTENV_FILE", ".env")
load_dotenv(dotenv_file, override=True)

config.set_main_option(
    "sqlalchemy.url",
    os.getenv("DATABASE_URL"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()