from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# --- Import your app’s models and metadata ---
import sys
import os

# Ensure Alembic can find the "app" package
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.models import Base  # Import Base from your models
from app.database import SQLALCHEMY_DATABASE_URL  # Use your DB URL directly if defined

# --- Alembic Config ---
config = context.config

# Set SQLAlchemy URL dynamically (optional: keeps alembic.ini cleaner)
if SQLALCHEMY_DATABASE_URL:
    config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
