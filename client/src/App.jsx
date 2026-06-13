import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/Teacher/Dashboard';
import ParentDashboard from './pages/Parent/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function AppContent() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('school_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('school_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={`/${user.role}`} /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/teacher/*"
          element={user?.role === 'teacher' ? <TeacherDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route
          path="/parent/*"
          element={user?.role === 'parent' ? <ParentDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/*"
          element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
