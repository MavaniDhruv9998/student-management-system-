import sqlite3
import os

db_path = 'school.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.execute("UPDATE students SET std = '10' WHERE std = '10th'")
    conn.commit()
    conn.close()
    print("Database updated successfully")
else:
    print("Database file not found")
