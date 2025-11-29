import sqlite3

conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

# Check all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Tables in database:")
for t in tables:
    print(f"  - {t[0]}")
    
    # Count rows in each table
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {t[0]}")
        count = cursor.fetchone()[0]
        print(f"    Rows: {count}")
    except:
        pass

# Check if projects and project_members exist
print("\n" + "="*60)
if 'projects' in [t[0] for t in tables]:
    print("✅ 'projects' table EXISTS")
    cursor.execute("SELECT id, name, team_leader_id FROM projects")
    projects = cursor.fetchall()
    if projects:
        print("\nProjects:")
        for p in projects:
            print(f"  ID: {p[0]}, Name: {p[1]}, Leader ID: {p[2]}")
    else:
        print("  (No projects in database)")
else:
    print("❌ 'projects' table DOES NOT EXIST")

print()
if 'project_members' in [t[0] for t in tables]:
    print("✅ 'project_members' table EXISTS")
    cursor.execute("SELECT id, project_id, user_id, role FROM project_members")
    members = cursor.fetchall()
    if members:
        print("\nProject Members:")
        for m in members:
            print(f"  ID: {m[0]}, Project: {m[1]}, User: {m[2]}, Role: {m[3]}")
    else:
        print("  (No members in database)")
else:
    print("❌ 'project_members' table DOES NOT EXIST")
    print("\n⚠️  The tables need to be created!")
    print("   Make sure the FastAPI server has been started at least once.")

conn.close()
