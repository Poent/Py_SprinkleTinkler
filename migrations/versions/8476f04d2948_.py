"""empty message

Revision ID: 8476f04d2948
Revises: 550a9534cdf5
Create Date: 2023-08-14 02:40:50.485833

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8476f04d2948'
down_revision = '550a9534cdf5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('schedule', schema=None) as batch_op:
        batch_op.add_column(sa.Column('custom_days', sa.String(length=13), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('schedule', schema=None) as batch_op:
        batch_op.drop_column('custom_days')

    # ### end Alembic commands ###
