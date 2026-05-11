import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar                  from './components/Navbar';
import BrowsePage              from './pages/BrowsePage';
import ChefProfilePage         from './pages/ChefProfilePage';
import DashboardRouter         from './pages/DashboardRouter';
import ChefDashboardPage       from './pages/ChefDashboardPage';
import RegisterPage            from './pages/RegisterPage';
import LoginPage               from './pages/LoginPage';
import SignupPage              from './pages/SignupPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';

import './styles/global.css';
import './styles/buttons.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                      element={<BrowsePage />} />
          <Route path="/chef/:id"              element={<ChefProfilePage />} />

          {/* /dashboard is role-aware — sends customers and chefs to different views */}
          <Route path="/dashboard"             element={<DashboardRouter />} />

          {/* Direct link to the chef dashboard (useful for deep-links and the navbar) */}
          <Route path="/chef-dashboard"        element={<ChefDashboardPage />} />

          {/* Auth */}
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/signup"                element={<SignupPage />} />

          {/* Chef onboarding */}
          <Route path="/register"              element={<RegisterPage />} />

          {/* Booking confirmation */}
          <Route path="/booking/confirmation"  element={<BookingConfirmationPage />} />

          {/* Catch-all → home */}
          <Route path="*"                      element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
