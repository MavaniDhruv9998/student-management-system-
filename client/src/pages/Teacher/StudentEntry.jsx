import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, MoreVertical, X, CheckCircle2, AlertCircle, Users, Edit, Trash2 } from 'lucide-react';
import { getStudents, saveStudent, updateStudent, deleteStudent } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const StudentEntry = ({ user }) => {
    const { t, language } = useTheme();
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStdFilter, setSelectedStdFilter] = useState('');
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        roll: '',
        std: user?.assignedStd || '',
        class: user?.assignedClass || '',
        grNumber: '',
        udiseNumber: '',
        fatherName: '',
        surname: '',
        whatsappNo: '',
        parentEmail: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const standards = ['Nursery', 'J.K.G.', 'S.K.G.', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const params = {};
            if (user?.role === 'teacher' && user?.assignedStd) {
                params.std = user.assignedStd;
                params.class = user.assignedClass;
            }
            const res = await getStudents(params);
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const openRegisterModal = () => {
        setEditingStudentId(null);
        setFormData({
            name: '',
            roll: '',
            std: user?.assignedStd || '',
            class: user?.assignedClass || '',
            grNumber: '',
            udiseNumber: '',
            fatherName: '',
            surname: '',
            whatsappNo: '',
            parentEmail: ''
        });
        setIsModalOpen(true);
        setActiveDropdownId(null);
    };

    const openEditModal = (student) => {
        setEditingStudentId(student.id);
        setFormData({
            name: student.name,
            roll: student.roll,
            std: student.std,
            class: student.class,
            grNumber: student.grNumber || '',
            udiseNumber: student.udiseNumber || '',
            fatherName: student.fatherName || '',
            surname: student.surname || '',
            whatsappNo: student.whatsappNo || '',
            parentEmail: student.parentEmail || ''
        });
        setIsModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleDeleteStudent = async (id, name) => {
        setActiveDropdownId(null);
        const confirmMsg = language === 'gu' 
            ? `શું તમે ખરેખર ${name} ને કાઢી નાખવા માંગો છો?` 
            : `Are you sure you want to delete student ${name}?`;
        if (window.confirm(confirmMsg)) {
            try {
                await deleteStudent(id);
                fetchStudents();
            } catch (err) {
                console.error("Failed to delete student", err);
                alert(language === 'gu' ? "વિદ્યાર્થીને કાઢી નાખવામાં નિષ્ફળતા" : "Failed to delete student");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: t('processing') || 'Processing...' });
        try {
            if (editingStudentId) {
                await updateStudent(editingStudentId, formData);
                setStatus({ type: 'success', msg: language === 'gu' ? `સફળતાપૂર્વક અપડેટ કર્યું ${formData.name}!` : `Successfully updated ${formData.name}!` });
            } else {
                await saveStudent(formData);
                setStatus({ type: 'success', msg: language === 'gu' ? `સફળતાપૂર્વક ઉમેર્યું ${formData.name}!` : `Successfully added ${formData.name}!` });
            }
            setTimeout(() => {
                setIsModalOpen(false);
                setEditingStudentId(null);
                setFormData({
                    name: '', roll: '',
                    std: user?.assignedStd || '',
                    class: user?.assignedClass || '',
                    grNumber: '', udiseNumber: '', fatherName: '',
                    surname: '', whatsappNo: '', parentEmail: ''
                });
                setStatus({ type: '', msg: '' });
                fetchStudents();
            }, 1500);
        } catch (err) {
            setStatus({ type: 'error', msg: language === 'gu' ? 'પ્રક્રિયા કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.' : 'Failed to process request. Please try again.' });
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (s.surname && s.surname.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStd = selectedStdFilter === '' || s.std === selectedStdFilter;
        return matchesSearch && matchesStd;
    });

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {t('students')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {language === 'gu' ? 'વિવિધ ધોરણોમાં નોંધાયેલા બધા વિદ્યાર્થીઓ જુઓ અને સંચાલન કરો.' : 'View and manage all registered students across different standards.'}
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={openRegisterModal}
                        className="btn btn-primary"
                        style={{ gap: '0.5rem', color: '#ffffff' }}
                    >
                        <UserPlus size={18} />
                        {t('add_student')}
                    </button>
                )}
            </div>

            {/* Stats & Search & Filtering */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={language === 'gu' ? "નામ અથવા રોલ નંબર દ્વારા શોધો..." : "Search by name or roll number..."}
                            style={{ paddingLeft: '3rem', width: '100%', maxWidth: '400px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Standard Dropdown Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                        <select 
                            value={selectedStdFilter} 
                            onChange={(e) => setSelectedStdFilter(e.target.value)}
                            style={{ width: '180px', padding: '0.5rem 1rem' }}
                        >
                            <option value="">{t('all_standards')}</option>
                            {standards.map(std => (
                                <option key={std} value={std}>{std}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('total_students')}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{students.length}</h3>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)', margin: '0 1rem' }} />
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{language === 'gu' ? 'ધોરણો' : 'Standards'}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{new Set(students.map(s => s.std)).size}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('roll_no')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('gr_no')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('udise_no')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{language === 'gu' ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('father_name')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('surname')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('std')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{t('class')}</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase' }}>{language === 'gu' ? 'વોટ્સએપ નંબર' : 'WhatsApp No'}</th>
                                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover-highlight">
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{student.roll}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.grNumber || '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.udiseNumber || '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{student.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.fatherName || '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.surname || '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}><span className="badge">{student.std}</span></td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}><span className="badge">{student.class}</span></td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.whatsappNo || '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        {user?.role === 'admin' && (
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <button 
                                                    onClick={() => setActiveDropdownId(activeDropdownId === student.id ? null : student.id)}
                                                    className="btn btn-ghost" 
                                                    style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeDropdownId === student.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: '100%',
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        boxShadow: 'var(--shadow)',
                                                        zIndex: 100,
                                                        minWidth: '120px',
                                                        padding: '0.5rem 0'
                                                    }}>
                                                        <button 
                                                            onClick={() => openEditModal(student)} 
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                width: '100%',
                                                                padding: '0.5rem 1rem',
                                                                border: 'none',
                                                                background: 'none',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                color: 'var(--text-main)',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            <Edit size={14} /> {t('edit')}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteStudent(student.id, student.name)} 
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                width: '100%',
                                                                padding: '0.5rem 1rem',
                                                                border: 'none',
                                                                background: 'none',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                color: '#ef4444',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            <Trash2 size={14} /> {t('delete')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="10" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Users size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>{language === 'gu' ? 'કોઈ વિદ્યાર્થીઓ મળ્યા નથી' : 'No students found'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '2rem'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10, paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    {editingStudentId ? (language === 'gu' ? 'વિદ્યાર્થી વિગતો સુધારો' : 'Edit Student Details') : t('add_student')}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="label">{language === 'gu' ? 'વિદ્યાર્થીનું પ્રથમ નામ' : 'Student First Name'}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Aarav"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('surname')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Patel"
                                            required
                                            value={formData.surname}
                                            onChange={e => setFormData({ ...formData, surname: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('father_name')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Rameshbhai"
                                            value={formData.fatherName}
                                            onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('roll_no')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 101"
                                            required
                                            value={formData.roll}
                                            onChange={e => setFormData({ ...formData, roll: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('std')}</label>
                                        <select
                                            required
                                            value={formData.std}
                                            onChange={e => setFormData({ ...formData, std: e.target.value })}
                                        >
                                            <option value="">{t('select_std')}</option>
                                            {standards.map(std => (
                                                <option key={std} value={std}>{std}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('class')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. A"
                                            required
                                            value={formData.class}
                                            onChange={e => setFormData({ ...formData, class: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('gr_no')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. GR-5421"
                                            value={formData.grNumber}
                                            onChange={e => setFormData({ ...formData, grNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('udise_no')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 240101..."
                                            value={formData.udiseNumber}
                                            onChange={e => setFormData({ ...formData, udiseNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{language === 'gu' ? 'વોટ્સએપ નંબર' : 'WhatsApp Number'}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 9876543210"
                                            value={formData.whatsappNo}
                                            onChange={e => setFormData({ ...formData, whatsappNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">{t('parent_email')}</label>
                                        <input
                                            type="email"
                                            placeholder="parent@example.com"
                                            required
                                            value={formData.parentEmail}
                                            onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', color: '#ffffff' }}>
                                        <CheckCircle2 size={18} />
                                        {editingStudentId ? t('save_changes') : t('submit')}
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                                        {t('cancel')}
                                    </button>
                                </div>

                                {status.msg && (
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        background: status.type === 'success' ? '#ecfdf5' : status.type === 'error' ? '#fef2f2' : '#f0f9ff',
                                        color: status.type === 'success' ? '#10b981' : status.type === 'error' ? '#ef4444' : '#0ea5e9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        {status.msg}
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-highlight:hover {
                    background: var(--primary-light) !important;
                }
                .badge {
                    background: var(--primary-light);
                    color: var(--primary);
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
                .form-group {
                    margin-bottom: 0.2rem;
                }
            `}} />
        </div>
    );
};

export default StudentEntry;
