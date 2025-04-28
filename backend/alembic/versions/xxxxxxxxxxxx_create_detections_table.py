"""create detections table

Revision ID: xxxxxxxxxxxx
Revises: 
Create Date: 2024-04-23 16:37:02.486540

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'xxxxxxxxxxxx'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('num_people', sa.Integer(), nullable=True),
        sa.Column('original_image_path', sa.String(), nullable=True),
        sa.Column('detected_image_path', sa.String(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('processing_time', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('detections') 