from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize Database
init_db()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    # Check by email or phone number
    user = conn.execute('SELECT * FROM users WHERE (email = ? OR phoneNumber = ?) AND password = ?', 
                      (data.get('email'), data.get('email'), data['password'])).fetchone()
    conn.close()
    if user:
        return jsonify(dict(user))
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/students', methods=['GET', 'POST'])
def handle_students():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        # Find parent by email
        parent = conn.execute('SELECT id FROM users WHERE email = ? AND role = "parent"', 
                            (data['parentEmail'],)).fetchone()
        if not parent:
            # Create a shell parent if not exists
            conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                       (data['name'] + ' Parent', data['parentEmail'], 'password123', 'parent'))
            parent_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        else:
            parent_id = parent[0]

        conn.execute('''
            INSERT INTO students (name, roll, std, class, grNumber, udiseNumber, fatherName, surname, whatsappNo, parentId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['name'], data['roll'], data['std'], data['class'], 
              data.get('grNumber', ''), data.get('udiseNumber', ''), 
              data.get('fatherName', ''), data.get('surname', ''), 
              data.get('whatsappNo', ''), parent_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    
    std = request.args.get('std')
    cls = request.args.get('class')
    
    query = 'SELECT students.*, users.email AS parentEmail FROM students LEFT JOIN users ON students.parentId = users.id'
    params = []
    
    if std and cls:
        query += ' WHERE students.std = ? AND students.class = ?'
        params = [std, cls]
    elif std:
        query += ' WHERE students.std = ?'
        params = [std]
        
    students = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(s) for s in students])

@app.route('/api/students/<int:id>', methods=['PUT', 'DELETE'])
def handle_student_detail(id):
    conn = get_db_connection()
    if request.method == 'PUT':
        data = request.json
        parent_id = None
        if 'parentEmail' in data:
            parent = conn.execute('SELECT id FROM users WHERE email = ? AND role = "parent"', 
                                (data['parentEmail'],)).fetchone()
            if not parent:
                conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                           (data['name'] + ' Parent', data['parentEmail'], 'password123', 'parent'))
                parent_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
            else:
                parent_id = parent[0]
                
        if parent_id:
            conn.execute('''
                UPDATE students 
                SET name = ?, roll = ?, std = ?, class = ?, grNumber = ?, udiseNumber = ?, fatherName = ?, surname = ?, whatsappNo = ?, parentId = ?
                WHERE id = ?
            ''', (data['name'], data['roll'], data['std'], data['class'], 
                  data.get('grNumber', ''), data.get('udiseNumber', ''), 
                  data.get('fatherName', ''), data.get('surname', ''), 
                  data.get('whatsappNo', ''), parent_id, id))
        else:
            conn.execute('''
                UPDATE students 
                SET name = ?, roll = ?, std = ?, class = ?, grNumber = ?, udiseNumber = ?, fatherName = ?, surname = ?, whatsappNo = ?
                WHERE id = ?
            ''', (data['name'], data['roll'], data['std'], data['class'], 
                  data.get('grNumber', ''), data.get('udiseNumber', ''), 
                  data.get('fatherName', ''), data.get('surname', ''), 
                  data.get('whatsappNo', ''), id))
                  
        conn.commit()
        conn.close()
        return jsonify({"success": True})
        
    elif request.method == 'DELETE':
        conn.execute('DELETE FROM students WHERE id = ?', (id,))
        conn.execute('DELETE FROM attendance WHERE studentId = ?', (id,))
        conn.execute('DELETE FROM results WHERE studentId = ?', (id,))
        conn.execute('DELETE FROM fees WHERE studentId = ?', (id,))
        conn.execute('DELETE FROM badges WHERE studentId = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})

@app.route('/api/attendance', methods=['POST'])
def post_attendance():
    data = request.json
    conn = get_db_connection()
    # Delete existing if any to prevent duplicates for same day
    conn.execute('DELETE FROM attendance WHERE studentId = ? AND date = ?', (data['studentId'], data['date']))
    conn.execute('INSERT INTO attendance (studentId, status, date, note) VALUES (?, ?, ?, ?)',
               (data['studentId'], data['status'], data['date'], data.get('note', '')))
    
    # Notify parent if note exists (legacy behavior for single updates)
    if data.get('note'):
        student = conn.execute('SELECT name, parentId FROM students WHERE id = ?', (data['studentId'],)).fetchone()
        conn.execute('INSERT INTO notifications (userId, message, type, date) VALUES (?, ?, ?, ?)',
                   (student['parentId'], f"Note for {student['name']}: {data['note']}", 'attendance', datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/attendance/bulk', methods=['POST'])
def post_bulk_attendance():
    records = request.json # list of {studentId, status, date, note}
    conn = get_db_connection()
    
    for rec in records:
        conn.execute('DELETE FROM attendance WHERE studentId = ? AND date = ?', (rec['studentId'], rec['date']))
        conn.execute('INSERT INTO attendance (studentId, status, date, note) VALUES (?, ?, ?, ?)',
                   (rec['studentId'], rec['status'], rec['date'], rec.get('note', '')))
        
        # Batch Notify Parent
        student = conn.execute('SELECT name, parentId FROM students WHERE id = ?', (rec['studentId'],)).fetchone()
        if rec['status'] == 'present':
            msg = f"Your child {student['name']} is PRESENT in school today."
        else:
            msg = f"ATTENTION: Your child {student['name']} is ABSENT from school today."
            
        conn.execute('INSERT INTO notifications (userId, message, type, date) VALUES (?, ?, ?, ?)',
                   (student['parentId'], msg, 'attendance', datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/attendance/<date>', methods=['GET'])
def get_attendance_by_date(date):
    conn = get_db_connection()
    attendance = conn.execute('SELECT * FROM attendance WHERE date = ?', (date,)).fetchall()
    conn.close()
    return jsonify([dict(a) for a in attendance])

@app.route('/api/attendance/student/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    conn = get_db_connection()
    attendance = conn.execute('SELECT * FROM attendance WHERE studentId = ? ORDER BY date ASC', (student_id,)).fetchall()
    conn.close()
    return jsonify([dict(a) for a in attendance])

@app.route('/api/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    conn = get_db_connection()
    notifs = conn.execute('SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(n) for n in notifs])

@app.route('/api/results/student/<int:student_id>', methods=['GET'])
def get_results(student_id):
    conn = get_db_connection()
    results = conn.execute('SELECT * FROM results WHERE studentId = ?', (student_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in results])

@app.route('/api/lessons', methods=['GET', 'POST'])
def handle_lessons():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        conn.execute('INSERT INTO lessons (title, subject, chapter, pages, filePath, teacherId, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (data['title'], data['subject'], data['chapter'], data.get('pages', ''), data['filePath'], data['teacherId'], datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    
    lessons = conn.execute('SELECT * FROM lessons ORDER BY date DESC').fetchall()
    conn.close()
    return jsonify([dict(l) for l in lessons])

@app.route('/api/homework', methods=['GET', 'POST'])
def handle_homework():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        conn.execute('INSERT INTO homework (title, description, std, class, date, teacherId) VALUES (?, ?, ?, ?, ?, ?)',
                   (data['title'], data['description'], data['std'], data['class'], datetime.now().strftime('%Y-%m-%d'), data['teacherId']))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    
    std = request.args.get('std')
    cls = request.args.get('class')
    
    query = 'SELECT * FROM homework'
    params = []
    if std and cls:
        query += ' WHERE std = ? AND class = ?'
        params = [std, cls]
    elif std:
        query += ' WHERE std = ?'
        params = [std]
        
    query += ' ORDER BY date DESC'
    homework = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(h) for h in homework])

@app.route('/api/homework/<int:id>', methods=['PUT', 'DELETE'])
def handle_homework_detail(id):
    conn = get_db_connection()
    if request.method == 'PUT':
        data = request.json
        conn.execute('''
            UPDATE homework 
            SET title = ?, description = ?, std = ?, class = ?
            WHERE id = ?
        ''', (data['title'], data['description'], data['std'], data['class'], id))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    elif request.method == 'DELETE':
        conn.execute('DELETE FROM homework WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})

@app.route('/api/events', methods=['GET', 'POST'])
def handle_events():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        conn.execute('INSERT INTO events (title, description, date, teacherId, targetStd, targetClass, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (data['title'], data['description'], data['date'], data['teacherId'], data.get('targetStd'), data.get('targetClass'), 'pending'))
        
        # Notify matching parents
        t_std = data.get('targetStd')
        t_cls = data.get('targetClass')
        if t_std and t_cls:
            parents = conn.execute('SELECT DISTINCT parentId FROM students WHERE std = ? AND class = ?', (t_std, t_cls)).fetchall()
        elif t_std:
            parents = conn.execute('SELECT DISTINCT parentId FROM students WHERE std = ?', (t_std,)).fetchall()
        else:
            parents = conn.execute('SELECT DISTINCT parentId FROM students').fetchall()
            
        for p in parents:
            if p['parentId']:
                conn.execute('INSERT INTO notifications (userId, message, type, date) VALUES (?, ?, ?, ?)',
                           (p['parentId'], f"New School Event: {data['title']}", 'event', datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    
    std = request.args.get('std')
    cls = request.args.get('class')
    status_filter = request.args.get('status')
    
    query = 'SELECT * FROM events'
    conditions = []
    params = []
    
    if status_filter:
        conditions.append('status = ?')
        params.append(status_filter)
        
    if std:
        if cls:
            conditions.append('(targetStd IS NULL OR targetStd = "" OR (targetStd = ? AND (targetClass IS NULL OR targetClass = "" OR targetClass = ?)))')
            params.extend([std, cls])
        else:
            conditions.append('(targetStd IS NULL OR targetStd = "" OR targetStd = ?)')
            params.append(std)
            
    if conditions:
        query += ' WHERE ' + ' AND '.join(conditions)
        
    query += ' ORDER BY date DESC'
    events = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(e) for e in events])

@app.route('/api/events/<int:id>', methods=['PUT', 'DELETE'])
def handle_event_detail(id):
    conn = get_db_connection()
    if request.method == 'PUT':
        data = request.json
        conn.execute('''
            UPDATE events 
            SET title = ?, description = ?, date = ?, targetStd = ?, targetClass = ?, status = ?
            WHERE id = ?
        ''', (data['title'], data['description'], data['date'], data.get('targetStd'), data.get('targetClass'), data.get('status', 'pending'), id))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
        
    elif request.method == 'DELETE':
        event = conn.execute('SELECT title FROM events WHERE id = ?', (id,)).fetchone()
        if event:
            title = event['title']
            conn.execute('DELETE FROM notifications WHERE message LIKE ?', (f"%{title}%",))
            conn.execute('DELETE FROM events WHERE id = ?', (id,))
            conn.commit()
        conn.close()
        return jsonify({"success": True})

@app.route('/api/fees/<int:student_id>', methods=['GET'])
def get_fees(student_id):
    conn = get_db_connection()
    fees = conn.execute('SELECT * FROM fees WHERE studentId = ?', (student_id,)).fetchall()
    conn.close()
    return jsonify([dict(f) for f in fees])

@app.route('/api/badges/<int:student_id>', methods=['GET'])
def get_badges(student_id):
    conn = get_db_connection()
    badges = conn.execute('SELECT * FROM badges WHERE studentId = ?', (student_id,)).fetchall()
    conn.close()
    return jsonify([dict(b) for b in badges])

@app.route('/api/badges', methods=['POST'])
def post_badge():
    data = request.json
    conn = get_db_connection()
    conn.execute('INSERT INTO badges (studentId, badgeName, date, teacherId) VALUES (?, ?, ?, ?)',
               (data['studentId'], data['badgeName'], datetime.now().strftime('%Y-%m-%d'), data['teacherId']))
    
    # Notify parent
    student = conn.execute('SELECT name, parentId FROM students WHERE id = ?', (data['studentId'],)).fetchone()
    conn.execute('INSERT INTO notifications (userId, message, type, date) VALUES (?, ?, ?, ?)',
               (student['parentId'], f"🎉 {student['name']} earned a {data['badgeName']} badge!", 'achievement', datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/teachers', methods=['GET', 'POST'])
def handle_teachers():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json
        try:
            conn.execute('INSERT INTO users (name, email, phoneNumber, password, role, assignedStd, assignedClass) VALUES (?, ?, ?, ?, ?, ?, ?)',
                       (data['name'], data.get('email'), data.get('phoneNumber'), data['password'], 'teacher', data.get('assignedStd'), data.get('assignedClass')))
            conn.commit()
            return jsonify({"success": True})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"message": "Email or Phone Number already exists"}), 400
        finally:
            conn.close()
            
    teachers = conn.execute('SELECT id, name, email, phoneNumber, assignedStd, assignedClass FROM users WHERE role = "teacher"').fetchall()
    conn.close()
    return jsonify([dict(t) for t in teachers])

@app.route('/api/teachers/<int:id>', methods=['DELETE'])
def delete_teacher(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE id = ? AND role = "teacher"', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
