import sqlite3

conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables in database:")
for t in tables:
    print(f"  - {t[0]}")

print("\n" + "="*80 + "\n")

# Check project_members data
try:
    cursor.execute("""
        SELECT pm.id, pm.project_id, pm.user_id, pm.role, u.full_name, p.name 
        FROM project_members pm 
        JOIN users u ON pm.user_id = u.id 
        JOIN projects p ON pm.project_id = p.id
    """)
    rows = cursor.fetchall()
    print("PROJECT MEMBERS DATA:")
    print("ID | Project_ID | User_ID | Role | User Name | Project Name")
    print("-" * 80)
    for r in rows:
        print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]}")
except Exception as e:
    print(f"Error querying project_members: {e}")

conn.close()
