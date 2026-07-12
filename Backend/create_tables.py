"""
One-time script to create all database tables based on your actual SQLAlchemy models.
Run this once against your Aiven database.
"""
from database import Base, engine
from models import user, task, task_submission, submission_file, notification, project, project_submission

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")

with engine.connect() as conn:
    tables = engine.dialect.get_table_names(conn)
    print(f"Tables now in database: {tables}")