import React, { useState, useEffect } from 'react';
import { CalendarPlus, Calendar, Plus, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getEvents, postEvent, updateEvent, deleteEvent } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Events = ({ user }) => {
    const { t, language } = useTheme();
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        targetStd: '',
        targetClass: '',
        status: 'pending'
    });

    const standards = ['Nursery', 'J.K.G.', 'S.K.G.', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            // Filter to show all events or teacher specific events
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    };

    const openAddModal = () => {
        setEditingEventId(null);
        setFormData({
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            targetStd: '',
            targetClass: '',
            status: 'pending'
        });
        setIsModalOpen(true);
        setActiveDropdownId(null);
    };

    const openEditModal = (event) => {
        setEditingEventId(event.id);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date,
            targetStd: event.targetStd || '',
            targetClass: event.targetClass || '',
            status: event.status || 'pending'
        });
        setIsModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleDeleteEvent = async (id) => {
        setActiveDropdownId(null);
        const confirmMsg = language === 'gu' 
            ? 'શું તમે ખરેખર આ કાર્યક્રમ કાઢી નાખવા માંગો છો?' 
            : 'Are you sure you want to delete this event?';
        if (window.confirm(confirmMsg)) {
            try {
                await deleteEvent(id);
                fetchEvents();
            } catch (err) {
                console.error("Failed to delete event", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingEventId) {
                await updateEvent(editingEventId, formData);
            } else {
                await postEvent({ ...formData, teacherId: user.id });
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err) {
            console.error("Failed to save event", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {t('events')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {language === 'gu' ? 'શાળાના કાર્યક્રમો, પરીક્ષાઓ અથવા વર્ગ પ્રવૃત્તિઓની જાહેરાત કરો.' : 'Announce exams, holidays, or school activities to parents.'}
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', color: '#ffffff' }}
                >
                    <Plus size={18} />
                    {t('add_event')}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <button 
                    onClick={() => setActiveTab('pending')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    {language === 'gu' ? 'બાકી કાર્યક્રમો' : 'Pending Events'}
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'completed' ? '2px solid var(--primary)' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    {language === 'gu' ? 'પૂર્ણ થયેલ કાર્યક્રમો' : 'Completed Events'}
                </button>
            </div>

            {/* Event List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.filter(e => (e.status || 'pending') === activeTab).map(e => (
                    <div key={e.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--surface)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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
                        
                        {/* 3-dot menu dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setActiveDropdownId(activeDropdownId === e.id ? null : e.id)}
                                className="btn btn-ghost" 
                                style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
                            >
                                <MoreVertical size={18} />
                            </button>
                            
                            {activeDropdownId === e.id && (
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
                                        onClick={() => openEditModal(e)}
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
                                        onClick={() => handleDeleteEvent(e.id)}
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
                    </div>
                ))}

                {events.filter(e => (e.status || 'pending') === activeTab).length === 0 && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Calendar size={36} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>{t('no_events')}</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ width: '450px', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                                    {editingEventId ? (language === 'gu' ? 'કાર્યક્રમ સુધારો' : 'Edit Event') : t('add_event')}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ padding: '0.2rem' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="label">{t('title')}</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Science Fair" />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="label">{t('description')}</label>
                                    <textarea required rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Details..." />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="label">{t('date')}</label>
                                    <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label className="label">{t('target_std')}</label>
                                        <select value={formData.targetStd} onChange={e => setFormData({ ...formData, targetStd: e.target.value })}>
                                            <option value="">{t('general')}</option>
                                            {standards.map(std => <option key={std} value={std}>{std}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">{t('target_class')}</label>
                                        <input type="text" value={formData.targetClass} onChange={e => setFormData({ ...formData, targetClass: e.target.value })} placeholder="e.g. A" />
                                    </div>
                                </div>
                                
                                {editingEventId && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="label">{t('status')}</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="pending">{t('pending')}</option>
                                            <option value="completed">{t('completed')}</option>
                                        </select>
                                    </div>
                                )}
                                
                                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', color: '#ffffff' }}>
                                    {loading ? t('processing') || 'Processing...' : (editingEventId ? t('save_changes') : t('submit'))}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }
            `}} />
        </motion.div>
    );
};

export default Events;
