import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar                  from './components/Navbar';
import BrowsePage              from './pages/BrowsePage';
import ChefProfilePage         from './pages/ChefProfilePage';
import DashboardPage           from './pages/DashboardPage';
import RegisterPage            from './pages/RegisterPage';
import LoginPage               from './pages/LoginPage';
import SignupPage              from './pages/SignupPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';

import './styles/global.css';
import './styles/buttons.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  function handleLogin(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/"                     element={<BrowsePage />} />
        <Route path="/chef/:id"             element={<ChefProfilePage />} />
        <Route path="/dashboard"            element={user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/login"                element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup"               element={<SignupPage onLogin={handleLogin} />} />
        <Route path="/register"             element={<RegisterPage />} />
        <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
        <Route path="*"                     element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}