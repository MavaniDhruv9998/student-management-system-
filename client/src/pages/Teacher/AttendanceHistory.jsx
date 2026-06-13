import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStudents, getAttendance } from '../../services/api';
import { motion } from 'framer-motion';

const AttendanceHistory = () => {
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStd, setSelectedStd] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const standards = ['Nursery', 'J.K.G.', 'S.K.G.', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stuRes, attRes] = await Promise.all([getStudents(), getAttendance(date)]);
            setStudents(stuRes.data);

            const attData = {};
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

    const filteredStudents = students.filter(s => {
        if (!selectedStd) return false;
        if (s.std !== selectedStd) return false;
        if (searchTerm && !s.roll.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendance Records</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '180px', background: 'white' }}
                            />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Standard</label>
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
                    </div>
                </div>

                <div className="glass" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 1rem',
                    width: '300px',
                    borderRadius: '12px'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search Roll No..."
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Note / Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const att = attendanceMap[student.id];
                            return (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{student.roll}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>{student.name}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {att ? (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: att.status === 'present' ? '#166534' : '#991b1b',
                                                fontWeight: '600',
                                                fontSize: '0.85rem'
                                            }}>
                                                {att.status === 'present' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                {att.status.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>NOT MARKED</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {att?.note || '-'}
                                    </td>
                                </tr>
                            );
                        })}
                        {selectedStd && filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No records found for this selection.
                                </td>
                            </tr>
                        )}
                        {!selectedStd && (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Select date and standard to view records.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default AttendanceHistory;
