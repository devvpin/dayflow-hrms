"""add unique constraint payroll employee effective

Revision ID: b25f61bcf796
Revises: a41b89dfad4c
Create Date: 2026-08-23 13:12:11.767220

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b25f61bcf796'
down_revision: Union[str, Sequence[str], None] = 'a41b89dfad4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint(
        'uix_payroll_employee_effective',
        'payroll',
        ['employee_id', 'effective_from'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        'uix_payroll_employee_effective',
        'payroll',
        type_='unique',
    )
