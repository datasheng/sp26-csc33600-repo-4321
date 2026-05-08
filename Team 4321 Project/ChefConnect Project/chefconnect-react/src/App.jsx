import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar         from './components/Navbar';
import BrowsePage     from './pages/BrowsePage';
import ChefProfilePage from './pages/ChefProfilePage';
import DashboardPage  from './pages/DashboardPage';
import RegisterPage   from './pages/RegisterPage';

import './styles/global.css';
import './styles/buttons.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<BrowsePage />} />
        <Route path="/chef/:id"   element={<ChefProfilePage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/register"   element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
