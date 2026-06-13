import React, { useState, useEffect } from 'react';
import { Search, UserCheck, MessageSquare, Send, CheckCircle2, ChevronRight, AlertCircle, Star } from 'lucide-react';
import { getStudents, postAttendance, getAttendance, postBadge, postBulkAttendance } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({}); // studentId -> { status, note }
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tempNote, setTempNote] = useState('');
    const [selectedStd, setSelectedStd] = useState(user?.assignedStd || '');
    const [pendingStatus, setPendingStatus] = useState('');

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stuRes, attRes] = await Promise.all([getStudents(), getAttendance(date)]);
            setStudents(stuRes.data);

            const attData = {};
            // Default all to present first
            stuRes.data.forEach(s => {
                attData[s.id] = { status: 'present', note: '' };
            });
            // Override with saved attendance
            attRes.data.forEach(a => {
                attData[a.studentId] = { status: a.status, note: a.note || '' };
            });
            setAttendanceMap(attData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = (student) => {
        const current = attendanceMap[student.id] || { status: 'present', note: '' };
        const newStatus = current.status === 'present' ? 'absent' : 'present';

        setAttendanceMap({
            ...attendanceMap,
            [student.id]: { ...current, status: newStatus }
        });
    };

    const handleSubmitAll = async () => {
        const records = filteredStudents.map(s => ({
            studentId: s.id,
            status: attendanceMap[s.id]?.status || 'present',
            date: date,
            note: attendanceMap[s.id]?.note || ''
        }));

        setLoading(true);
        try {
            await postBulkAttendance(records);
            alert(`Attendance for ${selectedStd} submitted and parents notified via portal!`);

            // Reset state
            const resetData = {};
            students.forEach(s => {
                resetData[s.id] = { status: 'present', note: '' };
            });
            setAttendanceMap(resetData);
            setSelectedStd('');
            setSearchTerm('');
        } catch (err) {
            console.error(err);
            alert("Failed to submit attendance.");
        } finally {
            setLoading(false);
        }
    };

    const saveNote = async () => {
        const studentId = selectedStudent.id;
        const current = attendanceMap[studentId] || { status: 'present', note: '' };
        const newData = { ...current, note: tempNote };
        setAttendanceMap({ ...attendanceMap, [studentId]: newData });

        // Modal note is saved locally, and will be submitted with 'Submit All'
        setSelectedStudent(null);
        setTempNote('');
    };

    const standards = ['Nursery', 'J.K.G.', 'S.K.G.', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    const filteredStudents = students.filter(s => {
        // Filter by Standard first
        if (!selectedStd) return false;
        if (s.std !== selectedStd) return false;

        // Filter by Class if user has an assigned class
        if (user?.role === 'teacher' && user?.assignedClass && s.class !== user.assignedClass) {
            return false;
        }

        // Then filter by Search Term (Roll Number only)
        if (searchTerm && !s.roll.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        return true;
    });

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Class Attendance</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '180px', background: 'white' }}
                            />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <select
                                value={selectedStd}
                                onChange={(e) => setSelectedStd(e.target.value)}
                                style={{ width: '160px', background: 'white' }}
                            >
                                <option value="">Select Standard</option>
                                {standards.map(std => (
                                    <option key={std} value={std}>{std}</option>
                                ))}
                            </select>
                        </div>

                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            All students are marked <strong>Present</strong> by default.
                        </span>
                    </div>
                </div>

                <div className="glass" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 1rem',
                    width: '300px',
                    borderRadius: '12px',
                    opacity: selectedStd ? 1 : 0.5,
                    pointerEvents: selectedStd ? 'auto' : 'none'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={selectedStd ? "Search Roll No..." : "Select standard first"}
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!selectedStd}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Roll</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Student Name</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const att = attendanceMap[student.id] || { status: 'present', note: '' };
                            return (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{student.roll}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <button
                                            onClick={() => handleStatusClick(student)}
                                            className="btn"
                                            style={{
                                                background: att.status === 'present' ? '#dcfce7' : '#fee2e2',
                                                color: att.status === 'present' ? '#166534' : '#991b1b',
                                                padding: '0.4rem 1rem',
                                                fontSize: '0.8rem',
                                                textTransform: 'uppercase',
                                                minWidth: '120px',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                border: att.status === 'present' ? '1px solid #86efac' : '1px solid #fca5a5'
                                            }}
                                        >
                                            {att.status === 'present' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {att.status}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {selectedStd && filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No students found for standard {selectedStd} {searchTerm && `with roll no "${searchTerm}"`}
                                </td>
                            </tr>
                        )}
                        {!selectedStd && (
                            <tr>
                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Please select a standard to view student list
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedStd && filteredStudents.length > 0 && (
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSubmitAll}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2.5rem', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}
                    >
                        <Send size={18} />
                        Submit & Notify Parents
                    </button>
                </div>
            )}

            {/* Note Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card"
                            style={{ width: '400px' }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Additional Info for {selectedStudent.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Add an optional observation or award a badge. This will be sent with the final attendance report.
                            </p>
                            <textarea
                                rows="4"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Write your observation here..."
                                style={{ marginBottom: '1.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setSelectedStudent(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={saveNote} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Status & Note</button>
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star size={16} color="#f6ad55" /> Reward Achievement
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {['Star Student', 'Hard Worker', 'Creative Mind', 'Top Logic'].map(badge => (
                                        <button
                                            key={badge}
                                            onClick={async () => {
                                                const userStr = localStorage.getItem('school_user');
                                                const userId = userStr ? JSON.parse(userStr).id : 1;
                                                await postBadge({ studentId: selectedStudent.id, badgeName: badge, teacherId: userId });
                                                alert(`${badge} badge awarded!`);
                                            }}
                                            className="btn btn-ghost"
                                            style={{ fontSize: '0.75rem', justifyContent: 'center', background: '#fffaf0', border: '1px solid #feebc8' }}
                                        >
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Attendance;
