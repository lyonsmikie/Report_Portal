"""Add site_name to reports

Revision ID: 9d9d1af87b4e
Revises: 
Create Date: 2025-11-09 15:42:16.659161

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9d9d1af87b4e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add columns as nullable first
    op.add_column('reports', sa.Column('site_name', sa.String(), nullable=True))
    op.add_column('reports', sa.Column('category', sa.String(), nullable=True))

    # Fill existing rows with default values
    op.execute("UPDATE reports SET site_name = 'shared' WHERE site_name IS NULL")
    op.execute("UPDATE reports SET category = 'other' WHERE category IS NULL")

    # Alter columns to non-nullable
    op.alter_column('reports', 'site_name', nullable=False)
    op.alter_column('reports', 'category', nullable=False)

    # Keep existing constraints and non-null requirements
    op.alter_column('reports', 'file_name',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('reports', 'file_type',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('reports', 'date',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
    op.drop_constraint(op.f('reports_site_id_fkey'), 'reports', type_='foreignkey')
    op.drop_column('reports', 'site_id')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('reports', sa.Column('site_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key(op.f('reports_site_id_fkey'), 'reports', 'sites', ['site_id'], ['id'])
    op.alter_column('reports', 'date',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
    op.alter_column('reports', 'file_type',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('reports', 'file_name',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.drop_column('reports', 'category')
    op.drop_column('reports', 'site_name')
