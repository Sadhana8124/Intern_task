"""
Script to check and fix project member roles in the database.
This will show current roles and allow you to update them.
"""
import sqlite3

conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

print("=" * 80)
print("CHECKING PROJECT MEMBERS ROLES")
print("=" * 80)

# First, check if project_members table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='project_members'")
if not cursor.fetchone():
    print("\n❌ ERROR: 'project_members' table does not exist!")
    print("\nThe table should be created automatically when you start the FastAPI server.")
    print("Make sure you have:")
    print("  1. Defined the ProjectMember model in models/project.py")
    print("  2. Imported it in main.py")
    print("  3. Restarted the server with: uvicorn main:app --reload")
    conn.close()
    exit(1)

# Check current data
cursor.execute("""
    SELECT pm.id, pm.project_id, pm.user_id, pm.role, u.full_name, p.name 
    FROM project_members pm 
    JOIN users u ON pm.user_id = u.id 
    JOIN projects p ON pm.project_id = p.id
    ORDER BY pm.project_id, pm.role DESC
""")

rows = cursor.fetchall()

if not rows:
    print("\n⚠️  No project members found in database.")
    print("Create some projects first using the admin interface.")
    conn.close()
    exit(0)

print("\nCURRENT PROJECT MEMBERS:")
print("-" * 80)
print(f"{'ID':<5} {'Project':<25} {'User':<20} {'Current Role':<15}")
print("-" * 80)

for row in rows:
    pm_id, proj_id, user_id, role, user_name, proj_name = row
    print(f"{pm_id:<5} {proj_name:<25} {user_name:<20} {role:<15}")

print("\n" + "=" * 80)
print("ROLE STATISTICS:")
print("=" * 80)

cursor.execute("SELECT role, COUNT(*) FROM project_members GROUP BY role")
role_counts = cursor.fetchall()
for role, count in role_counts:
    print(f"  {role}: {count} member(s)")

print("\n" + "=" * 80)
print("PROJECTS WITH LEADERS:")
print("=" * 80)

cursor.execute("""
    SELECT p.id, p.name, u.full_name
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.role = 'leader'
    LEFT JOIN users u ON pm.user_id = u.id
""")

projects_leaders = cursor.fetchall()
for proj_id, proj_name, leader_name in projects_leaders:
    leader_display = leader_name if leader_name else "❌ NO LEADER"
    print(f"  Project '{proj_name}': {leader_display}")

# Ask if user wants to fix roles
print("\n" + "=" * 80)
fix = input("\nDo you want to update member roles? (y/n): ").strip().lower()

if fix == 'y':
    print("\nFor each project, specify which user should be the leader.")
    print("All other members will be set to 'member' role.\n")
    
    cursor.execute("SELECT DISTINCT project_id FROM project_members ORDER BY project_id")
    project_ids = [row[0] for row in cursor.fetchall()]
    
    for proj_id in project_ids:
        cursor.execute("SELECT name FROM projects WHERE id = ?", (proj_id,))
        proj_name = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT pm.id, u.id, u.full_name, pm.role 
            FROM project_members pm 
            JOIN users u ON pm.user_id = u.id 
            WHERE pm.project_id = ?
        """, (proj_id,))
        
        members = cursor.fetchall()
        
        print(f"\n--- Project: {proj_name} (ID: {proj_id}) ---")
        for idx, (pm_id, user_id, user_name, current_role) in enumerate(members, 1):
            print(f"  {idx}. {user_name} (current: {current_role})")
        
        leader_choice = input(f"Enter number of leader (1-{len(members)}), or 0 to skip: ").strip()
        
        try:
            leader_idx = int(leader_choice)
            if leader_idx == 0:
                print("  Skipped.")
                continue
            if 1 <= leader_idx <= len(members):
                # Set all to member first
                cursor.execute("UPDATE project_members SET role = 'member' WHERE project_id = ?", (proj_id,))
                
                # Set chosen one as leader
                leader_user_id = members[leader_idx - 1][1]
                cursor.execute("""
                    UPDATE project_members 
                    SET role = 'leader' 
                    WHERE project_id = ? AND user_id = ?
                """, (proj_id, leader_user_id))
                
                # Also update projects.team_leader_id
                cursor.execute("UPDATE projects SET team_leader_id = ? WHERE id = ?", (leader_user_id, proj_id))
                
                print(f"  ✅ Set {members[leader_idx - 1][2]} as leader")
            else:
                print("  Invalid choice, skipped.")
        except ValueError:
            print("  Invalid input, skipped.")
    
    conn.commit()
    print("\n✅ Database updated successfully!")
else:
    print("\nNo changes made.")

conn.close()
