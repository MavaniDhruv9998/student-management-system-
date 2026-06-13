import React, { useState, useEffect } from 'react';
import { Bell, User, Calendar, BookOpen, LogOut, FileText, Globe, Sun, Moon, X } from 'lucide-react';
import { getNotifications, getStudents, getHomework, getFees, getStudentAttendance, getEvents } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const ParentDashboard = ({ user, onLogout }) => {
    const { theme, toggleTheme, language, setLanguage, t } = useTheme();
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [homework, setHomework] = useState([]);
    const [events, setEvents] = useState([]);
    const [fees, setFees] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [parentTab, setParentTab] = useState('homework'); // 'homework' or 'events'

    useEffect(() => {
        const loadParentData = async () => {
            try {
                const stuRes = await getStudents();
                const myChildren = stuRes.data.filter(s => s.parentId === user.id);
                setChildren(myChildren);
                if (myChildren.length > 0) setSelectedStudent(myChildren[0]);

                const notifRes = await getNotifications(user.id);
                setNotifications(notifRes.data);

                const hwRes = await getHomework();
                setHomework(hwRes.data);

                const evRes = await getEvents();
                setEvents(evRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadParentData();
    }, [user.id]);

    useEffect(() => {
        if (selectedStudent) {
            const loadStudentData = async () => {
                try {
                    const [feeRes, attRes] = await Promise.all([
                        getFees(selectedStudent.id),
                        getStudentAttendance(selectedStudent.id)
                    ]);
                    setFees(feeRes.data);
                    setAttendanceHistory(attRes.data);
                } catch (err) {
                    console.error(err);
                }
            };
            loadStudentData();
        }
    }, [selectedStudent]);

    const getAttendanceChartData = () => {
        const months = {};
        attendanceHistory.forEach(rec => {
            const date = new Date(rec.date);
            const monthName = date.toLocaleString('default', { month: 'short' });
            if (!months[monthName]) {
                months[monthName] = { name: monthName, Present: 0, Absent: 0 };
            }
            if (rec.status === 'present') {
                months[monthName].Present += 1;
            } else {
                months[monthName].Absent += 1;
            }
        });
        
        const data = Object.values(months);
        if (data.length === 0) {
            return [{ name: 'No Data', Present: 0, Absent: 0 }];
        }
        return data;
    };

    const filteredHomework = homework.filter(hw => hw.std === selectedStudent?.std && hw.class === selectedStudent?.class);
    const filteredEvents = events.filter(e => !e.targetStd || e.targetStd === '' || (e.targetStd === selectedStudent?.std && (!e.targetClass || e.targetClass === '' || e.targetClass === selectedStudent?.class)));

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
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

                <div style={{ padding: '0 1rem', flex: 1 }}>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em', fontWeight: '700' }}>
                        {t('switch_child')}
                    </h4>
                    {children.map(child => {
                        const isActive = selectedStudent?.id === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => setSelectedStudent(child)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '14px',
                                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: isActive ? 'var(--primary-light)' : 'var(--surface)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    marginBottom: '0.75rem',
                                    cursor: 'pointer',
                                    boxShadow: isActive ? 'var(--shadow)' : 'none',
                                    transition: 'all 0.2s',
                                    color: 'var(--text-main)',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <div style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '10px', 
                                    background: isActive ? 'var(--primary)' : 'var(--primary-light)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: '700', 
                                    color: isActive ? 'white' : 'var(--primary)',
                                    fontSize: '1rem'
                                }}>
                                    {child.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)' }}>{child.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        Std {child.std} - Class {child.class}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button onClick={onLogout} className="btn btn-ghost nav-link" style={{ width: '100%', marginTop: 'auto', justifyContent: 'flex-start', color: '#ef4444' }}>
                    <LogOut size={18} />
                    {t('logout')}
                </button>
            </aside>

            {/* Main Area */}
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {t('welcome')}, {user.name}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {language === 'gu' ? 'તમારા બાળકની દૈનિક પ્રગતિ અને શાળા પ્રવૃત્તિઓનો અહેવાલ મેળવો.' : "Track your child's daily growth and school activities."}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
                        {/* Language switcher */}
                        <button 
                            onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        >
                            <Globe size={15} />
                            {language === 'en' ? 'ગુજરાતી' : 'English'}
                        </button>
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text-main)' }}
                        >
                            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                        </button>

                        {/* Profile Button */}
                        <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <User size={15} />
                            {t('profile')}
                        </button>

                        {/* Notification Bell Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="btn btn-ghost"
                                style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer' }}
                            >
                                <Bell size={20} color="var(--text-muted)" />
                                {notifications.length > 0 && (
                                    <div style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', border: '2px solid var(--surface)' }}>
                                        {notifications.length}
                                    </div>
                                )}
                            </button>
                            
                            {isNotifOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '125%',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow)',
                                    zIndex: 1000,
                                    width: '320px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: '1rem'
                                }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text-main)' }}>
                                        {t('notification_bell')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {notifications.map(notif => (
                                            <div key={notif.id} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--primary-light)', borderLeft: notif.type === 'attendance' ? '4px solid #ef4444' : '4px solid #3b82f6' }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>{notif.message}</p>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{notif.date.split('T')[0]}</span>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: '1rem 0' }}>{t('no_notifications')}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Student Growth (Homework/Events) & Attendance Chart Section */}
                        <section className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('student_growth')}</h3>
                                
                                {/* Inner Tabs */}
                                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--primary-light)', padding: '4px', borderRadius: '10px' }}>
                                    <button 
                                        onClick={() => setParentTab('homework')}
                                        className="btn btn-ghost"
                                        style={{ 
                                            fontSize: '0.8rem', 
                                            padding: '0.4rem 1rem', 
                                            borderRadius: '8px',
                                            background: parentTab === 'homework' ? 'var(--surface)' : 'transparent',
                                            color: parentTab === 'homework' ? 'var(--primary)' : 'var(--text-muted)'
                                        }}
                                    >
                                        {t('homework')}
                                    </button>
                                    <button 
                                        onClick={() => setParentTab('events')}
                                        className="btn btn-ghost"
                                        style={{ 
                                            fontSize: '0.8rem', 
                                            padding: '0.4rem 1rem', 
                                            borderRadius: '8px',
                                            background: parentTab === 'events' ? 'var(--surface)' : 'transparent',
                                            color: parentTab === 'events' ? 'var(--primary)' : 'var(--text-muted)'
                                        }}
                                    >
                                        {t('events')}
                                    </button>
                                </div>
                            </div>

                            {/* Daily Homework List */}
                            {parentTab === 'homework' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {filteredHomework.map(hw => (
                                        <div key={hw.id} style={{ padding: '1.25rem', borderLeft: '4px solid var(--secondary)', background: 'var(--background)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{hw.title}</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={12} /> {hw.date}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{hw.subject}</span>
                                                <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Ch. {hw.chapter}</span>
                                                {hw.pages && <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Pages: {hw.pages}</span>}
                                            </div>
                                            <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--primary)' }}>
                                                <FileText size={14} /> {language === 'gu' ? 'ગૃહકાર્ય PDF જુઓ' : 'View Homework PDF'}
                                            </button>
                                        </div>
                                    ))}
                                    {filteredHomework.length === 0 && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>{t('no_homework')}</p>
                                    )}
                                </div>
                            )}

                            {/* Events List */}
                            {parentTab === 'events' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {filteredEvents.map(e => (
                                        <div key={e.id} style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)', background: 'var(--background)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{e.title}</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={12} /> {e.date}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>{e.description}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.7rem', background: e.status === 'completed' ? '#d1fae5' : '#fef3c7', color: e.status === 'completed' ? '#065f46' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                                    {e.status === 'completed' ? t('completed') : t('upcoming')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>{t('no_events')}</p>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Attendance History chart below the tabs */}
                        <section className="card" style={{ padding: '1.5rem', minHeight: '300px', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Calendar size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('attendance_history')}</h3>
                            </div>
                            <div style={{ width: '100%', height: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getAttendanceChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
                                        <Legend />
                                        <Bar dataKey="Present" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Absent" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Fees Status Widget */}
                        <section className="card" style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <FileText size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('fees_status')}</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {fees.map(f => (
                                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'var(--background)' }}>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>₹{f.amount}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due: {f.dueDate}</p>
                                        </div>
                                        <span style={{ 
                                            background: f.status === 'paid' ? '#d1fae5' : '#fee2e2', 
                                            color: f.status === 'paid' ? '#065f46' : '#991b1b',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>
                                            {f.status === 'paid' ? t('paid') : t('unpaid')}
                                        </span>
                                    </div>
                                ))}
                                {fees.length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No fee records found.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ width: '450px', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                                    {t('parent_profile_title')}
                                </h3>
                                <button onClick={() => setIsProfileOpen(false)} className="btn btn-ghost" style={{ padding: '0.2rem' }}><X size={20} /></button>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '700' }}>{t('contact_info')}</h4>
                                <p style={{ fontSize: '0.95rem', margin: '0.25rem 0', color: 'var(--text-main)' }}><strong>{t('parent_name')}:</strong> {user.name}</p>
                                <p style={{ fontSize: '0.95rem', margin: '0.25rem 0', color: 'var(--text-main)' }}><strong>{t('email')}:</strong> {user.email || 'N/A'}</p>
                                <p style={{ fontSize: '0.95rem', margin: '0.25rem 0', color: 'var(--text-main)' }}><strong>{t('phone')}:</strong> {user.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '700' }}>{t('classroom')}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {children.map(child => (
                                        <div key={child.id} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{child.name} {child.surname || ''}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                                                {t('roll_no')}: {child.roll} | {t('std')}: {child.std} | {t('class')}: {child.class}
                                            </p>
                                        </div>
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

export default ParentDashboard;
