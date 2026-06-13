import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserCog, Download, Upload, Trash2, Edit, Save, Plus, X, FileText, FileSpreadsheet, File as FileIcon, Calendar, Sun, Moon, Globe } from 'lucide-react';
import { getStudents, saveStudent, getTeachers, saveTeacher, deleteTeacher, getEvents, postEvent, updateEvent, deleteEvent } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import StudentEntry from '../Teacher/StudentEntry';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = ({ user, onLogout }) => {
    const { theme, toggleTheme, language, setLanguage, t } = useTheme();
    const [view, setView] = useState('overview');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [events, setEvents] = useState([]);
    const [eventTab, setEventTab] = useState('pending');
    
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        phoneNumber: '',
        password: '',
        assignedStd: '',
        assignedClass: ''
    });

    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        targetStd: '',
        targetClass: '',
        status: 'pending'
    });

    const standards = ['Nursery', 'J.K.G.', 'S.K.G.', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        try {
            if (view === 'students' || view === 'overview') {
                const res = await getStudents();
                setStudents(res.data);
            }
            if (view === 'teachers' || view === 'overview') {
                const res = await getTeachers();
                setTeachers(res.data);
            }
            if (view === 'events' || view === 'overview') {
                const res = await getEvents();
                setEvents(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTeacher = async (id) => {
        const confirmMsg = language === 'gu' ? 'શું તમે ખરેખર આ શિક્ષકને કાઢી નાખવા માંગો છો?' : 'Are you sure you want to delete this teacher?';
        if (window.confirm(confirmMsg)) {
            await deleteTeacher(id);
            fetchData();
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await saveTeacher(newTeacher);
            setIsAddingTeacher(false);
            setNewTeacher({ name: '', phoneNumber: '', password: '', assignedStd: '', assignedClass: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding teacher');
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEventId) {
                await updateEvent(editingEventId, newEvent);
            } else {
                await postEvent({ ...newEvent, teacherId: user.id });
            }
            setIsAddingEvent(false);
            fetchData();
        } catch (err) {
            alert('Error saving event');
        }
    };

    const handleDeleteEvent = async (id) => {
        const confirmMsg = language === 'gu' ? 'શું તમે ખરેખર આ કાર્યક્રમ કાઢી નાખવા માંગો છો?' : 'Are you sure you want to delete this event?';
        if (window.confirm(confirmMsg)) {
            try {
                await deleteEvent(id);
                fetchData();
            } catch (err) {
                alert('Error deleting event');
            }
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(students);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "students_data.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Student Directory", 14, 15);
        const tableData = students.map(s => [s.roll, s.name, s.std, s.class, s.whatsappNo]);
        doc.autoTable({
            startY: 20,
            head: [['Roll', 'Name', 'Std', 'Class', 'WhatsApp']],
            body: tableData,
        });
        doc.save("students_data.pdf");
    };

    const exportToWord = async () => {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Student Directory", heading: "Heading1" }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Roll")] }),
                                    new TableCell({ children: [new Paragraph("Name")] }),
                                    new TableCell({ children: [new Paragraph("Std")] }),
                                    new TableCell({ children: [new Paragraph("Class")] }),
                                ]
                            }),
                            ...students.map(s => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(s.roll || "")] }),
                                    new TableCell({ children: [new Paragraph(s.name || "")] }),
                                    new TableCell({ children: [new Paragraph(s.std || "")] }),
                                    new TableCell({ children: [new Paragraph(s.class || "")] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "students_data.docx");
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            console.log("Imported Excel Data:", json);
            alert("Data read successfully! " + json.length + " records found.");
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 1rem' }}>
                    <img 
                        src="/logo.png" 
                        alt="School Logo" 
                        style={{ height: '42px', width: '42px', objectFit: 'contain', background: 'white', borderRadius: '6px', padding: '2px' }} 
                    />
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, fontWeight: '800', lineHeight: 1.2 }}>
                        {t('school_name')}
                    </h2>
                </div>

                <nav style={{ flex: 1 }}>
                    <button onClick={() => setView('overview')} className={`nav-link ${view === 'overview' ? 'active' : ''}`}><LayoutDashboard size={20} /> {t('dashboard')}</button>
                    <button onClick={() => setView('teachers')} className={`nav-link ${view === 'teachers' ? 'active' : ''}`}><UserCog size={20} /> {t('teachers')}</button>
                    <button onClick={() => setView('students')} className={`nav-link ${view === 'students' ? 'active' : ''}`}><Users size={20} /> {t('students')}</button>
                    <button onClick={() => setView('events')} className={`nav-link ${view === 'events' ? 'active' : ''}`}><Calendar size={20} /> {t('events')}</button>
                </nav>

                <button onClick={onLogout} className="btn btn-ghost nav-link" style={{ width: '100%', marginTop: 'auto', justifyContent: 'flex-start', color: '#ef4444' }}>
                    <Edit size={18} style={{ transform: 'rotate(90deg)' }} /> {t('logout')}
                </button>
            </aside>

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('admin_dashboard')}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {language === 'gu' ? 'શિક્ષકો, વિદ્યાર્થીઓ અને પદ્ધતિ ડેટાનું સંચાલન કરો.' : 'Manage teachers, students, events and system data.'}
                        </p>
                    </div>
                    
                    {/* Header Controls */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        >
                            <Globe size={15} />
                            {language === 'en' ? 'ગુજરાતી' : 'English'}
                        </button>
                        <button 
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text-main)' }}
                        >
                            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                        </button>
                    </div>
                </header>

                {view === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setView('teachers')}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)' }}>{teachers.length}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{t('total_teachers')}</div>
                        </div>
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setView('students')}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--secondary)' }}>{students.length}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{t('total_students')}</div>
                        </div>
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setView('events')}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent)' }}>{events.length}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{t('total_events')}</div>
                        </div>
                        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--secondary)' }}>99%</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>System Health</div>
                        </div>
                    </div>
                )}

                {view === 'teachers' && (
                    <div className="card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Faculty Members</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assign logins via phone number and classroom.</p>
                            </div>
                            <button onClick={() => setIsAddingTeacher(true)} className="btn btn-primary" style={{ color: '#ffffff' }}><Plus size={18} /> Add Teacher</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead style={{ background: 'var(--primary-light)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)' }}>Instructor</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)' }}>Phone Number</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)' }}>Classroom</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-main)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(t => (
                                    <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{t.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t.phoneNumber || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {t.assignedStd ? (
                                                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                    {t.assignedStd} - {t.assignedClass}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not Assigned</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button onClick={() => handleDeleteTeacher(t.id)} className="btn btn-ghost" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'students' && (
                    <div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--primary-light)', padding: '0.4rem', borderRadius: '12px' }}>
                                <button onClick={exportToExcel} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} title="Export to Excel">
                                    <FileSpreadsheet size={16} color="#166534" /> Excel
                                </button>
                                <button onClick={exportToWord} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} title="Export to Word">
                                    <FileIcon size={16} color="#1d4ed8" /> Word
                                </button>
                                <button onClick={exportToPDF} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} title="Export to PDF">
                                    <FileText size={16} color="#991b1b" /> PDF
                                </button>
                            </div>
                            <label className="btn btn-primary" style={{ cursor: 'pointer', gap: '0.5rem', color: '#ffffff' }}>
                                <Upload size={18} /> Import Excel
                                <input type="file" hidden onChange={handleImportExcel} accept=".xlsx, .xls" />
                            </label>
                        </div>
                        <StudentEntry user={user} />
                    </div>
                )}

                {view === 'events' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('events')}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'gu' ? 'કાર્યક્રમો બનાવો અને મેનેજ કરો.' : 'Schedule and manage school events.'}</p>
                            </div>
                            <button onClick={() => { setIsAddingEvent(true); setEditingEventId(null); setNewEvent({ title: '', description: '', date: '', targetStd: '', targetClass: '', status: 'pending' }); }} className="btn btn-primary" style={{ color: '#ffffff' }}>
                                <Plus size={18} /> {t('add_event')}
                            </button>
                        </div>
                        
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <button 
                                onClick={() => setEventTab('pending')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    fontWeight: '600',
                                    color: eventTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
                                    borderBottom: eventTab === 'pending' ? '2px solid var(--primary)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('upcoming')}
                            </button>
                            <button 
                                onClick={() => setEventTab('completed')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    fontWeight: '600',
                                    color: eventTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)',
                                    borderBottom: eventTab === 'completed' ? '2px solid var(--primary)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('completed')}
                            </button>
                        </div>
                        
                        {/* Event Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {events.filter(e => e.status === eventTab).map(e => (
                                <div key={e.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <span style={{ 
                                                background: e.status === 'completed' ? '#d1fae5' : '#fef3c7', 
                                                color: e.status === 'completed' ? '#065f46' : '#92400e',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700'
                                            }}>
                                                {e.status === 'completed' ? t('completed') : t('upcoming')}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                {e.date}
                                            </span>
                                            {e.targetStd ? (
                                                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                    Std {e.targetStd} - {e.targetClass || 'All'}
                                                </span>
                                            ) : (
                                                <span style={{ background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                    {t('general')}
                                                </span>
                                            )}
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{e.title}</h4>
                                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{e.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => {
                                                setEditingEventId(e.id);
                                                setNewEvent({
                                                    title: e.title,
                                                    description: e.description,
                                                    date: e.date,
                                                    targetStd: e.targetStd || '',
                                                    targetClass: e.targetClass || '',
                                                    status: e.status
                                                });
                                                setIsAddingEvent(true);
                                            }}
                                            className="btn btn-ghost" 
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(e.id)}
                                            className="btn btn-ghost" 
                                            style={{ padding: '0.5rem', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {events.filter(e => e.status === eventTab).length === 0 && (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Calendar size={36} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>{t('no_events')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {isAddingTeacher && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '450px', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--text-main)', fontWeight: '700' }}>New Teacher Account</h3>
                                    <button onClick={() => setIsAddingTeacher(false)} className="btn btn-ghost" style={{ padding: '0.2rem' }}><X size={20} /></button>
                                </div>
                                <form onSubmit={handleAddTeacher}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">Full Name</label>
                                        <input required type="text" value={newTeacher.name} onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })} placeholder="e.g. John Doe" />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">Phone Number (Login ID)</label>
                                        <input required type="text" value={newTeacher.phoneNumber} onChange={e => setNewTeacher({ ...newTeacher, phoneNumber: e.target.value })} placeholder="e.g. 9876543210" />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">Initial Password</label>
                                        <input required type="password" value={newTeacher.password} onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })} />
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>Classroom Assignment</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label className="label">Standard</label>
                                                <select value={newTeacher.assignedStd} onChange={e => setNewTeacher({ ...newTeacher, assignedStd: e.target.value })}>
                                                    <option value="">Select Std</option>
                                                    {standards.map(std => <option key={std} value={std}>{std}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Section/Class</label>
                                                <input type="text" value={newTeacher.assignedClass} onChange={e => setNewTeacher({ ...newTeacher, assignedClass: e.target.value })} placeholder="e.g. A" />
                                            </div>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '2rem', color: '#ffffff' }}>Create Teacher Account</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isAddingEvent && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '450px', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    <h3 style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                                        {editingEventId ? (language === 'gu' ? 'કાર્યક્રમ સુધારો' : 'Edit Event') : t('add_event')}
                                    </h3>
                                    <button onClick={() => setIsAddingEvent(false)} className="btn btn-ghost" style={{ padding: '0.2rem' }}><X size={20} /></button>
                                </div>
                                <form onSubmit={handleEventSubmit}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">{t('title')}</label>
                                        <input required type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Science Fair" />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">{t('description')}</label>
                                        <textarea required rows="3" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Details..." />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="label">{t('date')}</label>
                                        <input required type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label className="label">{t('target_std')}</label>
                                            <select value={newEvent.targetStd} onChange={e => setNewEvent({ ...newEvent, targetStd: e.target.value })}>
                                                <option value="">{t('general')}</option>
                                                {standards.map(std => <option key={std} value={std}>{std}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">{t('target_class')}</label>
                                            <input type="text" value={newEvent.targetClass} onChange={e => setNewEvent({ ...newEvent, targetClass: e.target.value })} placeholder="e.g. A" />
                                        </div>
                                    </div>
                                    
                                    {editingEventId && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label className="label">{t('status')}</label>
                                            <select value={newEvent.status} onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}>
                                                <option value="pending">{t('pending')}</option>
                                                <option value="completed">{t('completed')}</option>
                                            </select>
                                        </div>
                                    )}
                                    
                                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', color: '#ffffff' }}>
                                        {editingEventId ? t('save_changes') : t('submit')}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }
            `}} />
        </div>
    );
};

export default AdminDashboard;

