import sqlite3

def get_db_connection():
    conn = sqlite3.connect('school.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Tables
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phoneNumber TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'teacher', 'parent')) NOT NULL,
        assignedStd TEXT,
        assignedClass TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roll TEXT NOT NULL,
        std TEXT NOT NULL,
        class TEXT NOT NULL,
        grNumber TEXT,
        udiseNumber TEXT,
        fatherName TEXT,
        surname TEXT,
        whatsappNo TEXT,
        parentId INTEGER,
        FOREIGN KEY(parentId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        status TEXT CHECK(status IN ('present', 'absent')) DEFAULT 'present',
        date TEXT NOT NULL,
        note TEXT,
        FOREIGN KEY(studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        teacherId INTEGER,
        targetStd TEXT,
        targetClass TEXT,
        status TEXT,
        FOREIGN KEY(teacherId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        subject TEXT NOT NULL,
        marks INTEGER,
        rank INTEGER,
        testName TEXT,
        schoolName TEXT,
        date TEXT,
        FOREIGN KEY(studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        message TEXT NOT NULL,
        type TEXT,
        date TEXT NOT NULL,
        isRead INTEGER DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT,
        chapter TEXT,
        pages TEXT,
        filePath TEXT,
        teacherId INTEGER,
        date TEXT,
        FOREIGN KEY(teacherId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS homework (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        std TEXT,
        class TEXT,
        date TEXT,
        teacherId INTEGER,
        FOREIGN KEY(teacherId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        amount REAL,
        status TEXT CHECK(status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
        dueDate TEXT,
        FOREIGN KEY(studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        badgeName TEXT NOT NULL,
        date TEXT NOT NULL,
        teacherId INTEGER,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(teacherId) REFERENCES users(id)
    );
    ''')

    # Seed initial data if empty
    user_count = cursor.execute('SELECT count(*) FROM users').fetchone()[0]
    if user_count == 0:
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
                       ('Admin User', 'admin@school.com', 'admin123', 'admin'))
        cursor.execute("INSERT INTO users (name, email, password, role, assignedStd, assignedClass) VALUES (?, ?, ?, ?, ?, ?)", 
                       ('John Doe', 'teacher@school.com', 'teacher123', 'teacher', '10', 'A'))
        teacher_id = cursor.lastrowid
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
                       ('Jane Smith', 'parent@school.com', 'parent123', 'parent'))
        parent_id = cursor.lastrowid

        cursor.execute("INSERT INTO students (name, roll, std, class, parentId) VALUES (?, ?, ?, ?, ?)",
                       ('Aarav Sharma', '101', '10', 'A', parent_id))
        student1_id = cursor.lastrowid
        cursor.execute("INSERT INTO students (name, roll, std, class, parentId) VALUES (?, ?, ?, ?, ?)",
                       ('Ishani Patel', '102', '10', 'A', parent_id))

        cursor.execute("INSERT INTO results (studentId, subject, marks, rank, testName, schoolName, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (student1_id, 'Mathematics', 95, 1, 'Final Term', 'Green Valley High', '2026-06-12'))
        
        cursor.execute("INSERT INTO fees (studentId, amount, status, dueDate) VALUES (?, ?, ?, ?)",
                       (student1_id, 500, 'unpaid', '2026-07-01'))

        cursor.execute("INSERT INTO badges (studentId, badgeName, date, teacherId) VALUES (?, ?, ?, ?)",
                       (student1_id, 'Star Student', '2026-06-12', teacher_id))

        # Seed events
        cursor.execute("INSERT INTO events (title, description, date, teacherId, targetStd, targetClass, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       ('Science Fair', 'Annual science projects display', '2026-06-20', teacher_id, None, None, 'pending'))
        cursor.execute("INSERT INTO events (title, description, date, teacherId, targetStd, targetClass, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       ('Class 10-A Math Quiz', 'Special quiz contest for Std 10 Class A', '2026-06-25', teacher_id, '10', 'A', 'pending'))
        cursor.execute("INSERT INTO events (title, description, date, teacherId, targetStd, targetClass, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       ('Parent-Teacher Meeting', 'Discussing term performance', '2026-06-10', teacher_id, None, None, 'completed'))

    conn.commit()
    conn.close()
