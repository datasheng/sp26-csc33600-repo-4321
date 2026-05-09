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
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                      element={<BrowsePage />} />
        <Route path="/chef/:id"              element={<ChefProfilePage />} />
        <Route path="/dashboard"             element={<DashboardPage />} />

        {/* Auth */}
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/signup"                element={<SignupPage />} />

        {/* Chef onboarding (kept at /register for the existing "Become a Chef" flow) */}
        <Route path="/register"              element={<RegisterPage />} />

        {/* Booking confirmation */}
        <Route path="/booking/confirmation"  element={<BookingConfirmationPage />} />

        {/* Catch-all → home (so unknown links never show a blank page) */}
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
