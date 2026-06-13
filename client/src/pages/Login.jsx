import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { login as loginApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { t, language, setLanguage } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginApi({ email, password });
            onLogin(res.data);
        } catch (err) {
            setError(language === 'gu' ? 'અમાન્ય ઓળખપત્રો. તમારી ઇમેઇલ/ફોન અને પાસવર્ડ તપાસો.' : 'Invalid credentials. Check your email/phone and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
            {/* Left side - Visual Background */}
            <div style={{
                flex: 1,
                backgroundImage: 'url(/school-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '5rem',
                color: 'white'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(139, 26, 26, 0.9) 0%, rgba(212, 168, 67, 0.85) 100%)',
                    zIndex: 1
                }} />
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
                        <img 
                            src="/logo.png" 
                            alt="School Logo" 
                            style={{ 
                                height: '64px', 
                                width: '64px', 
                                objectFit: 'contain',
                                background: 'white', 
                                padding: '6px', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }} 
                        />
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {t('school_name')}
                        </h2>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem', color: 'white', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {t('login_tagline')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: '0.95', textShadow: '0 2px 4px rgba(0,0,0,0.2)', maxWidth: '600px' }}>
                        {t('login_desc')}
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div style={{ width: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', background: 'var(--background)' }}>
                {/* Language switcher top right */}
                <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                    <button 
                        onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}
                        className="btn btn-ghost"
                        style={{ 
                            padding: '0.5rem 1.25rem', 
                            fontSize: '0.875rem', 
                            border: '1px solid var(--border)', 
                            borderRadius: '10px',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            fontWeight: '600',
                            boxShadow: 'var(--shadow)'
                        }}
                    >
                        {language === 'en' ? 'ગુજરાતી' : 'English'}
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', boxShadow: 'var(--shadow)' }}
                >
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {t('account_login')}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        {t('login_subtitle')}
                    </p>

                    {error && (
                        <div style={{ 
                            background: '#fee2e2', 
                            color: '#991b1b', 
                            padding: '0.75rem 1rem', 
                            borderRadius: '10px', 
                            marginBottom: '1.5rem', 
                            fontSize: '0.875rem',
                            border: '1px solid #fca5a5'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                {t('email_or_phone')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('email_or_phone')}
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                {t('password')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading} 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                padding: '1rem',
                                fontSize: '1rem',
                                color: '#ffffff'
                            }}
                        >
                            {loading ? t('logging_in') : t('sign_in')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div style={{ 
                        marginTop: '2.5rem', 
                        textAlign: 'center', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.8rem',
                        lineHeight: '1.6',
                        background: 'var(--primary-light)',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px dashed var(--border)'
                    }}>
                        {t('testing_accounts')}<br />
                        <strong>admin@school.com</strong> / admin123<br />
                        <strong>teacher@school.com</strong> / teacher123<br />
                        <strong>parent@school.com</strong> / parent123
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
