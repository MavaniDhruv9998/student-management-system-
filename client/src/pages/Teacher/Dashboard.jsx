import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, FileUp, FileText, Calendar, LogOut, Sun, Moon, Globe, Users } from 'lucide-react';
import Attendance from './Attendance';
import AttendanceHistory from './AttendanceHistory';
import Events from './Events';
import Homework from './Homework';
import { useTheme } from '../../context/ThemeContext';

const TeacherDashboard = ({ user, onLogout }) => {
    const location = useLocation();
    const { theme, toggleTheme, language, setLanguage, t } = useTheme();

    const menuItems = [
        { id: '', labelKey: 'dashboard', icon: LayoutDashboard },
        { id: 'attendance', labelKey: 'attendance', icon: UserCheck },
        { id: 'attendance-history', labelKey: 'attendance_history', icon: FileText },
        { id: 'homework', labelKey: 'homework', icon: FileUp },
        { id: 'events', labelKey: 'events', icon: Calendar },
    ];

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

                <nav style={{ flex: 1 }}>
                    {menuItems.map((item) => {
                        const path = `/teacher${item.id ? `/${item.id}` : ''}`;
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={item.id}
                                to={path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={20} />
                                {t(item.labelKey)}
                            </Link>
                        );
                    })}
                </nav>

                <button onClick={onLogout} className="btn btn-ghost nav-link" style={{ width: '100%', marginTop: 'auto', justifyContent: 'flex-start', color: '#ef4444' }}>
                    <LogOut size={18} />
                    {t('logout')}
                </button>
            </aside>

            {/* Main Area */}
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                            {t('teacher_console')}
                        </span>
                        <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
                            {t('good_day')}, {user.name}
                        </h2>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

                <div className="routes-container">
                    <Routes>
                        <Route path="/" element={<TeacherHome user={user} />} />
                        <Route path="/attendance" element={<Attendance user={user} />} />
                        <Route path="/attendance-history" element={<AttendanceHistory user={user} />} />
                        <Route path="/homework" element={<Homework user={user} />} />
                        <Route path="/events" element={<Events user={user} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const TeacherHome = () => {
    const { t } = useTheme();
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><UserCheck size={32} /></div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('avg_attendance')}</h4>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>94.2%</div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ color: '#8b5cf6', marginBottom: '1rem' }}><Users size={32} /></div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('total_students')}</h4>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>32</div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><FileUp size={32} /></div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('homework_uploaded')}</h4>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>18</div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><Calendar size={32} /></div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('active_events')}</h4>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>5</div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
