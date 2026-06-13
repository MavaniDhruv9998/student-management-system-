import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Clock, ChevronRight, FileText } from 'lucide-react';
import { getHomework, postHomework } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Homework = ({ user }) => {
    const { t, language } = useTheme();
    const [homeworks, setHomeworks] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    const [newHomework, setNewHomework] = useState({
        title: '',
        subject: '',
        chapter: '',
        pages: '',
        filePath: '',
        std: user?.assignedStd || '',
        class: user?.assignedClass || ''
    });

    useEffect(() => {
        fetchHomeworks();
    }, []);

    const fetchHomeworks = async () => {
        try {
            const params = {};
            if (user?.role === 'teacher' && user?.assignedStd) {
                params.std = user.assignedStd;
                params.class = user.assignedClass;
            }
            const res = await getHomework(params);
            setHomeworks(res.data);
        } catch (err) {
            console.error("Failed to fetch homeworks", err);
        }
    };

    const handleFileSelect = (file) => {
        if (file && file.type === 'application/pdf') {
            setSelectedFileName(file.name);
            setNewHomework(prev => ({ ...prev, filePath: file.name }));
        } else if (file) {
            alert(language === 'gu' ? 'કૃપા કરીને માન્ય PDF ફાઇલ પસંદ કરો' : 'Please select a valid PDF file');
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newHomework.filePath) {
            alert(language === 'gu' ? 'કૃપા કરીને પહેલા PDF ફાઇલ પસંદ કરો' : 'Please select a PDF file first');
            return;
        }
        try {
            await postHomework({
                ...newHomework,
                teacherId: user.id
            });
            setNewHomework({ 
                title: '', 
                subject: '', 
                chapter: '', 
                pages: '', 
                filePath: '',
                std: user?.assignedStd || '',
                class: user?.assignedClass || ''
            });
            setSelectedFileName('');
            setIsUploading(false);
            fetchHomeworks();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {language === 'gu' ? 'ગૃહકાર્ય ભંડાર' : 'Homework Repository'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {language === 'gu' ? 'તમારા વિદ્યાર્થીઓ માટે અભ્યાસ સામગ્રી અને ગૃહકાર્ય અપલોડ કરો અને સંચાલિત કરો.' : 'Upload and manage study materials and homework for your students.'}
                    </p>
                </div>
                <button onClick={() => setIsUploading(true)} className="btn btn-primary" style={{ color: '#ffffff' }}>
                    <FileUp size={18} />
                    {language === 'gu' ? 'નવું ગૃહકાર્ય અપલોડ કરો' : 'Upload New Homework'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {homeworks.map(hw => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={hw.id} className="card" style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)', height: 'fit-content' }}>
                                <FileText size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{hw.title}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{hw.subject}</span>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Ch. {hw.chapter}</span>
                                    {hw.pages && <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Pages: {hw.pages}</span>}
                                    <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Std {hw.std} - {hw.class}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={14} /> {hw.date}
                            </span>
                            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: 'var(--primary)' }}>
                                {language === 'gu' ? 'PDF જુઓ' : 'View PDF'} <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {homeworks.length === 0 && (
                    <div className="card" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={36} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>{t('no_homework')}</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isUploading && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ width: '450px', background: 'var(--surface)' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                {language === 'gu' ? 'ગૃહકાર્ય PDF અપલોડ કરો' : 'Upload Homework PDF'}
                            </h3>
                            <form onSubmit={handleUpload}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                        {language === 'gu' ? 'ગૃહકાર્ય શીર્ષક' : 'Homework Title'}
                                    </label>
                                    <input required type="text" value={newHomework.title} onChange={e => setNewHomework({ ...newHomework, title: e.target.value })} placeholder="e.g. Introduction to Algebra" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {language === 'gu' ? 'વિષય' : 'Subject'}
                                        </label>
                                        <input required type="text" value={newHomework.subject} onChange={e => setNewHomework({ ...newHomework, subject: e.target.value })} placeholder="Mathematics" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {language === 'gu' ? 'પ્રકરણ' : 'Chapter'}
                                        </label>
                                        <input required type="text" value={newHomework.chapter} onChange={e => setNewHomework({ ...newHomework, chapter: e.target.value })} placeholder="Unit 1" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {t('std')}
                                        </label>
                                        <input required type="text" value={newHomework.std} onChange={e => setNewHomework({ ...newHomework, std: e.target.value })} placeholder="10" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {t('class')}
                                        </label>
                                        <input required type="text" value={newHomework.class} onChange={e => setNewHomework({ ...newHomework, class: e.target.value })} placeholder="A" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                        {language === 'gu' ? 'પૃષ્ઠ પસંદગી' : 'Page Selection'}
                                    </label>
                                    <input type="text" value={newHomework.pages} onChange={e => setNewHomework({ ...newHomework, pages: e.target.value })} placeholder="e.g. 1-5, 8, 12-15" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                />
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={onDragOver}
                                    onDrop={onDrop}
                                    style={{
                                        background: selectedFileName ? '#f0fdf4' : 'var(--background)',
                                        border: selectedFileName ? '2px dashed #22c55e' : '2px dashed var(--border)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        borderRadius: '12px',
                                        marginBottom: '2rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FileUp size={32} color={selectedFileName ? '#22c55e' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.85rem', color: selectedFileName ? '#166534' : 'var(--text-muted)' }}>
                                        {selectedFileName ? `Selected: ${selectedFileName}` : (language === 'gu' ? 'PDF ફાઇલ અહીં ક્લિક કરો અથવા ખેંચો' : 'Click or drag PDF file here')}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => { setIsUploading(false); setSelectedFileName(''); }} className="btn btn-ghost" style={{ flex: 1 }}>
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', color: '#ffffff' }}>
                                        {language === 'gu' ? 'અપલોડ કરો' : 'Upload Now'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Homework;
