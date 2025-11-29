
import os
import sqlite3
from datetime import datetime, timedelta

# Connect to the database
conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    password TEXT NOT NULL
)
''')

# Create tasks table
cursor.execute('''
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,
    assigned_to INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
)
''')

# Create task_submissions table
cursor.execute('''
CREATE TABLE IF NOT EXISTS task_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    intern_id INTEGER NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT "pending",
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (intern_id) REFERENCES users(id)
)
''')

# Create submission_files table
cursor.execute('''
CREATE TABLE IF NOT EXISTS submission_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    filename TEXT,
    file_url TEXT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES task_submissions(id)
)
''')

# Insert test users
cursor.execute('''
INSERT INTO users (full_name, email, role, password) VALUES
    ("Admin User", "admin@example.com", "admin", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"),
    ("Intern One", "intern1@example.com", "intern", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"),
    ("Intern Two", "intern2@example.com", "intern", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW")
''')

# Insert test tasks
current_time = datetime.now()
cursor.execute('''
INSERT INTO tasks (title, description, deadline, assigned_to, created_by, is_completed) VALUES
    ("Task 1", "Complete the first assignment", ?, 2, 1, FALSE),
    ("Task 2", "Complete the second assignment", ?, 2, 1, FALSE),
    ("Task 3", "Complete the third assignment", ?, 3, 1, FALSE)
''', (current_time + timedelta(days=7), current_time + timedelta(days=14), current_time + timedelta(days=21)))

# Insert test submissions
cursor.execute('''
INSERT INTO task_submissions (task_id, intern_id, status) VALUES
    (1, 2, "submitted"),
    (2, 2, "submitted"),
    (3, 3, "submitted")
''')

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Insert test submission files
for i in range(1, 4):
    # Create physical file
    filename = f"test_file_{i}.txt"
    file_path = os.path.join("uploads", filename)
    with open(file_path, "w") as f:
        f.write(f"This is a test file for submission {i}")
    
    # Insert file record
    cursor.execute('''
    INSERT INTO submission_files (submission_id, filename, file_url) VALUES
        (?, ?, ?)
    ''', (i, filename, f"http://127.0.0.1:8000/uploads/{filename}"))

# Commit changes
conn.commit()
print("✅ Database initialized with test data!")

# Verify data
cursor.execute("SELECT COUNT(*) FROM users")
print(f"Users: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM tasks")
print(f"Tasks: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM task_submissions")
print(f"Submissions: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM submission_files")
print(f"Submission files: {cursor.fetchone()[0]}")

conn.close()